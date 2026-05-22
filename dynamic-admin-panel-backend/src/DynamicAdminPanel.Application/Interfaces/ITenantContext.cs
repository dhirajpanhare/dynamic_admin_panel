namespace DynamicAdminPanel.Application.Interfaces;

public interface ITenantContext
{
    int? TenantId { get; }
    string? TenantName { get; }
    string? ConnectionString { get; }
    string? Schema { get; }
    void SetTenant(int tenantId, string tenantName, string? connectionString, string? schema);
    void Clear();
}
