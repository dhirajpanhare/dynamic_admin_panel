using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// In-app notification sent to a user. Email/SMS notifications are sent separately
/// but reference the same template slug for consistency.
/// </summary>
public class Notification : BaseEntity<int>
{
    public int TenantId { get; set; }
    public int RecipientUserId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    /// <summary>"info" | "success" | "warning" | "error"</summary>
    public string Type { get; set; } = "info";

    /// <summary>Optional deep-link within the app: "/entities/orders/42"</summary>
    public string? ActionUrl { get; set; }

    /// <summary>Optional icon override (Lucide icon name)</summary>
    public string? Icon { get; set; }

    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }

    /// <summary>Source that generated this notification: "workflow" | "system" | "manual"</summary>
    public string Source { get; set; } = "system";

    /// <summary>Reference to the workflow instance that triggered this, if applicable</summary>
    public int? WorkflowInstanceId { get; set; }

    // Navigation
    public virtual User? RecipientUser { get; set; }
}
