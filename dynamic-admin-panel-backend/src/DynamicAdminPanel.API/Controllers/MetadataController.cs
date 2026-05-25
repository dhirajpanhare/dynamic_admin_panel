using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Infrastructure.Persistence;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace DynamicAdminPanel.API.Controllers;

/// <summary>
/// Serves entity configuration, form layouts, list-view configs, and dashboard configs
/// to the frontend's DynamicForm, DynamicDataGrid, and DynamicDashboard components.
/// This is the critical plumbing between the metadata engine and the dynamic UI.
/// </summary>
[ApiController]
[Route("api/v1/metadata")]
[Authorize]
public class MetadataController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ITenantContext _tenant;
    private readonly ILogger<MetadataController> _logger;

    public MetadataController(ApplicationDbContext db, ITenantContext tenant, ILogger<MetadataController> logger)
    {
        _db = db;
        _tenant = tenant;
        _logger = logger;
    }

    // ────────────────────────────────────────────────────────────────────────
    // ENTITIES
    // ────────────────────────────────────────────────────────────────────────

    /// <summary>Get all entities visible in the sidebar for the current tenant.</summary>
    [HttpGet("entities")]
    [ProducesResponseType(typeof(ApiResponse<List<EntitySummaryDto>>), 200)]
    public async Task<IActionResult> GetEntities()
    {
        var entities = await _db.EntityMetadatas
            .Where(e => e.TenantId == _tenant.TenantId && e.IsActive && e.IsApiEnabled)
            .OrderBy(e => e.SortOrder).ThenBy(e => e.Name)
            .Select(e => new EntitySummaryDto
            {
                Id = e.Id,
                Slug = e.Slug,
                Name = e.Name,
                NamePlural = e.NamePlural,
                Icon = e.Icon,
                Description = e.Description
            })
            .ToListAsync();

        return Ok(ApiResponse<List<EntitySummaryDto>>.SuccessResponse(entities));
    }

    /// <summary>
    /// Get full entity config including all fields.
    /// The frontend DynamicForm and DynamicDataGrid call this on every entity page load.
    /// </summary>
    [HttpGet("entities/{slug}")]
    [ProducesResponseType(typeof(ApiResponse<EntityConfigDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetEntity(string slug)
    {
        var entity = await _db.EntityMetadatas
            .Include(e => e.Fields.Where(f => !f.IsHidden).OrderBy(f => f.SortOrder))
            .Where(e => e.TenantId == _tenant.TenantId && e.Slug == slug && e.IsActive)
            .FirstOrDefaultAsync();

        if (entity is null)
            return NotFound(ApiResponse<object>.ErrorResponse($"Entity '{slug}' not found"));

        var dto = new EntityConfigDto
        {
            Id = entity.Id.ToString(),
            Slug = entity.Slug,
            Name = entity.Name,
            NamePlural = entity.NamePlural,
            Label = entity.Name,
            LabelPlural = entity.NamePlural,
            Icon = entity.Icon,
            Description = entity.Description,
            Settings = new EntitySettingsDto
            {
                EnableAudit = entity.EnableAuditLog,
                EnableSoftDelete = entity.EnableSoftDelete
            },
            Permissions = new EntityPermissionsDto
            {
                Create = $"{slug}.create",
                Read = $"{slug}.read",
                Update = $"{slug}.update",
                Delete = $"{slug}.delete"
            },
            Fields = entity.Fields.Select(MapField).ToList()
        };

        return Ok(ApiResponse<EntityConfigDto>.SuccessResponse(dto));
    }

    /// <summary>
    /// Get list-view column configuration for an entity.
    /// Called by DynamicDataGrid to know which columns to show and how to display them.
    /// </summary>
    [HttpGet("list-views/{entitySlug}")]
    [ProducesResponseType(typeof(ApiResponse<ListViewConfigDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetListViewConfig(string entitySlug)
    {
        var entity = await _db.EntityMetadatas
            .Include(e => e.ListViewConfig)
            .Include(e => e.Fields.Where(f => f.ShowInList).OrderBy(f => f.SortOrder))
            .Where(e => e.TenantId == _tenant.TenantId && e.Slug == entitySlug && e.IsActive)
            .FirstOrDefaultAsync();

        if (entity is null)
            return NotFound(ApiResponse<object>.ErrorResponse($"Entity '{entitySlug}' not found"));

        List<ListViewColumnDto> columns;

        if (entity.ListViewConfig?.ColumnsJson is not null && entity.ListViewConfig.ColumnsJson != "[]")
        {
            // Use the saved config if one exists
            columns = JsonSerializer.Deserialize<List<ListViewColumnDto>>(entity.ListViewConfig.ColumnsJson)
                      ?? new List<ListViewColumnDto>();
        }
        else
        {
            // Auto-generate columns from fields that have ShowInList = true
            columns = entity.Fields.Select(f => new ListViewColumnDto
            {
                Field = f.Name,
                Label = f.Label,
                Sortable = f.IsSortable,
                Filterable = f.IsFilterable,
                Type = f.FieldType
            }).ToList();
        }

        var dto = new ListViewConfigDto
        {
            Entity = entitySlug,
            Columns = columns,
            DefaultSortField = entity.ListViewConfig?.DefaultSortField,
            DefaultSortDirection = entity.ListViewConfig?.DefaultSortDirection ?? "asc",
            DefaultPageSize = entity.ListViewConfig?.DefaultPageSize ?? 20
        };

        return Ok(ApiResponse<ListViewConfigDto>.SuccessResponse(dto));
    }

    /// <summary>
    /// Create a new entity definition (used by the entity builder / admin setup).
    /// </summary>
    [HttpPost("entities")]
    [ProducesResponseType(typeof(ApiResponse<EntitySummaryDto>), 201)]
    public async Task<IActionResult> CreateEntity([FromBody] CreateEntityMetadataRequest request)
    {
        if (await _db.EntityMetadatas.AnyAsync(e => e.TenantId == _tenant.TenantId && e.Slug == request.Slug))
            return Conflict(ApiResponse<object>.ErrorResponse($"Entity with slug '{request.Slug}' already exists"));

        var entity = new Domain.Entities.EntityMetadata
        {
            TenantId = _tenant.TenantId ?? 0,
            Slug = request.Slug,
            Name = request.Name,
            NamePlural = request.NamePlural ?? request.Name + "s",
            Description = request.Description,
            Icon = request.Icon,
            TableName = request.TableName ?? request.Slug.Replace("-", "_"),
            DatabaseSchema = "dbo",
            PrimaryKeyColumn = "Id",
            IsApiEnabled = true,
            EnableSoftDelete = request.EnableSoftDelete,
            EnableAuditLog = request.EnableAuditLog,
            DisplayField = request.DisplayField
        };

        _db.EntityMetadatas.Add(entity);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Entity '{Slug}' created for tenant {TenantId}", request.Slug, _tenant.TenantId);

        var result = new EntitySummaryDto
        {
            Id = entity.Id,
            Slug = entity.Slug,
            Name = entity.Name,
            NamePlural = entity.NamePlural,
            Icon = entity.Icon
        };

        return CreatedAtAction(nameof(GetEntity), new { slug = entity.Slug },
            ApiResponse<EntitySummaryDto>.SuccessResponse(result, "Entity created"));
    }

    // ────────────────────────────────────────────────────────────────────────
    // DASHBOARDS
    // ────────────────────────────────────────────────────────────────────────

    /// <summary>Get all dashboards for the current tenant.</summary>
    [HttpGet("dashboards")]
    [ProducesResponseType(typeof(ApiResponse<List<DashboardSummaryDto>>), 200)]
    public async Task<IActionResult> GetDashboards()
    {
        var dashboards = await _db.DashboardConfigs
            .Where(d => d.TenantId == _tenant.TenantId && d.IsActive)
            .OrderBy(d => d.SortOrder).ThenBy(d => d.Name)
            .Select(d => new DashboardSummaryDto
            {
                Id = d.Id.ToString(),
                Slug = d.Slug,
                Name = d.Name,
                IsDefault = d.IsDefault
            })
            .ToListAsync();

        return Ok(ApiResponse<List<DashboardSummaryDto>>.SuccessResponse(dashboards));
    }

    /// <summary>
    /// Get a full dashboard config including all widgets.
    /// Called by DynamicDashboard on the dashboard page.
    /// </summary>
    [HttpGet("dashboards/{slug}")]
    [ProducesResponseType(typeof(ApiResponse<DashboardConfigDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetDashboard(string slug)
    {
        var dashboard = await _db.DashboardConfigs
            .Include(d => d.Widgets.OrderBy(w => w.SortOrder))
            .Where(d => d.TenantId == _tenant.TenantId && d.Slug == slug && d.IsActive)
            .FirstOrDefaultAsync();

        if (dashboard is null)
            return NotFound(ApiResponse<object>.ErrorResponse($"Dashboard '{slug}' not found"));

        var dto = new DashboardConfigDto
        {
            Id = dashboard.Id.ToString(),
            Slug = dashboard.Slug,
            Name = dashboard.Name,
            Widgets = dashboard.Widgets.Select(w => new DashboardWidgetDto
            {
                Id = w.Id.ToString(),
                Type = w.WidgetType,
                Title = w.Title,
                Position = new WidgetPositionDto
                {
                    X = w.PositionX,
                    Y = w.PositionY,
                    W = w.Width,
                    H = w.Height
                },
                Config = JsonSerializer.Deserialize<Dictionary<string, object>>(w.ConfigJson)
                         ?? new Dictionary<string, object>(),
                DataSource = w.DataSourceJson is not null
                    ? JsonSerializer.Deserialize<Dictionary<string, object>>(w.DataSourceJson)
                    : null,
                RefreshIntervalSeconds = w.RefreshIntervalSeconds
            }).ToList()
        };

        return Ok(ApiResponse<DashboardConfigDto>.SuccessResponse(dto));
    }

    /// <summary>Save or update a full dashboard layout (used by Dashboard Builder).</summary>
    [HttpPut("dashboards/{slug}")]
    [ProducesResponseType(typeof(ApiResponse<DashboardConfigDto>), 200)]
    public async Task<IActionResult> SaveDashboard(string slug, [FromBody] SaveDashboardRequest request)
    {
        var dashboard = await _db.DashboardConfigs
            .Include(d => d.Widgets)
            .Where(d => d.TenantId == _tenant.TenantId && d.Slug == slug)
            .FirstOrDefaultAsync();

        if (dashboard is null)
        {
            dashboard = new Domain.Entities.DashboardConfig
            {
                TenantId = _tenant.TenantId ?? 0,
                Slug = slug,
                Name = request.Name,
                IsDefault = request.IsDefault
            };
            _db.DashboardConfigs.Add(dashboard);
        }
        else
        {
            dashboard.Name = request.Name;
            dashboard.IsDefault = request.IsDefault;
            // Remove old widgets and replace
            _db.DashboardWidgets.RemoveRange(dashboard.Widgets);
        }

        dashboard.Widgets = request.Widgets.Select((w, i) => new Domain.Entities.DashboardWidget
        {
            WidgetType = w.Type,
            Title = w.Title,
            PositionX = w.Position.X,
            PositionY = w.Position.Y,
            Width = w.Position.W,
            Height = w.Position.H,
            ConfigJson = JsonSerializer.Serialize(w.Config),
            DataSourceJson = w.DataSource is not null ? JsonSerializer.Serialize(w.DataSource) : null,
            RefreshIntervalSeconds = w.RefreshIntervalSeconds,
            SortOrder = i
        }).ToList();

        await _db.SaveChangesAsync();
        return await GetDashboard(slug);
    }

    // ────────────────────────────────────────────────────────────────────────
    // SIDEBAR MENU
    // ────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Returns the sidebar navigation menu built from active entities and dashboards.
    /// The frontend sidebar fetches this on startup.
    /// </summary>
    [HttpGet("menus")]
    [ProducesResponseType(typeof(ApiResponse<List<MenuItemDto>>), 200)]
    public async Task<IActionResult> GetMenus()
    {
        var entities = await _db.EntityMetadatas
            .Where(e => e.TenantId == _tenant.TenantId && e.IsActive && e.IsApiEnabled)
            .OrderBy(e => e.SortOrder).ThenBy(e => e.Name)
            .Select(e => new { e.Slug, e.Name, e.NamePlural, e.Icon })
            .ToListAsync();

        var menus = entities.Select(e => new MenuItemDto
        {
            Id = e.Slug,
            Label = e.NamePlural,
            Icon = e.Icon ?? "database",
            Path = $"/entities/{e.Slug}",
            Order = 0
        }).ToList();

        return Ok(ApiResponse<List<MenuItemDto>>.SuccessResponse(menus));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static EntityFieldDto MapField(Domain.Entities.EntityField f) => new()
    {
        Id = f.Id.ToString(),
        Name = f.Name,
        Label = f.Label,
        FieldType = f.FieldType,
        Required = f.IsRequired,
        Readonly = f.IsReadonly,
        Placeholder = f.Placeholder,
        HelpText = f.HelpText,
        DefaultValue = f.DefaultValue,
        Order = f.SortOrder,
        Options = f.Options is not null
            ? JsonSerializer.Deserialize<List<FieldOptionDto>>(f.Options)
            : null,
        RelationConfig = f.RelationConfig is not null
            ? JsonSerializer.Deserialize<RelationConfigDto>(f.RelationConfig)
            : null,
        ValidationRules = f.ValidationRules is not null
            ? JsonSerializer.Deserialize<Dictionary<string, object>>(f.ValidationRules)
            : null,
        ConditionalVisibility = f.ConditionalVisibility is not null
            ? JsonSerializer.Deserialize<ConditionalVisibilityDto>(f.ConditionalVisibility)
            : null
    };
}

// ── DTOs (Request / Response) — clear, self-documenting field names ──────────

public record EntitySummaryDto
{
    public int Id { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string NamePlural { get; init; } = string.Empty;
    public string? Icon { get; init; }
    public string? Description { get; init; }
}

public record EntityConfigDto
{
    public string Id { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string NamePlural { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string LabelPlural { get; init; } = string.Empty;
    public string? Icon { get; init; }
    public string? Description { get; init; }
    public EntitySettingsDto Settings { get; init; } = new();
    public EntityPermissionsDto Permissions { get; init; } = new();
    public List<EntityFieldDto> Fields { get; init; } = new();
}

public record EntitySettingsDto
{
    public bool EnableAudit { get; init; }
    public bool EnableSoftDelete { get; init; }
}

public record EntityPermissionsDto
{
    public string Create { get; init; } = string.Empty;
    public string Read { get; init; } = string.Empty;
    public string Update { get; init; } = string.Empty;
    public string Delete { get; init; } = string.Empty;
}

public record EntityFieldDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string FieldType { get; init; } = "text";
    public bool Required { get; init; }
    public bool Readonly { get; init; }
    public string? Placeholder { get; init; }
    public string? HelpText { get; init; }
    public string? DefaultValue { get; init; }
    public int Order { get; init; }
    public List<FieldOptionDto>? Options { get; init; }
    public RelationConfigDto? RelationConfig { get; init; }
    public Dictionary<string, object>? ValidationRules { get; init; }
    public ConditionalVisibilityDto? ConditionalVisibility { get; init; }
}

public record FieldOptionDto
{
    public string Label { get; init; } = string.Empty;
    public string Value { get; init; } = string.Empty;
}

public record RelationConfigDto
{
    public string Entity { get; init; } = string.Empty;
    public string DisplayField { get; init; } = "name";
    public string ValueField { get; init; } = "id";
}

public record ConditionalVisibilityDto
{
    public string Field { get; init; } = string.Empty;
    public string Operator { get; init; } = "equals";
    public object? Value { get; init; }
}

public record ListViewConfigDto
{
    public string Entity { get; init; } = string.Empty;
    public List<ListViewColumnDto> Columns { get; init; } = new();
    public string? DefaultSortField { get; init; }
    public string DefaultSortDirection { get; init; } = "asc";
    public int DefaultPageSize { get; init; } = 20;
}

public record ListViewColumnDto
{
    public string Field { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public bool Sortable { get; init; } = true;
    public bool Filterable { get; init; } = false;
    public string? Type { get; init; }
    public int? Width { get; init; }
    public string Align { get; init; } = "left";
}

public record DashboardSummaryDto
{
    public string Id { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
}

public record DashboardConfigDto
{
    public string Id { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public List<DashboardWidgetDto> Widgets { get; init; } = new();
}

public record DashboardWidgetDto
{
    public string Id { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public WidgetPositionDto Position { get; init; } = new();
    public Dictionary<string, object> Config { get; init; } = new();
    public Dictionary<string, object>? DataSource { get; init; }
    public int RefreshIntervalSeconds { get; init; }
}

public record WidgetPositionDto
{
    public int X { get; init; }
    public int Y { get; init; }
    public int W { get; init; } = 3;
    public int H { get; init; } = 2;
}

public record MenuItemDto
{
    public string Id { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string? Icon { get; init; }
    public string? Path { get; init; }
    public int Order { get; init; }
    public List<MenuItemDto>? Children { get; init; }
}

public record CreateEntityMetadataRequest
{
    public string Slug { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? NamePlural { get; init; }
    public string? Description { get; init; }
    public string? Icon { get; init; }
    public string? TableName { get; init; }
    public string? DisplayField { get; init; }
    public bool EnableSoftDelete { get; init; } = true;
    public bool EnableAuditLog { get; init; } = true;
}

public record SaveDashboardRequest
{
    public string Name { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
    public List<DashboardWidgetDto> Widgets { get; init; } = new();
}
