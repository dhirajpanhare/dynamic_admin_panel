using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

public class User : BaseEntity<int>
{
    public string UserName { get; set; } = string.Empty;
    public string UserMailAddress { get; set; } = string.Empty;
    public string? UserPhoneNumber { get; set; }
    public string Password { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public bool EmailVerified { get; set; } = false;
    public bool TwoFactorEnabled { get; set; } = false;
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockoutEnd { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string? LastLoginIP { get; set; }
    public string? ProfilePictureUrl { get; set; }

    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<UserLoginLog> LoginLogs { get; set; } = new List<UserLoginLog>();
}
