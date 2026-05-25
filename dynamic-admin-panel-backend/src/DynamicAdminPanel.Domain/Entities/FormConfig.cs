using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// Controls how the create/edit form for an entity is laid out.
/// Stores JSON layout config that DynamicForm on the frontend reads.
/// </summary>
public class FormConfig : BaseEntity<int>
{
    public int EntityMetadataId { get; set; }

    /// <summary>
    /// JSON layout: sections with field groups
    /// e.g. [{"title": "Basic Info", "columns": 2, "fields": ["name", "email"]}]
    /// </summary>
    public string LayoutJson { get; set; } = "[]";

    /// <summary>Submit button label</summary>
    public string SubmitLabel { get; set; } = "Save";

    /// <summary>Cancel button label</summary>
    public string CancelLabel { get; set; } = "Cancel";

    // Navigation
    public virtual EntityMetadata? EntityMetadata { get; set; }
}
