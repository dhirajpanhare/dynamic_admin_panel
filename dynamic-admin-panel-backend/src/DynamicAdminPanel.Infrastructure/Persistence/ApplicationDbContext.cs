using DynamicAdminPanel.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DynamicAdminPanel.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // ── Identity & Auth ──────────────────────────────────────────────────────
    public DbSet<User> Users => Set<User>();
    public DbSet<UserLoginLog> UserLoginLogs => Set<UserLoginLog>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // ── Tenancy ──────────────────────────────────────────────────────────────
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantBranding> TenantBrandings => Set<TenantBranding>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<UserTenant> UserTenants => Set<UserTenant>();

    // ── RBAC ─────────────────────────────────────────────────────────────────
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

    // ── Metadata Engine (Core Innovation) ────────────────────────────────────
    public DbSet<EntityMetadata> EntityMetadatas => Set<EntityMetadata>();
    public DbSet<EntityField> EntityFields => Set<EntityField>();
    public DbSet<FormConfig> FormConfigs => Set<FormConfig>();
    public DbSet<ListViewConfig> ListViewConfigs => Set<ListViewConfig>();

    // ── Dashboard ─────────────────────────────────────────────────────────────
    public DbSet<DashboardConfig> DashboardConfigs => Set<DashboardConfig>();
    public DbSet<DashboardWidget> DashboardWidgets => Set<DashboardWidget>();

    // ── Workflow Engine ───────────────────────────────────────────────────────
    public DbSet<WorkflowDefinition> WorkflowDefinitions => Set<WorkflowDefinition>();
    public DbSet<WorkflowStep> WorkflowSteps => Set<WorkflowStep>();
    public DbSet<WorkflowInstance> WorkflowInstances => Set<WorkflowInstance>();
    public DbSet<WorkflowLog> WorkflowLogs => Set<WorkflowLog>();

    // ── Notifications & Files ─────────────────────────────────────────────────
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<FileRecord> FileRecords => Set<FileRecord>();

    // ── Audit ─────────────────────────────────────────────────────────────────
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("UserId");
            entity.Property(e => e.UserMailAddress).HasMaxLength(100).IsRequired();
            entity.Property(e => e.UserName).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.UserMailAddress).IsUnique();

            entity.HasMany(e => e.UserRoles).WithOne(e => e.User)
                .HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(e => e.LoginLogs).WithOne(e => e.User)
                .HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserLoginLog>(entity =>
        {
            entity.ToTable("UserLoginLog");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("UserLoggingLogId");
            entity.Property(e => e.LoginIPAddress).HasMaxLength(45);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).HasMaxLength(256).IsRequired();
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(e => e.User).WithMany()
                .HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Tenant ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.ToTable("Tenants");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("TenantId");
            entity.Property(e => e.WorkSpaceName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.SubDomainName).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.SubDomainName).IsUnique();

            entity.HasOne(e => e.Branding).WithOne(e => e.Tenant)
                .HasForeignKey<TenantBranding>(e => e.TenantId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TenantBranding>(entity =>
        {
            entity.ToTable("TenantBranding");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("TenantBrandingId");
        });

        modelBuilder.Entity<Organization>(entity =>
        {
            entity.ToTable("Organizations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("OrganizationId");
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => new { e.TenantId, e.Slug }).IsUnique();

            entity.HasOne(e => e.Tenant).WithMany()
                .HasForeignKey(e => e.TenantId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.ParentOrganization).WithMany(e => e.ChildOrganizations)
                .HasForeignKey(e => e.ParentOrganizationId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<UserTenant>(entity =>
        {
            entity.ToTable("UserTenants");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("UserTenantId");
            entity.HasIndex(e => new { e.UserId, e.TenantId }).IsUnique();

            entity.HasOne(e => e.User).WithMany()
                .HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Tenant).WithMany()
                .HasForeignKey(e => e.TenantId).OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(e => e.Organization).WithMany(e => e.UserTenants)
                .HasForeignKey(e => e.OrganizationId).OnDelete(DeleteBehavior.SetNull);
        });

        // ── RBAC ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("RoleId");
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();

            entity.HasMany(e => e.UserRoles).WithOne(e => e.Role)
                .HasForeignKey(e => e.RoleId).OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(e => e.RolePermissions).WithOne(e => e.Role)
                .HasForeignKey(e => e.RoleId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("Permissions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("PermissionId");
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();

            entity.HasMany(e => e.RolePermissions).WithOne(e => e.Permission)
                .HasForeignKey(e => e.PermissionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("UserRoles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("UserRoleId");
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("RolePermissions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("RolePermissionId");
        });

        // ── Metadata Engine ───────────────────────────────────────────────────
        modelBuilder.Entity<EntityMetadata>(entity =>
        {
            entity.ToTable("EntityMetadatas");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.TableName).HasMaxLength(255).IsRequired();
            entity.HasIndex(e => new { e.TenantId, e.Slug }).IsUnique();

            entity.HasOne(e => e.Tenant).WithMany()
                .HasForeignKey(e => e.TenantId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.FormConfig).WithOne(e => e.EntityMetadata)
                .HasForeignKey<FormConfig>(e => e.EntityMetadataId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.ListViewConfig).WithOne(e => e.EntityMetadata)
                .HasForeignKey<ListViewConfig>(e => e.EntityMetadataId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EntityField>(entity =>
        {
            entity.ToTable("EntityFields");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.ColumnName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Label).HasMaxLength(255).IsRequired();
            entity.Property(e => e.FieldType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ValidationRules).HasColumnType("nvarchar(max)");
            entity.Property(e => e.Options).HasColumnType("nvarchar(max)");
            entity.Property(e => e.RelationConfig).HasColumnType("nvarchar(max)");
            entity.Property(e => e.ConditionalVisibility).HasColumnType("nvarchar(max)");

            entity.HasOne(e => e.EntityMetadata).WithMany(e => e.Fields)
                .HasForeignKey(e => e.EntityMetadataId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FormConfig>(entity =>
        {
            entity.ToTable("FormConfigs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LayoutJson).HasColumnType("nvarchar(max)");
        });

        modelBuilder.Entity<ListViewConfig>(entity =>
        {
            entity.ToTable("ListViewConfigs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ColumnsJson).HasColumnType("nvarchar(max)");
            entity.Property(e => e.QuickFiltersJson).HasColumnType("nvarchar(max)");
        });

        // ── Dashboard ─────────────────────────────────────────────────────────
        modelBuilder.Entity<DashboardConfig>(entity =>
        {
            entity.ToTable("DashboardConfigs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => new { e.TenantId, e.Slug }).IsUnique();

            entity.HasOne(e => e.Tenant).WithMany()
                .HasForeignKey(e => e.TenantId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DashboardWidget>(entity =>
        {
            entity.ToTable("DashboardWidgets");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ConfigJson).HasColumnType("nvarchar(max)");
            entity.Property(e => e.DataSourceJson).HasColumnType("nvarchar(max)");

            entity.HasOne(e => e.DashboardConfig).WithMany(e => e.Widgets)
                .HasForeignKey(e => e.DashboardConfigId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Workflow ──────────────────────────────────────────────────────────
        modelBuilder.Entity<WorkflowDefinition>(entity =>
        {
            entity.ToTable("WorkflowDefinitions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            entity.Property(e => e.TriggerConditionJson).HasColumnType("nvarchar(max)");
            entity.HasIndex(e => new { e.TenantId, e.Slug }).IsUnique();

            entity.HasOne(e => e.Tenant).WithMany()
                .HasForeignKey(e => e.TenantId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkflowStep>(entity =>
        {
            entity.ToTable("WorkflowSteps");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.ConfigJson).HasColumnType("nvarchar(max)");

            entity.HasOne(e => e.WorkflowDefinition).WithMany(e => e.Steps)
                .HasForeignKey(e => e.WorkflowDefinitionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkflowInstance>(entity =>
        {
            entity.ToTable("WorkflowInstances");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EntitySlug).HasMaxLength(100).IsRequired();
            entity.Property(e => e.EntityRecordId).HasMaxLength(100).IsRequired();
            entity.Property(e => e.ContextJson).HasColumnType("nvarchar(max)");

            entity.HasOne(e => e.WorkflowDefinition).WithMany(e => e.Instances)
                .HasForeignKey(e => e.WorkflowDefinitionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkflowLog>(entity =>
        {
            entity.ToTable("WorkflowLogs");
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.WorkflowInstance).WithMany(e => e.Logs)
                .HasForeignKey(e => e.WorkflowInstanceId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Notifications & Files ─────────────────────────────────────────────
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Message).HasColumnType("nvarchar(max)");

            entity.HasOne(e => e.RecipientUser).WithMany()
                .HasForeignKey(e => e.RecipientUserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FileRecord>(entity =>
        {
            entity.ToTable("FileRecords");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Url).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.MimeType).HasMaxLength(100);

            entity.HasOne(e => e.UploadedByUser).WithMany()
                .HasForeignKey(e => e.UploadedByUserId).OnDelete(DeleteBehavior.SetNull);
        });

        // ── Audit ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("AuditLogId");
            entity.Property(e => e.OldValues).HasColumnType("nvarchar(max)");
            entity.Property(e => e.NewValues).HasColumnType("nvarchar(max)");
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Domain.Common.BaseEntity && 
                       (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (Domain.Common.BaseEntity)entry.Entity;
            
            if (entry.State == EntityState.Added)
            {
                entity.CreateDateTime = DateTime.UtcNow;
            }
            
            entity.UpdateDateTime = DateTime.UtcNow;
        }
    }
}
