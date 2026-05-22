namespace DynamicAdminPanel.Domain.Enums;

public enum TenantStatus
{
    Active,
    Inactive,
    Suspended,
    Deleted,
    Trial
}

public enum IsolationLevel
{
    Shared,
    Schema,
    Database
}

public enum SubscriptionTier
{
    Free,
    Starter,
    Pro,
    Enterprise
}
