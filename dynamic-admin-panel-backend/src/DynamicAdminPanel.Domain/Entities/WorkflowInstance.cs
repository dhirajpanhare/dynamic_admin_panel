using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// A live execution of a workflow definition for a specific entity record.
/// Tracks the current step, status, and execution history.
/// </summary>
public class WorkflowInstance : BaseEntity<int>
{
    public int WorkflowDefinitionId { get; set; }
    public int TenantId { get; set; }

    /// <summary>Entity slug of the record that triggered this instance</summary>
    public string EntitySlug { get; set; } = string.Empty;

    /// <summary>Primary key of the entity record that triggered this instance</summary>
    public string EntityRecordId { get; set; } = string.Empty;

    /// <summary>Current step order being processed</summary>
    public int CurrentStep { get; set; } = 1;

    /// <summary>"pending" | "in_progress" | "approved" | "rejected" | "completed" | "cancelled"</summary>
    public string Status { get; set; } = "pending";

    /// <summary>User who started this instance</summary>
    public int? InitiatedByUserId { get; set; }

    public DateTime? CompletedAt { get; set; }

    /// <summary>JSON snapshot of the entity record at trigger time</summary>
    public string? ContextJson { get; set; }

    // Navigation
    public virtual WorkflowDefinition? WorkflowDefinition { get; set; }
    public virtual ICollection<WorkflowLog> Logs { get; set; } = new List<WorkflowLog>();
}
