using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Infrastructure.Persistence;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DynamicAdminPanel.API.Controllers;

/// <summary>
/// Audit log access for the current tenant.
/// Returns paginated audit entries filterable by entity, user, and date range.
/// </summary>
[ApiController]
[Route("api/v1/audit-logs")]
[Authorize]
public class AuditController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ITenantContext _tenant;

    public AuditController(ApplicationDbContext db, ITenantContext tenant)
    {
        _db = db;
        _tenant = tenant;
    }

    /// <summary>
    /// Get paginated audit logs for the current tenant.
    /// Filters: entity (entity slug), userId, dateFrom, dateTo, action (create|update|delete)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<AuditLogDto>>), 200)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        [FromQuery] string? entity = null,
        [FromQuery] string? userId = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var query = _db.AuditLogs
            .Where(a => a.TenantId == _tenant.TenantId);

        if (!string.IsNullOrEmpty(entity))
            query = query.Where(a => a.EntityName == entity);

        if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out var uid))
            query = query.Where(a => a.UserId == uid);

        if (!string.IsNullOrEmpty(action))
            query = query.Where(a => a.Action == action.ToLower());

        if (dateFrom.HasValue)
            query = query.Where(a => a.CreateDateTime >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(a => a.CreateDateTime <= dateTo.Value.AddDays(1));

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.CreateDateTime)
            .Skip((page - 1) * perPage)
            .Take(perPage)
            .Select(a => new AuditLogDto
            {
                Id = a.Id.ToString(),
                EntityName = a.EntityName,
                EntityId = a.EntityId,
                Action = a.Action,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                UserId = a.UserId.HasValue ? a.UserId.Value.ToString() : "0",
                UserName = "User #" + a.UserId,
                IpAddress = a.IPAddress,
                UserAgent = a.UserAgent,
                CreatedAt = a.CreateDateTime
            })
            .ToListAsync();

        var paged = new PagedResponse<AuditLogDto>(items, total, page, perPage);
        return Ok(ApiResponse<PagedResponse<AuditLogDto>>.SuccessResponse(paged));
    }
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record AuditLogDto
{
    public string Id { get; init; } = string.Empty;
    public string EntityName { get; init; } = string.Empty;
    public string EntityId { get; init; } = string.Empty;
    public string Action { get; init; } = string.Empty;   // create | update | delete
    public string? OldValues { get; init; }
    public string? NewValues { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string UserName { get; init; } = string.Empty;
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public DateTime CreatedAt { get; init; }
}
