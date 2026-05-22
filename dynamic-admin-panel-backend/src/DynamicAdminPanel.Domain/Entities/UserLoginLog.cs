using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

public class UserLoginLog : BaseEntity<int>
{
    public int UserId { get; set; }
    public string? LoginIPAddress { get; set; }
    public string? UserAgent { get; set; }
    public string UserType { get; set; } = string.Empty;
    public string? LoginWithEmail { get; set; }
    public string? LoginWithNumber { get; set; }
    public bool IsSuccessful { get; set; } = true;
    public string? FailureReason { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
}
