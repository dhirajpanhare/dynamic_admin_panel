namespace DynamicAdminPanel.Shared.Requests;

/// <summary>
/// Request model for updating an existing entity
/// </summary>
public class UpdateEntityRequest
{
    /// <summary>
    /// Dynamic data for the entity as key-value pairs
    /// </summary>
    public Dictionary<string, object> Data { get; set; } = new();
}
