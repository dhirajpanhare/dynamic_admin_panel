using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// Maps a user to a tenant and optionally to an organization within that tenant
/// </summary>
public class UserTenant : BaseEntity<int>
{
    public int UserId { get; set; }
    public int TenantId { get; set; }
    public int? OrganizationId { get; set; }

    /// <summary>True if this is the user's default/primary tenant</summary>
    public bool IsPrimary { get; set; } = false;
    public string Status { get; set; } = "Active";

    // Navigation properties
    public virtual User? User { get; set; }
    public virtual Tenant? Tenant { get; set; }
    public virtual Organization? Organization { get; set; }
}
