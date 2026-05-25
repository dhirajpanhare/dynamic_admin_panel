using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// A single step within a workflow definition.
/// Steps are executed in order; each step has a type and config JSON.
/// </summary>
public class WorkflowStep : BaseEntity<int>
{
    public int WorkflowDefinitionId { get; set; }
    public string Name { get; set; } = string.Empty;

    /// <summary>Step execution order (1, 2, 3...)</summary>
    public int StepOrder { get; set; }

    /// <summary>
    /// Step type determines what the engine does:
    /// "approval" | "notification" | "condition" | "action" | "delay" | "webhook"
    /// </summary>
    public string StepType { get; set; } = "approval";

    /// <summary>
    /// JSON step config:
    /// approval: {"assignee_field": "manager_id", "deadline_hours": 48}
    /// notification: {"template": "order_approved", "channel": "email"}
    /// condition: {"field": "amount", "operator": "gt", "value": 1000, "trueBranch": 3, "falseBranch": 4}
    /// webhook: {"url": "https://...", "method": "POST", "payload": {...}}
    /// </summary>
    public string ConfigJson { get; set; } = "{}";

    // Navigation
    public virtual WorkflowDefinition? WorkflowDefinition { get; set; }
}
