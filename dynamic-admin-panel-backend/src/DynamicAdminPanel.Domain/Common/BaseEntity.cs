namespace DynamicAdminPanel.Domain.Common;

public abstract class BaseEntity
{
    public DateTime CreateDateTime { get; set; } = DateTime.UtcNow;
    public DateTime UpdateDateTime { get; set; } = DateTime.UtcNow;
    public DateTime? DeleteDateTime { get; set; }
    public bool IsDeleted => DeleteDateTime.HasValue;
}

public abstract class BaseEntity<TKey> : BaseEntity
{
    public TKey Id { get; set; } = default!;
}
