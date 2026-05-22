using System.Data;

namespace DynamicAdminPanel.Application.Interfaces;

public interface IStoredProcedureExecutor
{
    Task<IEnumerable<T>> ExecuteQueryAsync<T>(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default);
    Task<T?> ExecuteQueryFirstOrDefaultAsync<T>(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default);
    Task<int> ExecuteAsync(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default);
    Task<T?> ExecuteScalarAsync<T>(string storedProcedure, object? parameters = null, CancellationToken cancellationToken = default);
}
