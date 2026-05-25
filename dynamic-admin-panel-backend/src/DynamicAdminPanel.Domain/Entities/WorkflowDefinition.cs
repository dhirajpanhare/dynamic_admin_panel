using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// Defines a reusable workflow template (e.g. "Order Approval", "Leave Request").
/// A workflow is a sequence of steps triggered by an entity event.
/// </summary>
public class WorkflowDefinition : BaseEntity<int>
{
    public int TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>Entity slug that triggers this workflow: "orders", "leave-requests"</summary>
    public string? TriggerEntity { get; set; }

    /// <summary>Trigger event: "created" | "updated" | "deleted" | "status_changed" | "manual"</summary>
    public string TriggerEvent { get; set; } = "created";

    /// <summary>
    /// JSON trigger condition: {"field": "status", "operator": "equals", "value": "pending"}
    /// </summary>
    public string? TriggerConditionJson { get; set; }

    /// <summary>"active" | "paused" | "draft"</summary>
    public string Status { get; set; } = "draft";

    // Navigation
    public virtual Tenant? Tenant { get; set; }
    public virtual ICollection<WorkflowStep> Steps { get; set; } = new List<WorkflowStep>();
    public virtual ICollection<WorkflowInstance> Instances { get; set; } = new List<WorkflowInstance>();
}
