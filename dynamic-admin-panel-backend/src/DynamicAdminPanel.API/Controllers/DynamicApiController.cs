using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Infrastructure.Persistence;
using DynamicAdminPanel.Shared.Requests;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DynamicAdminPanel.API.Controllers;

/// <summary>
/// Serves real CRUD operations for any entity defined in the metadata engine.
/// Each operation:
///   1. Loads the entity metadata (slug -> table name, fields, schema)
///   2. Delegates to DynamicQueryBuilder which builds safe, parameterized SQL
///   3. Returns structured JSON responses consistent across all entities
/// </summary>
[ApiController]
[Route("api/v1/dynamic/{entitySlug}")]
[Authorize]
public class DynamicApiController : ControllerBase
{
    private readonly IDynamicQueryBuilder _queryBuilder;
    private readonly ApplicationDbContext _db;
    private readonly ITenantContext _tenant;
    private readonly ILogger<DynamicApiController> _logger;

    public DynamicApiController(
        IDynamicQueryBuilder queryBuilder,
        ApplicationDbContext db,
        ITenantContext tenant,
        ILogger<DynamicApiController> logger)
    {
        _queryBuilder = queryBuilder;
        _db = db;
        _tenant = tenant;
        _logger = logger;
    }

    /// <summary>
    /// Get a paginated, sorted, and filtered list of records for any entity.
    /// Query params: page, pageSize, sortBy, sortDirection, search, filter[field]=value
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<Dictionary<string, object?>>>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetList(string entitySlug, [FromQuery] DynamicQueryRequest req)
    {
        var meta = await LoadEntityMetaAsync(entitySlug);
        if (meta is null)
            return NotFound(ApiResponse<object>.ErrorResponse($"Entity ''{entitySlug}'' not found"));

        var query = new DynamicListQuery(
            TableName: meta.TableName,
            Schema: meta.Schema,
            PrimaryKeyColumn: meta.PrimaryKey,
            EnableSoftDelete: meta.SoftDelete,
            AllowedColumns: meta.AllowedColumns,
            Page: req.Page,
            PageSize: Math.Min(req.PageSize, 200),
            SortBy: req.SortBy,
            SortDirection: req.SortOrder ?? "asc",
            Search: req.Search,
            SearchableColumns: meta.SearchableColumns,
            Filters: req.Filters);

        var result = await _queryBuilder.GetListAsync(query);
        var paged = new PagedResponse<Dictionary<string, object?>>(
            result.Items.ToList(), result.TotalCount, result.Page, result.PageSize);

        return Ok(ApiResponse<PagedResponse<Dictionary<string, object?>>>.SuccessResponse(paged));
    }

    /// <summary>Get a single record by its primary key.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Dictionary<string, object?>>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(string entitySlug, string id)
    {
        var meta = await LoadEntityMetaAsync(entitySlug);
        if (meta is null)
            return NotFound(ApiResponse<object>.ErrorResponse($"Entity ''{entitySlug}'' not found"));

        var query = new DynamicSingleQuery(
            meta.TableName, meta.Schema, meta.PrimaryKey, meta.SoftDelete, meta.AllowedColumns, id);

        var row = await _queryBuilder.GetByIdAsync(query);
        if (row is null)
            return NotFound(ApiResponse<object>.ErrorResponse($"Record ''{id}'' not found in ''{entitySlug}''"));

        return Ok(ApiResponse<Dictionary<string, object?>>.SuccessResponse(row));
    }

    /// <summary>
    /// Create a new record. Body is a flat JSON object: { "fieldName": value, ... }
    /// Unknown fields (not in entity metadata) are silently ignored.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Dictionary<string, object?>>), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Create(string entitySlug, [FromBody] Dictionary<string, object?> payload)
    {
        var meta = await LoadEntityMetaAsync(entitySlug);
        if (meta is null)
            return NotFound(ApiResponse<object>.ErrorResponse($"Entity ''{entitySlug}'' not found"));

        var query = new DynamicWriteQuery(
            meta.TableName, meta.Schema, meta.PrimaryKey, meta.WritableColumns, payload);

        var created = await _queryBuilder.CreateAsync(query);
        _logger.LogInformation("Created record in {Slug}", entitySlug);

        return CreatedAtAction(nameof(GetById),
            new { entitySlug, id = created.GetValueOrDefault(meta.PrimaryKey) },
            ApiResponse<Dictionary<string, object?>>.SuccessResponse(created, "Record created"));
    }

    /// <summary>
    /// Update an existing record. Only provided fields are updated.
    /// Body: { "fieldName": newValue, ... }
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Dictionary<string, object?>>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(string entitySlug, string id, [FromBody] Dictionary<string, object?> payload)
    {
        var meta = await LoadEntityMetaAsync(entitySlug);
        if (meta is null)
            return NotFound(ApiResponse<object>.ErrorResponse($"Entity ''{entitySlug}'' not found"));

        var query = new DynamicWriteQuery(
            meta.TableName, meta.Schema, meta.PrimaryKey, meta.WritableColumns, payload, Id: id);

        var updated = await _queryBuilder.UpdateAsync(query);
        if (updated.Count == 0)
            return NotFound(ApiResponse<object>.ErrorResponse($"Record ''{id}'' not found in ''{entitySlug}''"));

        return Ok(ApiResponse<Dictionary<string, object?>>.SuccessResponse(updated, "Record updated"));
    }

    /// <summary>
    /// Delete a record. Soft-delete by default; pass ?hardDelete=true to permanently remove.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(string entitySlug, string id, [FromQuery] bool hardDelete = false)
    {
        var meta = await LoadEntityMetaAsync(entitySlug);
        if (meta is null)
            return NotFound(ApiResponse<object>.ErrorResponse($"Entity ''{entitySlug}'' not found"));

        var useSoftDelete = meta.SoftDelete && !hardDelete;
        var query = new DynamicDeleteQuery(meta.TableName, meta.Schema, meta.PrimaryKey, useSoftDelete, id);
        await _queryBuilder.DeleteAsync(query);

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Record deleted"));
    }

    /// <summary>
    /// Bulk delete multiple records by ID list.
    /// Body: { "ids": ["1", "2", "3"] }
    /// </summary>
    [HttpDelete("bulk-delete")]
    [ProducesResponseType(typeof(ApiResponse<BulkDeleteResultDto>), 200)]
    public async Task<IActionResult> BulkDelete(string entitySlug, [FromBody] BulkDeleteBodyDto body)
    {
        var meta = await LoadEntityMetaAsync(entitySlug);
        if (meta is null)
            return NotFound(ApiResponse<object>.ErrorResponse($"Entity ''{entitySlug}'' not found"));

        int deleted = 0;
        foreach (var id in body.Ids)
        {
            var query = new DynamicDeleteQuery(meta.TableName, meta.Schema, meta.PrimaryKey, meta.SoftDelete, id);
            await _queryBuilder.DeleteAsync(query);
            deleted++;
        }

        return Ok(ApiResponse<BulkDeleteResultDto>.SuccessResponse(
            new BulkDeleteResultDto(deleted), $"{deleted} records deleted"));
    }

    // ---- helpers -----

    private async Task<EntityMeta?> LoadEntityMetaAsync(string slug)
    {
        var entity = await _db.EntityMetadatas
            .Include(e => e.Fields)
            .Where(e => e.TenantId == _tenant.TenantId && e.Slug == slug && e.IsActive && e.IsApiEnabled)
            .FirstOrDefaultAsync();

        if (entity is null) return null;

        var allCols = entity.Fields.Select(f => f.ColumnName).ToList();
        var writableCols = entity.Fields.Where(f => !f.IsReadonly).Select(f => f.ColumnName).ToList();
        var searchCols = entity.Fields
            .Where(f => f.IsFilterable || f.FieldType == "text" || f.FieldType == "email")
            .Select(f => f.ColumnName).ToList();

        return new EntityMeta(
            entity.TableName, entity.DatabaseSchema, entity.PrimaryKeyColumn,
            entity.EnableSoftDelete, allCols, writableCols, searchCols);
    }

    private record EntityMeta(
        string TableName, string Schema, string PrimaryKey, bool SoftDelete,
        IReadOnlyList<string> AllowedColumns, IReadOnlyList<string> WritableColumns,
        IReadOnlyList<string> SearchableColumns);
}

public record BulkDeleteBodyDto(IReadOnlyList<string> Ids);
public record BulkDeleteResultDto(int DeletedCount);
