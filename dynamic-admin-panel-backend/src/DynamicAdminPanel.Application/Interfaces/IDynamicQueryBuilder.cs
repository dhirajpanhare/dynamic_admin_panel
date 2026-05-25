namespace DynamicAdminPanel.Application.Interfaces;

/// <summary>
/// Builds and executes dynamic parameterized SQL queries from entity metadata.
/// This is the heart of the metadata-driven engine — no stored procedures needed.
/// </summary>
public interface IDynamicQueryBuilder
{
    /// <summary>Returns a paginated list of records for the given entity.</summary>
    Task<DynamicQueryResult> GetListAsync(DynamicListQuery query, CancellationToken ct = default);

    /// <summary>Returns a single record by its primary key.</summary>
    Task<Dictionary<string, object?>?> GetByIdAsync(DynamicSingleQuery query, CancellationToken ct = default);

    /// <summary>Inserts a new record and returns the new row.</summary>
    Task<Dictionary<string, object?>> CreateAsync(DynamicWriteQuery query, CancellationToken ct = default);

    /// <summary>Updates an existing record and returns the updated row.</summary>
    Task<Dictionary<string, object?>> UpdateAsync(DynamicWriteQuery query, CancellationToken ct = default);

    /// <summary>Deletes a record (soft or hard based on entity config).</summary>
    Task DeleteAsync(DynamicDeleteQuery query, CancellationToken ct = default);

    /// <summary>Returns count of records matching a filter.</summary>
    Task<int> CountAsync(DynamicCountQuery query, CancellationToken ct = default);
}

// ── Query parameter objects ───────────────────────────────────────────────────

public record DynamicListQuery(
    string TableName,
    string Schema,
    string PrimaryKeyColumn,
    bool EnableSoftDelete,
    IReadOnlyList<string> AllowedColumns,
    int Page,
    int PageSize,
    string? SortBy,
    string SortDirection,
    string? Search,
    IReadOnlyList<string> SearchableColumns,
    IReadOnlyDictionary<string, string>? Filters
);

public record DynamicSingleQuery(
    string TableName,
    string Schema,
    string PrimaryKeyColumn,
    bool EnableSoftDelete,
    IReadOnlyList<string> AllowedColumns,
    object Id
);

public record DynamicWriteQuery(
    string TableName,
    string Schema,
    string PrimaryKeyColumn,
    IReadOnlyList<string> AllowedColumns,
    IDictionary<string, object?> Data,
    object? Id = null  // null = create, set = update
);

public record DynamicDeleteQuery(
    string TableName,
    string Schema,
    string PrimaryKeyColumn,
    bool SoftDelete,
    object Id
);

public record DynamicCountQuery(
    string TableName,
    string Schema,
    string PrimaryKeyColumn,
    bool EnableSoftDelete,
    string? Search,
    IReadOnlyList<string> SearchableColumns,
    IReadOnlyDictionary<string, string>? Filters
);

public record DynamicQueryResult(
    IReadOnlyList<Dictionary<string, object?>> Items,
    int TotalCount,
    int Page,
    int PageSize
);
