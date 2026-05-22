using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

public class Tenant : BaseEntity<int>
{
    public string WorkSpaceName { get; set; } = string.Empty;
    public string SubDomainName { get; set; } = string.Empty;
    public string? CustomDomain { get; set; }
    public string Status { get; set; } = "Active";
    public string IsolationLevel { get; set; } = "Shared";
    public string? DatabaseConnectionString { get; set; }
    public string DatabaseSchema { get; set; } = "dbo";

    // Subscription
    public string SubscriptionTier { get; set; } = "Free";
    public string SubscriptionStatus { get; set; } = "Active";
    public DateTime? SubscriptionStartsAt { get; set; }
    public DateTime? SubscriptionExpiresAt { get; set; }

    // Limits
    public int MaxUsers { get; set; } = 10;
    public int MaxStorageMB { get; set; } = 500;
    public int MaxApiCallsPerDay { get; set; } = 10000;

    // Settings
    public string Timezone { get; set; } = "UTC";
    public string DateFormat { get; set; } = "MM/dd/yyyy";
    public string Currency { get; set; } = "USD";
    public string Locale { get; set; } = "en-US";

    // Metadata (JSON)
    public string Settings { get; set; } = "{}";
    public string Features { get; set; } = "{}";

    public string? CreatedBy { get; set; }

    // Navigation properties
    public virtual TenantBranding? Branding { get; set; }
}
