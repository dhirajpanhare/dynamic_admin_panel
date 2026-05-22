using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Shared.Requests;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DynamicAdminPanel.API.Controllers;

/// <summary>
/// Dynamic API controller for CRUD operations on any entity type
/// Supports metadata-driven operations with flexible filtering, sorting, and pagination
/// </summary>
[ApiController]
[Route("api/v1/dynamic/{entitySlug}")]
[Authorize]
public class DynamicApiController : ControllerBase
{
    private readonly IStoredProcedureExecutor _spExecutor;
    private readonly ILogger<DynamicApiController> _logger;
    private readonly ITenantContext _tenantContext;

    public DynamicApiController(
        IStoredProcedureExecutor spExecutor,
        ILogger<DynamicApiController> logger,
        ITenantContext tenantContext)
    {
        _spExecutor = spExecutor;
        _logger = logger;
        _tenantContext = tenantContext;
    }

    /// <summary>
    /// Get a paginated list of entities with optional filtering, sorting, and search
    /// </summary>
    /// <param name="entitySlug">Entity type identifier (e.g., 'users', 'products')</param>
    /// <param name="request">Query parameters for filtering, pagination, and sorting</param>
    /// <returns>Paginated list of entities</returns>
    /// <response code="200">Entities retrieved successfully</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    /// <response code="404">Entity type not found</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<Dictionary<string, object>>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<PagedResponse<Dictionary<string, object>>>>> GetEntities(
        string entitySlug,
        [FromQuery] DynamicQueryRequest request)
    {
        _logger.LogInformation("Getting entities for {EntitySlug} with filters: {@Filters}", entitySlug, request.Filters);

        // Build dynamic parameters from request
        var parameters = new Dictionary<string, object>
        {
            ["EntitySlug"] = entitySlug,
            ["TenantId"] = _tenantContext.TenantId ?? 0,
            ["Page"] = request.Page,
            ["PageSize"] = request.PageSize,
            ["SortBy"] = request.SortBy ?? string.Empty,
            ["SortOrder"] = request.SortOrder ?? string.Empty,
            ["Search"] = request.Search ?? string.Empty
        };

        // Add dynamic filters
        if (request.Filters != null && request.Filters.Any())
        {
            parameters["Filters"] = System.Text.Json.JsonSerializer.Serialize(request.Filters);
        }

        // Add date range filters
        if (request.DateFrom.HasValue)
        {
            parameters["DateFrom"] = request.DateFrom.Value;
        }

        if (request.DateTo.HasValue)
        {
            parameters["DateTo"] = request.DateTo.Value;
        }

        // Add field selection
        if (!string.IsNullOrEmpty(request.Fields))
        {
            parameters["Fields"] = request.Fields;
        }

        if (!string.IsNullOrEmpty(request.Include))
        {
            parameters["Include"] = request.Include;
        }

        if (!string.IsNullOrEmpty(request.Ids))
        {
            parameters["Ids"] = request.Ids;
        }

        // Add custom parameters
        if (request.CustomParams != null && request.CustomParams.Any())
        {
            foreach (var param in request.CustomParams)
            {
                parameters[param.Key] = param.Value;
            }
        }

        var items = await _spExecutor.ExecuteQueryAsync<Dictionary<string, object>>(
            "sp_GetEntities",
            parameters
        );

        var totalCount = await _spExecutor.ExecuteScalarAsync<int>(
            "sp_GetEntitiesCount",
            new { EntitySlug = entitySlug, TenantId = _tenantContext.TenantId, Search = request.Search, Filters = request.Filters != null ? System.Text.Json.JsonSerializer.Serialize(request.Filters) : null }
        );

        var pagedResponse = new PagedResponse<Dictionary<string, object>>(
            items.ToList(),
            totalCount,
            request.Page,
            request.PageSize
        );

        return Ok(ApiResponse<PagedResponse<Dictionary<string, object>>>.SuccessResponse(
            pagedResponse,
            "Entities retrieved successfully"
        ));
    }

    /// <summary>
    /// Get a single entity by its ID
    /// </summary>
    /// <param name="entitySlug">Entity type identifier (e.g., 'users', 'products')</param>
    /// <param name="id">Entity ID</param>
    /// <returns>Entity data</returns>
    /// <response code="200">Entity retrieved successfully</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    /// <response code="404">Entity not found</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Dictionary<string, object>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<Dictionary<string, object>>>> GetEntityById(
        string entitySlug,
        string id)
    {
        _logger.LogInformation("Getting entity {EntitySlug} with ID {Id}", entitySlug, id);

        var parameters = new
        {
            EntitySlug = entitySlug,
            TenantId = _tenantContext.TenantId,
            EntityId = id
        };

        var entity = await _spExecutor.ExecuteQueryFirstOrDefaultAsync<Dictionary<string, object>>(
            "sp_GetEntityById",
            parameters
        );

        if (entity == null)
        {
            return NotFound(ApiResponse<Dictionary<string, object>>.ErrorResponse(
                $"Entity {entitySlug} with ID {id} not found"
            ));
        }

        return Ok(ApiResponse<Dictionary<string, object>>.SuccessResponse(
            entity,
            "Entity retrieved successfully"
        ));
    }

    /// <summary>
    /// Create a new entity
    /// </summary>
    /// <param name="entitySlug">Entity type identifier (e.g., 'users', 'products')</param>
    /// <param name="request">Entity data as key-value pairs</param>
    /// <returns>Created entity data</returns>
    /// <response code="201">Entity created successfully</response>
    /// <response code="400">Invalid entity data</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Dictionary<string, object>>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<Dictionary<string, object>>>> CreateEntity(
        string entitySlug,
        [FromBody] CreateEntityRequest request)
    {
        _logger.LogInformation("Creating entity {EntitySlug}", entitySlug);

        var parameters = new
        {
            EntitySlug = entitySlug,
            TenantId = _tenantContext.TenantId,
            Data = System.Text.Json.JsonSerializer.Serialize(request.Data)
        };

        var newEntity = await _spExecutor.ExecuteQueryFirstOrDefaultAsync<Dictionary<string, object>>(
            "sp_CreateEntity",
            parameters
        );

        return CreatedAtAction(
            nameof(GetEntityById),
            new { entitySlug, id = newEntity?["Id"] },
            ApiResponse<Dictionary<string, object>>.SuccessResponse(
                newEntity!,
                "Entity created successfully"
            )
        );
    }

    /// <summary>
    /// Update an existing entity
    /// </summary>
    /// <param name="entitySlug">Entity type identifier (e.g., 'users', 'products')</param>
    /// <param name="id">Entity ID</param>
    /// <param name="request">Updated entity data as key-value pairs</param>
    /// <returns>Updated entity data</returns>
    /// <response code="200">Entity updated successfully</response>
    /// <response code="400">Invalid entity data</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    /// <response code="404">Entity not found</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Dictionary<string, object>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<Dictionary<string, object>>>> UpdateEntity(
        string entitySlug,
        string id,
        [FromBody] UpdateEntityRequest request)
    {
        _logger.LogInformation("Updating entity {EntitySlug} with ID {Id}", entitySlug, id);

        var parameters = new
        {
            EntitySlug = entitySlug,
            TenantId = _tenantContext.TenantId,
            EntityId = id,
            Data = System.Text.Json.JsonSerializer.Serialize(request.Data)
        };

        var updatedEntity = await _spExecutor.ExecuteQueryFirstOrDefaultAsync<Dictionary<string, object>>(
            "sp_UpdateEntity",
            parameters
        );

        if (updatedEntity == null)
        {
            return NotFound(ApiResponse<Dictionary<string, object>>.ErrorResponse(
                $"Entity {entitySlug} with ID {id} not found"
            ));
        }

        return Ok(ApiResponse<Dictionary<string, object>>.SuccessResponse(
            updatedEntity,
            "Entity updated successfully"
        ));
    }

    /// <summary>
    /// Delete an entity (soft delete by default, hard delete optional)
    /// </summary>
    /// <param name="entitySlug">Entity type identifier (e.g., 'users', 'products')</param>
    /// <param name="id">Entity ID</param>
    /// <param name="request">Delete options (hard delete flag)</param>
    /// <returns>Success status</returns>
    /// <response code="200">Entity deleted successfully</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    /// <response code="404">Entity not found</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteEntity(
        string entitySlug,
        string id,
        [FromQuery] DeleteEntityRequest request)
    {
        _logger.LogInformation("Deleting entity {EntitySlug} with ID {Id} (HardDelete: {HardDelete})", 
            entitySlug, id, request.HardDelete);

        var parameters = new
        {
            EntitySlug = entitySlug,
            TenantId = _tenantContext.TenantId,
            EntityId = id,
            HardDelete = request.HardDelete
        };

        var rowsAffected = await _spExecutor.ExecuteAsync("sp_DeleteEntity", parameters);

        if (rowsAffected == 0)
        {
            return NotFound(ApiResponse<bool>.ErrorResponse(
                $"Entity {entitySlug} with ID {id} not found"
            ));
        }

        return Ok(ApiResponse<bool>.SuccessResponse(
            true,
            "Entity deleted successfully"
        ));
    }
}
