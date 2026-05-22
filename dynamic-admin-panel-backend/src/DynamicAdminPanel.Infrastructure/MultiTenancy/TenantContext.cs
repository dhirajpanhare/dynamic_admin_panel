using DynamicAdminPanel.Application.Interfaces;

namespace DynamicAdminPanel.Infrastructure.MultiTenancy;

public class TenantContext : ITenantContext
{
    private int? _tenantId;
    private string? _tenantName;
    private string? _connectionString;
    private string? _schema;

    public int? TenantId => _tenantId;
    public string? TenantName => _tenantName;
    public string? ConnectionString => _connectionString;
    public string? Schema => _schema;

    public void SetTenant(int tenantId, string tenantName, string? connectionString, string? schema)
    {
        _tenantId = tenantId;
        _tenantName = tenantName;
        _connectionString = connectionString;
        _schema = schema;
    }

    public void Clear()
    {
        _tenantId = null;
        _tenantName = null;
        _connectionString = null;
        _schema = null;
    }
}
