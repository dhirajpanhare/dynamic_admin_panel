using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// Refresh token stored in the database.
/// Enables token rotation and revocation — prevents replay attacks.
/// </summary>
public class RefreshToken : BaseEntity<int>
{
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
    public DateTime? RevokedAt { get; set; }

    /// <summary>IP that issued this token</summary>
    public string? IssuedFromIp { get; set; }

    // Navigation
    public virtual User? User { get; set; }
}
