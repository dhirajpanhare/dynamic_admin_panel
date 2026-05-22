using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

public class UserRole : BaseEntity<int>
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
    public int? OrganizationId { get; set; }
    public DateTime? ExpiresAt { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
}
