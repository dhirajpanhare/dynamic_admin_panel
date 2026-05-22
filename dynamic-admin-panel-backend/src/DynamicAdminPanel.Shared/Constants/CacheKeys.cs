namespace DynamicAdminPanel.Shared.Constants;

public static class CacheKeys
{
    public const string TenantPrefix = "tenant:";
    public const string EntityMetadataPrefix = "entity:metadata:";
    public const string UserPermissionsPrefix = "user:permissions:";
    public const string RolePermissionsPrefix = "role:permissions:";
    
    public static string GetTenantKey(int tenantId) => $"{TenantPrefix}{tenantId}";
    public static string GetEntityMetadataKey(string entitySlug) => $"{EntityMetadataPrefix}{entitySlug}";
    public static string GetUserPermissionsKey(int userId) => $"{UserPermissionsPrefix}{userId}";
    public static string GetRolePermissionsKey(int roleId) => $"{RolePermissionsPrefix}{roleId}";
}
