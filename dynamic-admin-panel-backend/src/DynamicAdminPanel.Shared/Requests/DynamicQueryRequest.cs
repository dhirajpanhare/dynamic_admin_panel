namespace DynamicAdminPanel.Shared.Requests;

/// <summary>
/// Dynamic query request with flexible filtering, sorting, and pagination
/// </summary>
public class DynamicQueryRequest : PagedRequest
{
    /// <summary>
    /// Dynamic filters as key-value pairs (e.g., status=active, category=electronics)
    /// Extends the base Filters property with additional functionality
    /// </summary>
    public new Dictionary<string, string>? Filters { get; set; }

    /// <summary>
    /// Date range filter start
    /// </summary>
    public DateTime? DateFrom { get; set; }

    /// <summary>
    /// Date range filter end
    /// </summary>
    public DateTime? DateTo { get; set; }

    /// <summary>
    /// Fields to include in the response (comma-separated)
    /// </summary>
    public string? Fields { get; set; }

    /// <summary>
    /// Fields to exclude from the response (comma-separated)
    /// </summary>
    public string? ExcludeFields { get; set; }

    /// <summary>
    /// Include related entities (comma-separated)
    /// </summary>
    public string? Include { get; set; }

    /// <summary>
    /// Filter by specific IDs (comma-separated)
    /// </summary>
    public string? Ids { get; set; }

    /// <summary>
    /// Custom query parameters for advanced filtering
    /// </summary>
    public Dictionary<string, object>? CustomParams { get; set; }
}
