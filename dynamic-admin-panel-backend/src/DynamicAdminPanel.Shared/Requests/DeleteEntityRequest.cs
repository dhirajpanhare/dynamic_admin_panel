namespace DynamicAdminPanel.Shared.Requests;

/// <summary>
/// Request model for deleting an entity
/// </summary>
public class DeleteEntityRequest
{
    /// <summary>
    /// Whether to perform a hard delete (true) or soft delete (false)
    /// </summary>
    public bool HardDelete { get; set; } = false;
}
