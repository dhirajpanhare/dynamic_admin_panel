using System.Text;
using Dapper;
using DynamicAdminPanel.Application.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace DynamicAdminPanel.Infrastructure.DynamicEngine;

/// <summary>
/// Builds parameterized SQL queries at runtime from entity metadata.
/// Uses Dapper for fast execution. All queries use SQL parameters to prevent injection.
/// </summary>
public class DynamicQueryBuilder : IDynamicQueryBuilder
{
    private readonly string _defaultConnectionString;
    private readonly ITenantContext _tenantContext;

    public DynamicQueryBuilder(IConfiguration configuration, ITenantContext tenantContext)
    {
        _defaultConnectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection is not configured");
        _tenantContext = tenantContext;
    }

    // ── Public interface ──────────────────────────────────────────────────────

    public async Task<DynamicQueryResult> GetListAsync(DynamicListQuery q, CancellationToken ct = default)
    {
        using var conn = OpenConnection();
        var table = QualifiedTable(q.Schema, q.TableName);
        var cols = BuildSelectColumns(q.AllowedColumns);
        var where = BuildWhere(q, out var whereParams);
        var order = BuildOrderBy(q.SortBy, q.SortDirection, q.AllowedColumns);

        // Count query
        var countSql = $"SELECT COUNT(*) FROM {table} {where}";
        var totalCount = await conn.ExecuteScalarAsync<int>(
            new CommandDefinition(countSql, whereParams, cancellationToken: ct));

        // Data query with pagination
        var offset = (q.Page - 1) * q.PageSize;
        var dataSql = $"""
            SELECT {cols}
            FROM {table}
            {where}
            {order}
            OFFSET @_Offset ROWS FETCH NEXT @_PageSize ROWS ONLY
            """;

        var dataParams = new DynamicParameters(whereParams);
        dataParams.Add("_Offset", offset);
        dataParams.Add("_PageSize", q.PageSize);

        var rows = await conn.QueryAsync<dynamic>(
            new CommandDefinition(dataSql, dataParams, cancellationToken: ct));

        var items = rows
            .Select(row => ((IDictionary<string, object>)row)
                .ToDictionary(kv => kv.Key, kv => (object?)kv.Value))
            .ToList();

        return new DynamicQueryResult(items, totalCount, q.Page, q.PageSize);
    }

    public async Task<Dictionary<string, object?>?> GetByIdAsync(DynamicSingleQuery q, CancellationToken ct = default)
    {
        using var conn = OpenConnection();
        var table = QualifiedTable(q.Schema, q.TableName);
        var cols = BuildSelectColumns(q.AllowedColumns);
        var softDeleteFilter = q.EnableSoftDelete ? "AND DeleteDateTime IS NULL" : string.Empty;

        var sql = $"""
            SELECT {cols}
            FROM {table}
            WHERE [{q.PrimaryKeyColumn}] = @_Id {softDeleteFilter}
            """;

        var row = await conn.QueryFirstOrDefaultAsync<dynamic>(
            new CommandDefinition(sql, new { _Id = q.Id }, cancellationToken: ct));

        if (row is null) return null;
        return ((IDictionary<string, object>)row)
            .ToDictionary(kv => kv.Key, kv => (object?)kv.Value);
    }

    public async Task<Dictionary<string, object?>> CreateAsync(DynamicWriteQuery q, CancellationToken ct = default)
    {
        using var conn = OpenConnection();
        var table = QualifiedTable(q.Schema, q.TableName);

        // Only insert allowed columns that are present in the payload
        var insertCols = q.Data.Keys
            .Where(k => q.AllowedColumns.Contains(k, StringComparer.OrdinalIgnoreCase))
            .ToList();

        if (insertCols.Count == 0)
            throw new InvalidOperationException("No writable fields provided.");

        var colList = string.Join(", ", insertCols.Select(c => $"[{c}]"));
        var paramList = string.Join(", ", insertCols.Select(c => $"@{c}"));

        var sql = $"""
            INSERT INTO {table} ({colList})
            OUTPUT INSERTED.*
            VALUES ({paramList});
            """;

        var parameters = new DynamicParameters();
        foreach (var col in insertCols)
            parameters.Add(col, q.Data[col]);

        var row = await conn.QueryFirstOrDefaultAsync<dynamic>(
            new CommandDefinition(sql, parameters, cancellationToken: ct));

        return row is null
            ? new Dictionary<string, object?>()
            : ((IDictionary<string, object>)row).ToDictionary(kv => kv.Key, kv => (object?)kv.Value);
    }

    public async Task<Dictionary<string, object?>> UpdateAsync(DynamicWriteQuery q, CancellationToken ct = default)
    {
        if (q.Id is null)
            throw new ArgumentNullException(nameof(q.Id), "Id is required for update.");

        using var conn = OpenConnection();
        var table = QualifiedTable(q.Schema, q.TableName);

        var updateCols = q.Data.Keys
            .Where(k => q.AllowedColumns.Contains(k, StringComparer.OrdinalIgnoreCase)
                     && !k.Equals(q.PrimaryKeyColumn, StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (updateCols.Count == 0)
            throw new InvalidOperationException("No writable fields provided for update.");

        var setClauses = string.Join(", ", updateCols.Select(c => $"[{c}] = @{c}"));

        var sql = $"""
            UPDATE {table}
            SET {setClauses}, [UpdateDateTime] = GETUTCDATE()
            OUTPUT INSERTED.*
            WHERE [{q.PrimaryKeyColumn}] = @_Id;
            """;

        var parameters = new DynamicParameters();
        parameters.Add("_Id", q.Id);
        foreach (var col in updateCols)
            parameters.Add(col, q.Data[col]);

        var row = await conn.QueryFirstOrDefaultAsync<dynamic>(
            new CommandDefinition(sql, parameters, cancellationToken: ct));

        return row is null
            ? new Dictionary<string, object?>()
            : ((IDictionary<string, object>)row).ToDictionary(kv => kv.Key, kv => (object?)kv.Value);
    }

    public async Task DeleteAsync(DynamicDeleteQuery q, CancellationToken ct = default)
    {
        using var conn = OpenConnection();
        var table = QualifiedTable(q.Schema, q.TableName);

        string sql = q.SoftDelete
            ? $"UPDATE {table} SET [DeleteDateTime] = GETUTCDATE() WHERE [{q.PrimaryKeyColumn}] = @_Id"
            : $"DELETE FROM {table} WHERE [{q.PrimaryKeyColumn}] = @_Id";

        await conn.ExecuteAsync(new CommandDefinition(sql, new { _Id = q.Id }, cancellationToken: ct));
    }

    public async Task<int> CountAsync(DynamicCountQuery q, CancellationToken ct = default)
    {
        using var conn = OpenConnection();
        var table = QualifiedTable(q.Schema, q.TableName);
        var listQ = new DynamicListQuery(q.TableName, q.Schema, q.PrimaryKeyColumn,
            q.EnableSoftDelete, new[] { q.PrimaryKeyColumn }, 1, 1,
            null, "asc", q.Search, q.SearchableColumns, q.Filters);
        var where = BuildWhere(listQ, out var parameters);
        var sql = $"SELECT COUNT(*) FROM {table} {where}";
        return await conn.ExecuteScalarAsync<int>(new CommandDefinition(sql, parameters, cancellationToken: ct));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private SqlConnection OpenConnection()
    {
        var cs = _tenantContext.ConnectionString ?? _defaultConnectionString;
        return new SqlConnection(cs);
    }

    private static string QualifiedTable(string schema, string table) =>
        $"[{schema}].[{table}]";

    private static string BuildSelectColumns(IReadOnlyList<string> cols)
    {
        if (cols.Count == 0) return "*";
        return string.Join(", ", cols.Select(c => $"[{c}]"));
    }

    private static string BuildOrderBy(string? sortBy, string direction, IReadOnlyList<string> allowed)
    {
        if (string.IsNullOrWhiteSpace(sortBy)) return "ORDER BY (SELECT NULL)";

        // Validate sortBy against allowed columns to prevent injection
        var match = allowed.FirstOrDefault(c => c.Equals(sortBy, StringComparison.OrdinalIgnoreCase));
        if (match is null) return "ORDER BY (SELECT NULL)";

        var dir = direction.Equals("desc", StringComparison.OrdinalIgnoreCase) ? "DESC" : "ASC";
        return $"ORDER BY [{match}] {dir}";
    }

    private static string BuildWhere(DynamicListQuery q, out DynamicParameters parameters)
    {
        parameters = new DynamicParameters();
        var clauses = new List<string>();

        // Soft delete filter
        if (q.EnableSoftDelete)
            clauses.Add("DeleteDateTime IS NULL");

        // Full-text search across searchable columns
        if (!string.IsNullOrWhiteSpace(q.Search) && q.SearchableColumns.Count > 0)
        {
            var searchParts = q.SearchableColumns
                .Where(c => q.AllowedColumns.Contains(c, StringComparer.OrdinalIgnoreCase))
                .Select(c => $"CAST([{c}] AS NVARCHAR(MAX)) LIKE @_Search")
                .ToList();

            if (searchParts.Count > 0)
            {
                clauses.Add($"({string.Join(" OR ", searchParts)})");
                parameters.Add("_Search", $"%{q.Search}%");
            }
        }

        // Column-level filters (all are equality checks or LIKE for strings)
        if (q.Filters is not null)
        {
            int i = 0;
            foreach (var (key, value) in q.Filters)
            {
                // Validate the column name against the allow-list
                var col = q.AllowedColumns
                    .FirstOrDefault(c => c.Equals(key, StringComparison.OrdinalIgnoreCase));
                if (col is null) continue;

                var paramName = $"_F{i}";
                clauses.Add($"[{col}] = @{paramName}");
                parameters.Add(paramName, value);
                i++;
            }
        }

        return clauses.Count > 0
            ? "WHERE " + string.Join(" AND ", clauses)
            : string.Empty;
    }
}
