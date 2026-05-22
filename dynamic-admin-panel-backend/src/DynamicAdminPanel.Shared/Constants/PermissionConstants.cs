namespace DynamicAdminPanel.Shared.Constants;

public static class PermissionConstants
{
    public const string Create = "create";
    public const string Read = "read";
    public const string Update = "update";
    public const string Delete = "delete";
    public const string Export = "export";
    public const string Import = "import";
    
    public static class Entities
    {
        public const string Users = "users";
        public const string Roles = "roles";
        public const string Permissions = "permissions";
        public const string Tenants = "tenants";
        public const string Organizations = "organizations";
    }
}
