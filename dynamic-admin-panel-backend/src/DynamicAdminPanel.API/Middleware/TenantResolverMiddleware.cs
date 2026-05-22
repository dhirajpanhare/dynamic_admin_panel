using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using DynamicAdminPanel.Infrastructure.Persistence;

namespace DynamicAdminPanel.API.Middleware;

public class TenantResolverMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantResolverMiddleware> _logger;

    public TenantResolverMiddleware(RequestDelegate next, ILogger<TenantResolverMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext, ApplicationDbContext dbContext)
    {
        try
        {
            // Try to get tenant from header first
            var tenantIdHeader = context.Request.Headers["X-Tenant-Id"].FirstOrDefault();
            
            // If not in header, try to extract from subdomain
            string? tenantIdentifier = tenantIdHeader;
            
            if (string.IsNullOrEmpty(tenantIdentifier))
            {
                var host = context.Request.Host.Host;
                var parts = host.Split('.');
                
                if (parts.Length > 2)
                {
                    tenantIdentifier = parts[0]; // subdomain
                }
            }

            if (!string.IsNullOrEmpty(tenantIdentifier))
            {
                Domain.Entities.Tenant? tenant = null;

                // Try to parse as integer (TenantId)
                if (int.TryParse(tenantIdentifier, out var tenantId))
                {
                    tenant = await dbContext.Tenants
                        .FirstOrDefaultAsync(t => t.Id == tenantId && t.Status == "Active");
                }
                else
                {
                    // Try to find by subdomain
                    tenant = await dbContext.Tenants
                        .FirstOrDefaultAsync(t => t.SubDomainName == tenantIdentifier && t.Status == "Active");
                }

                if (tenant != null)
                {
                    tenantContext.SetTenant(
                        tenant.Id,
                        tenant.WorkSpaceName,
                        tenant.DatabaseConnectionString,
                        tenant.DatabaseSchema
                    );

                    _logger.LogInformation("Tenant resolved: {TenantId} - {TenantName}", tenant.Id, tenant.WorkSpaceName);
                }
                else
                {
                    _logger.LogWarning("Tenant not found or inactive: {TenantIdentifier}", tenantIdentifier);
                }
            }

            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resolving tenant");
            throw;
        }
    }
}
