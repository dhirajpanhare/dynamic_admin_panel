using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Infrastructure.Persistence;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DynamicAdminPanel.API.Controllers;


[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class TenantsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICacheService _cacheService;
    private readonly ITenantContext _tenant;
    private readonly ILogger<TenantsController> _logger;

    public TenantsController(
        ApplicationDbContext context,
        ICacheService cacheService,
        ITenantContext tenant,
        ILogger<TenantsController> logger)
    {
        _context = context;
        _cacheService = cacheService;
        _tenant = tenant;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TenantDto>>>> GetTenants()
    {
        var tenants = await _context.Tenants
            .Where(t => t.DeleteDateTime == null)
            .Select(t => new TenantDto
            {
                TenantId = t.Id,
                WorkSpaceName = t.WorkSpaceName,
                SubDomainName = t.SubDomainName,
                Status = t.Status,
                SubscriptionTier = t.SubscriptionTier,
                CreateDateTime = t.CreateDateTime
            })
            .ToListAsync();

        return Ok(ApiResponse<List<TenantDto>>.SuccessResponse(tenants, "Tenants retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TenantDto>>> GetTenant(int id)
    {
        var tenant = await _context.Tenants
            .Where(t => t.Id == id && t.DeleteDateTime == null)
            .Select(t => new TenantDto
            {
                TenantId = t.Id,
                WorkSpaceName = t.WorkSpaceName,
                SubDomainName = t.SubDomainName,
                CustomDomain = t.CustomDomain,
                Status = t.Status,
                IsolationLevel = t.IsolationLevel,
                SubscriptionTier = t.SubscriptionTier,
                SubscriptionStatus = t.SubscriptionStatus,
                MaxUsers = t.MaxUsers,
                MaxStorageMB = t.MaxStorageMB,
                CreateDateTime = t.CreateDateTime
            })
            .FirstOrDefaultAsync();

        if (tenant == null)
        {
            return NotFound(ApiResponse<TenantDto>.ErrorResponse("Tenant not found"));
        }

        return Ok(ApiResponse<TenantDto>.SuccessResponse(tenant, "Tenant retrieved successfully"));
    }

    /// <summary>
    /// Get branding config for the current tenant.
    /// Called by the frontend on startup to apply custom CSS variables.
    /// </summary>
    [HttpGet("branding")]
    [ProducesResponseType(typeof(ApiResponse<TenantBrandingDto>), 200)]
    public async Task<IActionResult> GetBranding()
    {
        var branding = await _context.TenantBrandings
            .Where(b => b.TenantId == _tenantId)
            .FirstOrDefaultAsync();

        // Return defaults if no branding record exists yet
        var dto = branding is null
            ? new TenantBrandingDto()
            : new TenantBrandingDto
            {
                LogoUrl = branding.LogoUrl,
                LogoDarkUrl = branding.LogoDarkUrl,
                FaviconUrl = branding.FaviconUrl,
                PrimaryColor = branding.PrimaryColor,
                SecondaryColor = branding.SecondaryColor,
                BackgroundColor = branding.BackgroundColor,
                TextColor = branding.TextColor,
                FontFamily = branding.FontFamily,
                BorderRadius = branding.BorderRadius,
                CustomCSS = branding.CustomCSS
            };

        return Ok(ApiResponse<TenantBrandingDto>.SuccessResponse(dto));
    }

    /// <summary>Update branding config for the current tenant.</summary>
    [HttpPatch("branding")]
    [ProducesResponseType(typeof(ApiResponse<TenantBrandingDto>), 200)]
    public async Task<IActionResult> UpdateBranding([FromBody] TenantBrandingDto req)
    {
        var branding = await _context.TenantBrandings
            .Where(b => b.TenantId == _tenantId)
            .FirstOrDefaultAsync();

        if (branding is null)
        {
            branding = new Domain.Entities.TenantBranding { TenantId = _tenantId };
            _context.TenantBrandings.Add(branding);
        }

        if (req.LogoUrl is not null) branding.LogoUrl = req.LogoUrl;
        if (req.LogoDarkUrl is not null) branding.LogoDarkUrl = req.LogoDarkUrl;
        if (req.FaviconUrl is not null) branding.FaviconUrl = req.FaviconUrl;
        if (req.PrimaryColor is not null) branding.PrimaryColor = req.PrimaryColor;
        if (req.SecondaryColor is not null) branding.SecondaryColor = req.SecondaryColor;
        if (req.BackgroundColor is not null) branding.BackgroundColor = req.BackgroundColor;
        if (req.TextColor is not null) branding.TextColor = req.TextColor;
        if (req.FontFamily is not null) branding.FontFamily = req.FontFamily;
        if (req.BorderRadius is not null) branding.BorderRadius = req.BorderRadius;
        if (req.CustomCSS is not null) branding.CustomCSS = req.CustomCSS;

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<TenantBrandingDto>.SuccessResponse(req, "Branding updated"));
    }

    /// <summary>Update general settings (timezone, currency, date format, etc.) for the current tenant.</summary>
    [HttpPatch("settings")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateTenantSettingsRequest req)
    {
        var tenant = await _context.Tenants.FindAsync(_tenantId);
        if (tenant is null) return NotFound(ApiResponse<object>.ErrorResponse("Tenant not found"));

        if (req.WorkSpaceName is not null) tenant.WorkSpaceName = req.WorkSpaceName;
        if (req.Timezone is not null) tenant.Timezone = req.Timezone;
        if (req.Currency is not null) tenant.Currency = req.Currency;
        if (req.DateFormat is not null) tenant.DateFormat = req.DateFormat;

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Settings updated"));
    }

    private int _tenantId => _tenant.TenantId ?? 0;
}

public class TenantDto
{
    public int TenantId { get; set; }
    public string WorkSpaceName { get; set; } = string.Empty;
    public string SubDomainName { get; set; } = string.Empty;
    public string? CustomDomain { get; set; }
    public string Status { get; set; } = string.Empty;
    public string IsolationLevel { get; set; } = string.Empty;
    public string SubscriptionTier { get; set; } = string.Empty;
    public string SubscriptionStatus { get; set; } = string.Empty;
    public int MaxUsers { get; set; }
    public int MaxStorageMB { get; set; }
    public DateTime CreateDateTime { get; set; }
}

public record TenantBrandingDto
{
    public string? LogoUrl { get; init; }
    public string? LogoDarkUrl { get; init; }
    public string? FaviconUrl { get; init; }
    public string PrimaryColor { get; init; } = "#6366f1";
    public string SecondaryColor { get; init; } = "#8b5cf6";
    public string BackgroundColor { get; init; } = "#ffffff";
    public string TextColor { get; init; } = "#111827";
    public string FontFamily { get; init; } = "Inter";
    public string BorderRadius { get; init; } = "0.5rem";
    public string? CustomCSS { get; init; }
}

public record UpdateTenantSettingsRequest
{
    public string? WorkSpaceName { get; init; }
    public string? Timezone { get; init; }
    public string? Currency { get; init; }
    public string? DateFormat { get; init; }
}
