using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Infrastructure.Persistence;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DynamicAdminPanel.API.Controllers;

/// <summary>
/// User management for the current tenant.
/// Note: The User entity uses UserMailAddress, UserName, and IsActive fields.
/// </summary>
[ApiController]
[Route("api/v1/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ITenantContext _tenant;
    private readonly IPasswordHasher<Domain.Entities.User> _hasher;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        ApplicationDbContext db,
        ITenantContext tenant,
        IPasswordHasher<Domain.Entities.User> hasher,
        ILogger<UsersController> logger)
    {
        _db = db;
        _tenant = tenant;
        _hasher = hasher;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of users for this tenant with their roles.
    /// Query: page, perPage, search, status (active|inactive)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<UserDto>>), 200)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null)
    {
        var tenantUserIds = await _db.UserTenants
            .Where(ut => ut.TenantId == _tenant.TenantId)
            .Select(ut => ut.UserId)
            .ToListAsync();

        var query = _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => tenantUserIds.Contains(u.Id) && u.DeleteDateTime == null);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(u => u.UserMailAddress.Contains(search) || u.UserName.Contains(search));

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(u => u.UserName)
            .Skip((page - 1) * perPage)
            .Take(perPage)
            .Select(u => new UserDto
            {
                Id = u.Id.ToString(),
                Email = u.UserMailAddress,
                Name = u.UserName,
                AvatarUrl = u.ProfilePictureUrl,
                IsActive = u.IsActive,
                Roles = u.UserRoles.Select(ur => ur.Role.Slug).ToList(),
                CreatedAt = u.CreateDateTime,
                LastLoginAt = u.LastLoginAt
            })
            .ToListAsync();

        return Ok(ApiResponse<PagedResponse<UserDto>>.SuccessResponse(
            new PagedResponse<UserDto>(items, total, page, perPage)));
    }

    /// <summary>Get a single user by ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.Id == id && u.DeleteDateTime == null)
            .FirstOrDefaultAsync();

        if (user is null) return NotFound(ApiResponse<object>.ErrorResponse("User not found"));

        return Ok(ApiResponse<UserDto>.SuccessResponse(new UserDto
        {
            Id = user.Id.ToString(),
            Email = user.UserMailAddress,
            Name = user.UserName,
            AvatarUrl = user.ProfilePictureUrl,
            IsActive = user.IsActive,
            Roles = user.UserRoles.Select(ur => ur.Role.Slug).ToList(),
            CreatedAt = user.CreateDateTime,
            LastLoginAt = user.LastLoginAt
        }));
    }

    /// <summary>
    /// Invite a new user to this tenant.
    /// Creates the user account, links to tenant, and assigns the specified role.
    /// </summary>
    [HttpPost("invite")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), 201)]
    public async Task<IActionResult> InviteUser([FromBody] InviteUserRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.UserMailAddress == req.Email && u.DeleteDateTime == null))
            return Conflict(ApiResponse<object>.ErrorResponse($"User with email ''{req.Email}'' already exists"));

        var user = new Domain.Entities.User
        {
            UserMailAddress = req.Email,
            UserName = req.DisplayName,
            IsActive = true,
            EmailVerified = false
        };

        // Hash a temporary random password — user must reset on first login
        user.Password = _hasher.HashPassword(user, Guid.NewGuid().ToString("N"));

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Link to tenant
        _db.UserTenants.Add(new Domain.Entities.UserTenant
        {
            UserId = user.Id,
            TenantId = _tenant.TenantId ?? 0,
            IsPrimary = true,
            Status = "active"
        });

        // Assign role if provided
        if (!string.IsNullOrEmpty(req.RoleSlug))
        {
            var role = await _db.Roles.FirstOrDefaultAsync(r =>
                r.TenantId == _tenant.TenantId && r.Slug == req.RoleSlug);
            if (role is not null)
            {
                _db.UserRoles.Add(new Domain.Entities.UserRole { UserId = user.Id, RoleId = role.Id });
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("User {Email} invited to tenant {TenantId}", req.Email, _tenant.TenantId);

        return CreatedAtAction(nameof(GetUser), new { id = user.Id },
            ApiResponse<UserDto>.SuccessResponse(new UserDto
            {
                Id = user.Id.ToString(),
                Email = user.UserMailAddress,
                Name = user.UserName,
                IsActive = user.IsActive
            }, "User invited"));
    }

    /// <summary>Update a user name, avatar, and role assignments.</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest req)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
            .Where(u => u.Id == id && u.DeleteDateTime == null)
            .FirstOrDefaultAsync();

        if (user is null) return NotFound(ApiResponse<object>.ErrorResponse("User not found"));

        if (req.DisplayName is not null) user.UserName = req.DisplayName;
        if (req.AvatarUrl is not null) user.ProfilePictureUrl = req.AvatarUrl;

        // Replace roles if provided
        if (req.RoleSlugs is not null)
        {
            _db.UserRoles.RemoveRange(user.UserRoles);
            var roles = await _db.Roles
                .Where(r => r.TenantId == _tenant.TenantId && req.RoleSlugs.Contains(r.Slug))
                .ToListAsync();
            user.UserRoles = roles.Select(r => new Domain.Entities.UserRole
                { UserId = user.Id, RoleId = r.Id }).ToList();
        }

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.SuccessResponse(true, "User updated"));
    }

    /// <summary>Activate or deactivate a user.</summary>
    [HttpPut("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> SetUserStatus(int id, [FromBody] SetUserStatusRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound(ApiResponse<object>.ErrorResponse("User not found"));

        user.IsActive = req.IsActive;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(true, $"User {(req.IsActive ? "activated" : "deactivated")}"));
    }

    /// <summary>Soft-delete a user. You cannot delete your own account.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var selfId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : 0;
        if (id == selfId) return BadRequest(ApiResponse<object>.ErrorResponse("You cannot delete your own account"));

        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound(ApiResponse<object>.ErrorResponse("User not found"));

        user.DeleteDateTime = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(true, "User deleted"));
    }
}

// ---- DTOs ----

public record UserDto
{
    public string Id { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public bool IsActive { get; init; }
    public List<string> Roles { get; init; } = new();
    public DateTime CreatedAt { get; init; }
    public DateTime? LastLoginAt { get; init; }
}

public record InviteUserRequest(string Email, string DisplayName, string? RoleSlug);
public record UpdateUserRequest(string? DisplayName, string? AvatarUrl, IReadOnlyList<string>? RoleSlugs);
public record SetUserStatusRequest(bool IsActive);
