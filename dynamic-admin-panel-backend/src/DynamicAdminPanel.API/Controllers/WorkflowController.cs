using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Domain.Entities;
using DynamicAdminPanel.Infrastructure.Persistence;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DynamicAdminPanel.API.Controllers;

/// <summary>
/// Manages workflow definitions and their lifecycle (activate / pause).
/// </summary>
[ApiController]
[Route("api/v1/workflows")]
[Authorize]
public class WorkflowController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ITenantContext _tenant;
    private readonly ILogger<WorkflowController> _logger;

    public WorkflowController(ApplicationDbContext db, ITenantContext tenant, ILogger<WorkflowController> logger)
    {
        _db = db;
        _tenant = tenant;
        _logger = logger;
    }

    private int? TenantId => _tenant.TenantId;

    // ─── DTOs ─────────────────────────────────────────────────────────────────

    private record WorkflowDto(
        int Id, string Name, string Slug, string? Description,
        string? TriggerEntity, string TriggerEvent, string Status,
        int StepCount, int RunCount, DateTime CreatedAt, DateTime UpdatedAt);

    public record CreateWorkflowRequest(
        string Name, string Slug, string? Description,
        string? TriggerEntity, string? TriggerEvent);

    public record UpdateWorkflowRequest(
        string? Name, string? Description,
        string? TriggerEntity, string? TriggerEvent);

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static WorkflowDto ToDto(WorkflowDefinition w) => new(
        w.Id, w.Name, w.Slug, w.Description,
        w.TriggerEntity, w.TriggerEvent, w.Status,
        w.Steps?.Count ?? 0,
        w.Instances?.Count ?? 0,
        w.CreateDateTime, w.UpdateDateTime);

    // ─── Endpoints ────────────────────────────────────────────────────────────

    /// <summary>GET /api/v1/workflows — list all workflow definitions for tenant</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<WorkflowDto>>), 200)]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        var tenantId = TenantId;
        var query = _db.WorkflowDefinitions
            .Include(w => w.Steps)
            .Include(w => w.Instances)
            .Where(w => w.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(w => w.Name.Contains(search) || (w.Description != null && w.Description.Contains(search)));

        var total = await query.CountAsync();
        var raw = await query
            .OrderByDescending(w => w.UpdateDateTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = raw.Select(ToDto).ToList();

        var paged = new PagedResponse<WorkflowDto>(items, total, page, pageSize);
        return Ok(ApiResponse<PagedResponse<WorkflowDto>>.SuccessResponse(paged));
    }

    /// <summary>GET /api/v1/workflows/{id}</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<WorkflowDto>), 200)]
    public async Task<IActionResult> GetById(int id)
    {
        var tenantId = TenantId;
        var w = await _db.WorkflowDefinitions
            .Include(x => x.Steps)
            .Include(x => x.Instances)
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Id == id);

        if (w is null) return NotFound(ApiResponse<WorkflowDto>.ErrorResponse("Workflow not found"));
        return Ok(ApiResponse<WorkflowDto>.SuccessResponse(ToDto(w)));
    }

    /// <summary>POST /api/v1/workflows — create a new workflow definition</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<WorkflowDto>), 201)]
    public async Task<IActionResult> Create([FromBody] CreateWorkflowRequest req)
    {
        var tenantId = TenantId;
        // Slug uniqueness check
        if (await _db.WorkflowDefinitions.AnyAsync(w => w.TenantId == tenantId && w.Slug == req.Slug))
            return Conflict(ApiResponse<WorkflowDto>.ErrorResponse($"A workflow with slug '{req.Slug}' already exists."));

        var workflow = new WorkflowDefinition
        {
            TenantId = tenantId ?? 0,
            Name = req.Name,
            Slug = req.Slug,
            Description = req.Description,
            TriggerEntity = req.TriggerEntity,
            TriggerEvent = req.TriggerEvent ?? "created",
            Status = "draft",
            CreateDateTime = DateTime.UtcNow,
            UpdateDateTime = DateTime.UtcNow
        };

        _db.WorkflowDefinitions.Add(workflow);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = workflow.Id }, ApiResponse<WorkflowDto>.SuccessResponse(ToDto(workflow)));
    }

    /// <summary>PUT /api/v1/workflows/{id}</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<WorkflowDto>), 200)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateWorkflowRequest req)
    {
        var tenantId = TenantId;
        var w = await _db.WorkflowDefinitions.FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Id == id);
        if (w is null) return NotFound(ApiResponse<WorkflowDto>.ErrorResponse("Workflow not found"));

        if (req.Name is not null) w.Name = req.Name;
        if (req.Description is not null) w.Description = req.Description;
        if (req.TriggerEntity is not null) w.TriggerEntity = req.TriggerEntity;
        if (req.TriggerEvent is not null) w.TriggerEvent = req.TriggerEvent;
        w.UpdateDateTime = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<WorkflowDto>.SuccessResponse(ToDto(w)));
    }

    /// <summary>DELETE /api/v1/workflows/{id}</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> Delete(int id)
    {
        var tenantId = TenantId;
        var w = await _db.WorkflowDefinitions.FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Id == id);
        if (w is null) return NotFound(ApiResponse<string>.ErrorResponse("Workflow not found"));

        _db.WorkflowDefinitions.Remove(w);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<string>.SuccessResponse("deleted", "Workflow deleted"));
    }

    /// <summary>PATCH /api/v1/workflows/{id}/activate</summary>
    [HttpPatch("{id:int}/activate")]
    [ProducesResponseType(typeof(ApiResponse<WorkflowDto>), 200)]
    public async Task<IActionResult> Activate(int id)
    {
        var tenantId = TenantId;
        var w = await _db.WorkflowDefinitions.FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Id == id);
        if (w is null) return NotFound(ApiResponse<WorkflowDto>.ErrorResponse("Workflow not found"));

        w.Status = "active";
        w.UpdateDateTime = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<WorkflowDto>.SuccessResponse(ToDto(w)));
    }

    /// <summary>PATCH /api/v1/workflows/{id}/pause</summary>
    [HttpPatch("{id:int}/pause")]
    [ProducesResponseType(typeof(ApiResponse<WorkflowDto>), 200)]
    public async Task<IActionResult> Pause(int id)
    {
        var tenantId = TenantId;
        var w = await _db.WorkflowDefinitions.FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Id == id);
        if (w is null) return NotFound(ApiResponse<WorkflowDto>.ErrorResponse("Workflow not found"));

        w.Status = "paused";
        w.UpdateDateTime = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<WorkflowDto>.SuccessResponse(ToDto(w)));
    }
}
