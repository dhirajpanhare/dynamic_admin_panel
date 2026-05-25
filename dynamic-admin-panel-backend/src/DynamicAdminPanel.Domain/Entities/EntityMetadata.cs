using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// THE CORE metadata table. Defines an entity (e.g. "products", "orders")
/// that the dynamic engine will serve CRUD APIs and pages for automatically.
/// </summary>
public class EntityMetadata : BaseEntity<int>
{
    public int TenantId { get; set; }

    /// <summary>URL-safe identifier: "products", "blog-posts"</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Display name: "Products"</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Plural display name: "Products"</summary>
    public string NamePlural { get; set; } = string.Empty;

    /// <summary>Description shown in UI</summary>
    public string? Description { get; set; }

    /// <summary>Lucide icon name: "package", "users"</summary>
    public string? Icon { get; set; }

    /// <summary>Actual SQL table name this entity reads/writes to</summary>
    public string TableName { get; set; } = string.Empty;

    /// <summary>SQL schema (for schema isolation)</summary>
    public string DatabaseSchema { get; set; } = "dbo";

    /// <summary>Primary key column name in the target table</summary>
    public string PrimaryKeyColumn { get; set; } = "Id";

    /// <summary>Whether the dynamic API is enabled for this entity</summary>
    public bool IsApiEnabled { get; set; } = true;

    /// <summary>Allow soft delete (sets DeletedAt instead of deleting rows)</summary>
    public bool EnableSoftDelete { get; set; } = true;

    /// <summary>Track all changes in AuditLogs table</summary>
    public bool EnableAuditLog { get; set; } = true;

    /// <summary>Column name to use as display label in relation fields</summary>
    public string? DisplayField { get; set; }

    /// <summary>Sidebar menu order</summary>
    public int SortOrder { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual Tenant? Tenant { get; set; }
    public virtual ICollection<EntityField> Fields { get; set; } = new List<EntityField>();
    public virtual FormConfig? FormConfig { get; set; }
    public virtual ListViewConfig? ListViewConfig { get; set; }
}
