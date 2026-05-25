using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// A single widget on a dashboard — a stat card, chart, table, or custom component.
/// Position and size are stored so the frontend can render a drag-drop grid layout.
/// </summary>
public class DashboardWidget : BaseEntity<int>
{
    public int DashboardConfigId { get; set; }

    /// <summary>Widget renderer to use: "metric" | "stat" | "chart" | "line-chart" | "bar-chart" | "pie-chart" | "table"</summary>
    public string WidgetType { get; set; } = "metric";

    public string Title { get; set; } = string.Empty;

    /// <summary>Grid column start (1-based)</summary>
    public int PositionX { get; set; } = 0;

    /// <summary>Grid row start (1-based)</summary>
    public int PositionY { get; set; } = 0;

    /// <summary>Number of columns this widget spans</summary>
    public int Width { get; set; } = 3;

    /// <summary>Number of rows this widget spans</summary>
    public int Height { get; set; } = 2;

    /// <summary>
    /// JSON widget-specific config:
    /// For metric: {"valueField": "total_sales", "format": "currency", "color": "green"}
    /// For chart:  {"chartType": "line", "xField": "date", "yField": "revenue"}
    /// </summary>
    public string ConfigJson { get; set; } = "{}";

    /// <summary>
    /// JSON data source config:
    /// {"entity": "orders", "aggregation": "sum", "field": "total_amount", "filters": {"status": "completed"}}
    /// </summary>
    public string? DataSourceJson { get; set; }

    /// <summary>Auto-refresh interval in seconds (0 = no refresh)</summary>
    public int RefreshIntervalSeconds { get; set; } = 0;

    public int SortOrder { get; set; } = 0;

    // Navigation
    public virtual DashboardConfig? DashboardConfig { get; set; }
}
