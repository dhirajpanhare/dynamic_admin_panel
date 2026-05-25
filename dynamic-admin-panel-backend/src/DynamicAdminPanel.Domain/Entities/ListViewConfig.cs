using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// Defines which columns appear in the entity's list/table view,
/// their display order, sort/filter behavior, and column width.
/// </summary>
public class ListViewConfig : BaseEntity<int>
{
    public int EntityMetadataId { get; set; }

    /// <summary>
    /// JSON array of column definitions:
    /// [{"field": "name", "label": "Name", "sortable": true, "filterable": true, "width": 200, "type": "text"}]
    /// </summary>
    public string ColumnsJson { get; set; } = "[]";

    /// <summary>Default sort column name</summary>
    public string? DefaultSortField { get; set; }

    /// <summary>"asc" or "desc"</summary>
    public string DefaultSortDirection { get; set; } = "asc";

    /// <summary>Number of rows per page</summary>
    public int DefaultPageSize { get; set; } = 20;

    /// <summary>
    /// JSON array of quick-filter definitions shown above the table:
    /// [{"field": "status", "label": "Status", "type": "select", "options": [...]}]
    /// </summary>
    public string? QuickFiltersJson { get; set; }

    // Navigation
    public virtual EntityMetadata? EntityMetadata { get; set; }
}
