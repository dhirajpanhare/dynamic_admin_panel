using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// Audit trail for every action taken on a workflow instance step.
/// </summary>
public class WorkflowLog : BaseEntity<int>
{
    public int WorkflowInstanceId { get; set; }
    public int StepOrder { get; set; }
    public int? ActorUserId { get; set; }

    /// <summary>"approved" | "rejected" | "skipped" | "escalated" | "auto_completed"</summary>
    public string Action { get; set; } = string.Empty;

    public string? Comment { get; set; }

    // Navigation
    public virtual WorkflowInstance? WorkflowInstance { get; set; }
}
