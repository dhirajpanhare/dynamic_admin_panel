using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// A named dashboard that holds a collection of widgets.
/// Tenants can have multiple dashboards (e.g. "Sales Overview", "HR Metrics").
/// </summary>
public class DashboardConfig : BaseEntity<int>
{
    public int TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsDefault { get; set; } = false;
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual Tenant? Tenant { get; set; }
    public virtual ICollection<DashboardWidget> Widgets { get; set; } = new List<DashboardWidget>();
}
