using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// Hierarchical organizational unit within a tenant (departments, teams, branches)
/// </summary>
public class Organization : BaseEntity<int>
{
    public int TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int? ParentOrganizationId { get; set; }

    /// <summary>Materialized path for efficient tree queries e.g. "/1/5/12/"</summary>
    public string Path { get; set; } = "/";
    public int Depth { get; set; } = 0;
    public int SortOrder { get; set; } = 0;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string Status { get; set; } = "Active";

    // Navigation properties
    public virtual Tenant? Tenant { get; set; }
    public virtual Organization? ParentOrganization { get; set; }
    public virtual ICollection<Organization> ChildOrganizations { get; set; } = new List<Organization>();
    public virtual ICollection<UserTenant> UserTenants { get; set; } = new List<UserTenant>();
}
