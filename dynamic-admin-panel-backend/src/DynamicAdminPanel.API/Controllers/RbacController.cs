using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Infrastructure.Persistence;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DynamicAdminPanel.API.Controllers;

/// <summary>
/// Role-Based Access Control management.
/// Manages roles, permissions, and role-permission assignments for the current tenant.
/// </summary>
[ApiController]
[Route("api/v1/roles")]
[Authorize]
public class RbacController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ITenantContext _tenant;
    private readonly ILogger<RbacController> _logger;

    public RbacController(ApplicationDbContext db, ITenantContext tenant, ILogger<RbacController> logger)
    {
        _db = db;
        _tenant = tenant;
        _logger = logger;
    }

    // ── ROLES ────────────────────────────────────────────────────────────────

    /// <summary>List all roles for the current tenant with their assigned permissions and user counts.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<RoleDto>>), 200)]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _db.Roles
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .Where(r => r.TenantId == _tenant.TenantId && r.DeleteDateTime == null)
            .ToListAsync();

        // Count users per role
        var userRoleCounts = await _db.UserRoles
            .Where(ur => _db.Roles
                .Where(r => r.TenantId == _tenant.TenantId)
                .Select(r => r.Id)
                .Contains(ur.RoleId))
            .GroupBy(ur => ur.RoleId)
            .Select(g => new { RoleId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.RoleId, x => x.Count);

        var dtos = roles.Select(r => new RoleDto
        {
            Id = r.Id.ToString(),
            Name = r.Name,
            Slug = r.Slug,
            Description = r.Description,
            IsSystemRole = r.IsSystemRole,
            Permissions = r.RolePermissions.Select(rp => rp.Permission.Slug).ToList(),
            UserCount = userRoleCounts.GetValueOrDefault(r.Id, 0)
        }).ToList();

        return Ok(ApiResponse<List<RoleDto>>.SuccessResponse(dtos));
    }

    /// <summary>Create a new role for the current tenant.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<RoleDto>), 201)]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest req)
    {
        if (await _db.Roles.AnyAsync(r => r.TenantId == _tenant.TenantId && r.Slug == req.Slug && r.DeleteDateTime == null))
            return Conflict(ApiResponse<object>.ErrorResponse($"Role with slug '{req.Slug}' already exists"));

        var role = new Domain.Entities.Role
        {
            TenantId = _tenant.TenantId ?? 0,
            Name = req.Name,
            Slug = req.Slug,
            Description = req.Description,
            IsSystemRole = false
        };

        _db.Roles.Add(role);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Role '{Slug}' created for tenant {TenantId}", req.Slug, _tenant.TenantId);

        return CreatedAtAction(nameof(GetRoles), null, ApiResponse<RoleDto>.SuccessResponse(new RoleDto
        {
            Id = role.Id.ToString(),
            Name = role.Name,
            Slug = role.Slug,
            Description = role.Description,
            IsSystemRole = false,
            Permissions = new List<string>(),
            UserCount = 0
        }, "Role created"));
    }

    /// <summary>Update an existing role's name, slug, and description.</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<RoleDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest req)
    {
        var role = await _db.Roles
            .Where(r => r.Id == id && r.TenantId == _tenant.TenantId && r.DeleteDateTime == null)
            .FirstOrDefaultAsync();

        if (role is null) return NotFound(ApiResponse<object>.ErrorResponse("Role not found"));
        if (role.IsSystemRole) return BadRequest(ApiResponse<object>.ErrorResponse("System roles cannot be modified"));

        role.Name = req.Name;
        role.Description = req.Description;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<RoleDto>.SuccessResponse(new RoleDto
        {
            Id = role.Id.ToString(),
            Name = role.Name,
            Slug = role.Slug,
            Description = role.Description,
            IsSystemRole = role.IsSystemRole
        }, "Role updated"));
    }

    /// <summary>Soft-delete a role. System roles cannot be deleted.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteRole(int id)
    {
        var role = await _db.Roles
            .Where(r => r.Id == id && r.TenantId == _tenant.TenantId && r.DeleteDateTime == null)
            .FirstOrDefaultAsync();

        if (role is null) return NotFound(ApiResponse<object>.ErrorResponse("Role not found"));
        if (role.IsSystemRole) return BadRequest(ApiResponse<object>.ErrorResponse("System roles cannot be deleted"));

        role.DeleteDateTime = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Role deleted"));
    }

    // ── PERMISSIONS ──────────────────────────────────────────────────────────

    /// <summary>List all permissions available in the system.</summary>
    [HttpGet("/api/v1/permissions")]
    [ProducesResponseType(typeof(ApiResponse<List<PermissionDto>>), 200)]
    public async Task<IActionResult> GetPermissions()
    {
        var permissions = await _db.Permissions
            .OrderBy(p => p.Module).ThenBy(p => p.Name)
            .Select(p => new PermissionDto
            {
                Id = p.Id.ToString(),
                Name = p.Name,
                Slug = p.Slug,
                Description = p.Description,
                Group = p.Module
            })
            .ToListAsync();

        return Ok(ApiResponse<List<PermissionDto>>.SuccessResponse(permissions));
    }

    /// <summary>
    /// Assign a full set of permissions to a role (replaces existing assignment).
    /// Body: { "permissions": ["entity.create", "entity.read", ...] }
    /// </summary>
    [HttpPut("{id}/permissions")]
    [ProducesResponseType(typeof(ApiResponse<RoleDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> SetRolePermissions(int id, [FromBody] SetPermissionsRequest req)
    {
        var role = await _db.Roles
            .Include(r => r.RolePermissions)
            .Where(r => r.Id == id && r.TenantId == _tenant.TenantId && r.DeleteDateTime == null)
            .FirstOrDefaultAsync();

        if (role is null) return NotFound(ApiResponse<object>.ErrorResponse("Role not found"));

        // Resolve permission slugs to IDs
        var permissionIds = await _db.Permissions
            .Where(p => req.Permissions.Contains(p.Slug))
            .Select(p => p.Id)
            .ToListAsync();

        // Replace full set
        _db.RolePermissions.RemoveRange(role.RolePermissions);
        role.RolePermissions = permissionIds.Select(pid => new Domain.Entities.RolePermission
        {
            RoleId = id,
            PermissionId = pid
        }).ToList();

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Permissions updated"));
    }
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

public record RoleDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsSystemRole { get; init; }
    public List<string> Permissions { get; init; } = new();
    public int UserCount { get; init; }
}

public record PermissionDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Group { get; init; }
}

public record CreateRoleRequest(string Name, string Slug, string? Description);
public record UpdateRoleRequest(string Name, string? Description);
public record SetPermissionsRequest(IReadOnlyList<string> Permissions);
