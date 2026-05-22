using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

public class TenantBranding : BaseEntity<int>
{
    public int TenantId { get; set; }
    public string? FaviconUrl { get; set; }
    public string? LogoUrl { get; set; }
    public string? LogoDarkUrl { get; set; }
    public string PrimaryColor { get; set; } = "#6366f1";
    public string SecondaryColor { get; set; } = "#8b5cf6";
    public string BackgroundColor { get; set; } = "#ffffff";
    public string TextColor { get; set; } = "#111827";
    public string FontFamily { get; set; } = "Inter";
    public string BorderRadius { get; set; } = "0.5rem";
    public string? CustomCSS { get; set; }
    public string? CustomJS { get; set; }
    public string? EmailHeader { get; set; }
    public string? EmailFooter { get; set; }
    public string? LoginPageBackground { get; set; }
    public string? CreatedBy { get; set; }

    // Navigation properties
    public virtual Tenant Tenant { get; set; } = null!;
}
