namespace DynamicAdminPanel.Shared.Requests;

/// <summary>
/// Request model for creating a new entity
/// </summary>
public class CreateEntityRequest
{
    /// <summary>
    /// Dynamic data for the entity as key-value pairs
    /// </summary>
    public Dictionary<string, object> Data { get; set; } = new();
}
