using Dapper;
using DynamicAdminPanel.Application.Interfaces;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace DynamicAdminPanel.Infrastructure.Persistence;

public class StoredProcedureExecutor : IStoredProcedureExecutor
{
    private readonly string _connectionString;
    private readonly ITenantContext _tenantContext;

    public StoredProcedureExecutor(IConfiguration configuration, ITenantContext tenantContext)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string not found");
        _tenantContext = tenantContext;
    }

    private string GetConnectionString()
    {
        // Use tenant-specific connection string if available
        return _tenantContext.ConnectionString ?? _connectionString;
    }

    public async Task<IEnumerable<T>> ExecuteQueryAsync<T>(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = new SqlConnection(GetConnectionString());
        await connection.OpenAsync(cancellationToken);
        
        return await connection.QueryAsync<T>(
            storedProcedure,
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<T?> ExecuteQueryFirstOrDefaultAsync<T>(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = new SqlConnection(GetConnectionString());
        await connection.OpenAsync(cancellationToken);
        
        return await connection.QueryFirstOrDefaultAsync<T>(
            storedProcedure,
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<int> ExecuteAsync(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = new SqlConnection(GetConnectionString());
        await connection.OpenAsync(cancellationToken);
        
        return await connection.ExecuteAsync(
            storedProcedure,
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<T?> ExecuteScalarAsync<T>(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default)
    {
        using var connection = new SqlConnection(GetConnectionString());
        await connection.OpenAsync(cancellationToken);
        
        return await connection.ExecuteScalarAsync<T>(
            storedProcedure,
            parameters,
            commandType: CommandType.StoredProcedure
        );
    }
}
