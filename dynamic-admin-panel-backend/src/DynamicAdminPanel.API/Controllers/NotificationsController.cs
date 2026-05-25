using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Infrastructure.Persistence;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DynamicAdminPanel.API.Controllers;

/// <summary>
/// In-app notifications for the current authenticated user.
/// Supports pagination, read/unread tracking, and bulk mark-as-read.
/// </summary>
[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ITenantContext _tenant;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(ApplicationDbContext db, ITenantContext tenant, ILogger<NotificationsController> logger)
    {
        _db = db;
        _tenant = tenant;
        _logger = logger;
    }

    private int CurrentUserId => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

    /// <summary>
    /// Get paginated notifications for the current user.
    /// Query: page, perPage, unreadOnly
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<NotificationPageDto>), 200)]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int perPage = 20, [FromQuery] bool unreadOnly = false)
    {
        var userId = CurrentUserId;
        var query = _db.Notifications
            .Where(n => n.TenantId == _tenant.TenantId && n.RecipientUserId == userId);

        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var total = await query.CountAsync();
        var unreadCount = await _db.Notifications
            .CountAsync(n => n.TenantId == _tenant.TenantId && n.RecipientUserId == userId && !n.IsRead);

        var items = await query
            .OrderByDescending(n => n.CreateDateTime)
            .Skip((page - 1) * perPage)
            .Take(perPage)
            .Select(n => new NotificationDto
            {
                Id = n.Id.ToString(),
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                ActionUrl = n.ActionUrl,
                Icon = n.Icon,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                CreatedAt = n.CreateDateTime
            })
            .ToListAsync();

        return Ok(ApiResponse<NotificationPageDto>.SuccessResponse(new NotificationPageDto
        {
            Items = items,
            Total = total,
            UnreadCount = unreadCount,
            Page = page,
            PerPage = perPage
        }));
    }

    /// <summary>Mark a single notification as read.</summary>
    [HttpPatch("{id}/read")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var notification = await _db.Notifications
            .Where(n => n.Id == id && n.RecipientUserId == CurrentUserId)
            .FirstOrDefaultAsync();

        if (notification is null)
            return NotFound(ApiResponse<object>.ErrorResponse("Notification not found"));

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Notification marked as read"));
    }

    /// <summary>Mark ALL unread notifications as read for the current user.</summary>
    [HttpPatch("read-all")]
    [ProducesResponseType(typeof(ApiResponse<int>), 200)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = CurrentUserId;
        var now = DateTime.UtcNow;

        var unread = await _db.Notifications
            .Where(n => n.TenantId == _tenant.TenantId && n.RecipientUserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = now;
        }

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<int>.SuccessResponse(unread.Count, $"{unread.Count} notifications marked as read"));
    }

    /// <summary>Delete a single notification.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var notification = await _db.Notifications
            .Where(n => n.Id == id && n.RecipientUserId == CurrentUserId)
            .FirstOrDefaultAsync();

        if (notification is null)
            return NotFound(ApiResponse<object>.ErrorResponse("Notification not found"));

        _db.Notifications.Remove(notification);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Notification deleted"));
    }
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record NotificationDto
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string Type { get; init; } = "info"; // info | success | warning | error
    public string? ActionUrl { get; init; }
    public string? Icon { get; init; }
    public bool IsRead { get; init; }
    public DateTime? ReadAt { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record NotificationPageDto
{
    public List<NotificationDto> Items { get; init; } = new();
    public int Total { get; init; }
    public int UnreadCount { get; init; }
    public int Page { get; init; }
    public int PerPage { get; init; }
}
