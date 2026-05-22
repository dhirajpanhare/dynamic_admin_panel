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
    private readonly ILogger<TenantsController> _logger;

    public TenantsController(
        ApplicationDbContext context,
        ICacheService cacheService,
        ILogger<TenantsController> logger)
    {
        _context = context;
        _cacheService = cacheService;
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
