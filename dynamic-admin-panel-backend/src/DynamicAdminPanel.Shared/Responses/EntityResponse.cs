namespace DynamicAdminPanel.Shared.Responses;

/// <summary>
/// Response model for entity operations
/// </summary>
public class EntityResponse
{
    /// <summary>
    /// Dynamic entity data as key-value pairs
    /// </summary>
    public Dictionary<string, object> Data { get; set; } = new();

    public EntityResponse()
    {
    }

    public EntityResponse(Dictionary<string, object> data)
    {
        Data = data;
    }
}
