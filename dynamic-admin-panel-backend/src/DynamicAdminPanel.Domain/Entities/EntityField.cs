using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// Defines a single field within an entity — drives form rendering, validation,
/// column display, and data type handling in the dynamic engine.
/// </summary>
public class EntityField : BaseEntity<int>
{
    public int EntityMetadataId { get; set; }

    /// <summary>Column name in the database table: "first_name"</summary>
    public string ColumnName { get; set; } = string.Empty;

    /// <summary>API/form field name: "firstName" or "first_name"</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Human-readable label: "First Name"</summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// Field type controls which React component renders it.
    /// Values: text | email | password | url | slug | color | number |
    ///         textarea | json | select | radio | multi-select | checkbox-group |
    ///         checkbox | switch | date | datetime | time | date-range |
    ///         file | image | rich-text | relation
    /// </summary>
    public string FieldType { get; set; } = "text";

    public bool IsRequired { get; set; } = false;
    public bool IsReadonly { get; set; } = false;
    public bool IsHidden { get; set; } = false;

    /// <summary>Whether this field appears in list/table views</summary>
    public bool ShowInList { get; set; } = true;

    /// <summary>Whether this field is sortable in list views</summary>
    public bool IsSortable { get; set; } = true;

    /// <summary>Whether this field can be searched/filtered</summary>
    public bool IsFilterable { get; set; } = false;

    public string? Placeholder { get; set; }
    public string? HelpText { get; set; }
    public string? DefaultValue { get; set; }

    /// <summary>Display order within the form and list</summary>
    public int SortOrder { get; set; } = 0;

    /// <summary>
    /// JSON: validation rules e.g. {"min": 1, "max": 100, "pattern": "^[a-z]+$"}
    /// </summary>
    public string? ValidationRules { get; set; }

    /// <summary>
    /// JSON array for select/radio/multi-select:
    /// [{"label": "Active", "value": "active"}, {"label": "Inactive", "value": "inactive"}]
    /// </summary>
    public string? Options { get; set; }

    /// <summary>
    /// JSON for relation fields: {"entity": "categories", "displayField": "name", "valueField": "id"}
    /// </summary>
    public string? RelationConfig { get; set; }

    /// <summary>
    /// JSON for conditional visibility:
    /// {"field": "status", "operator": "equals", "value": "published"}
    /// </summary>
    public string? ConditionalVisibility { get; set; }

    // Navigation
    public virtual EntityMetadata? EntityMetadata { get; set; }
}
