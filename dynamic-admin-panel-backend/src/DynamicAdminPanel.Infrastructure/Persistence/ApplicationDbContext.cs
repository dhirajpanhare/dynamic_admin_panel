using DynamicAdminPanel.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DynamicAdminPanel.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserLoginLog> UserLoginLogs => Set<UserLoginLog>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantBranding> TenantBrandings => Set<TenantBranding>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("UserId");
            entity.Property(e => e.UserMailAddress).HasMaxLength(100).IsRequired();
            entity.Property(e => e.UserName).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.UserMailAddress).IsUnique();
            
            entity.HasMany(e => e.UserRoles)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasMany(e => e.LoginLogs)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // UserLoginLog Configuration
        modelBuilder.Entity<UserLoginLog>(entity =>
        {
            entity.ToTable("UserLoginLog");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("UserLoggingLogId");
            entity.Property(e => e.LoginIPAddress).HasMaxLength(45);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
        });

        // Tenant Configuration
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.ToTable("Tenants");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("TenantId");
            entity.Property(e => e.WorkSpaceName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.SubDomainName).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.SubDomainName).IsUnique();
            
            entity.HasOne(e => e.Branding)
                .WithOne(e => e.Tenant)
                .HasForeignKey<TenantBranding>(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TenantBranding Configuration
        modelBuilder.Entity<TenantBranding>(entity =>
        {
            entity.ToTable("TenantBranding");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("TenantBrandingId");
        });

        // Role Configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("RoleId");
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            
            entity.HasMany(e => e.UserRoles)
                .WithOne(e => e.Role)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasMany(e => e.RolePermissions)
                .WithOne(e => e.Role)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Permission Configuration
        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("Permissions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("PermissionId");
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(100).IsRequired();
            
            entity.HasMany(e => e.RolePermissions)
                .WithOne(e => e.Permission)
                .HasForeignKey(e => e.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // UserRole Configuration
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("UserRoles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("UserRoleId");
        });

        // RolePermission Configuration
        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("RolePermissions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("RolePermissionId");
        });

        // AuditLog Configuration
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("AuditLogId");
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
