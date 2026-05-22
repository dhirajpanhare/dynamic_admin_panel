using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

public class RolePermission : BaseEntity<int>
{
    public int RoleId { get; set; }
    public int PermissionId { get; set; }

    // Navigation properties
    public virtual Role Role { get; set; } = null!;
    public virtual Permission Permission { get; set; } = null!;
}
