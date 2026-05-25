using DynamicAdminPanel.Domain.Entities;
using DynamicAdminPanel.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DynamicAdminPanel.API;

/// <summary>
/// Seeds the database with essential initial data for development/production:
/// - Default tenant
/// - Admin/User roles + permissions
/// - Default admin user
/// - Example entity metadata (Products, Customers)
/// - Default dashboard config
/// </summary>
public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            await SeedTenantAsync(db);
            await SeedPermissionsAsync(db);
            await SeedRolesAsync(db);
            await SeedAdminUserAsync(db, hasher);
            await SeedEntityMetadataAsync(db);
            await SeedDashboardAsync(db);
            await db.SaveChangesAsync();
            logger.LogInformation("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database seeding failed.");
        }
    }

    // ─── Tenant ───────────────────────────────────────────────────────────────

    private static async Task SeedTenantAsync(ApplicationDbContext db)
    {
        if (await db.Tenants.AnyAsync()) return;

        db.Tenants.Add(new Tenant
        {
            WorkSpaceName = "Default Organization",
            SubDomainName = "default",
            Status = "Active",
            SubscriptionTier = "Enterprise",
            SubscriptionStatus = "Active",
            CreateDateTime = DateTime.UtcNow,
            UpdateDateTime = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
    }

    // ─── Permissions ──────────────────────────────────────────────────────────

    private static async Task SeedPermissionsAsync(ApplicationDbContext db)
    {
        if (await db.Permissions.AnyAsync()) return;

        var perms = new[]
        {
            ("users.view",   "View Users",   "Users"),
            ("users.create", "Create Users", "Users"),
            ("users.edit",   "Edit Users",   "Users"),
            ("users.delete", "Delete Users", "Users"),
            ("roles.view",   "View Roles",   "Roles"),
            ("roles.manage", "Manage Roles", "Roles"),
            ("entities.view",   "View Entities",   "Entities"),
            ("entities.manage", "Manage Entities", "Entities"),
            ("audit.view",      "View Audit Logs", "Audit"),
            ("settings.manage", "Manage Settings", "Settings"),
            ("workflows.view",   "View Workflows",   "Workflows"),
            ("workflows.manage", "Manage Workflows", "Workflows"),
            ("dashboard.view",   "View Dashboard",   "Dashboard"),
        };

        foreach (var (slug, name, module) in perms)
        {
            db.Permissions.Add(new Permission
            {
                Name = name,
                Slug = slug,
                Module = module,
                CreateDateTime = DateTime.UtcNow,
                UpdateDateTime = DateTime.UtcNow
            });
        }
        await db.SaveChangesAsync();
    }

    // ─── Roles ────────────────────────────────────────────────────────────────

    private static async Task SeedRolesAsync(ApplicationDbContext db)
    {
        if (await db.Roles.AnyAsync()) return;

        var tenant = await db.Tenants.FirstAsync();
        var allPermIds = await db.Permissions.Select(p => p.Id).ToListAsync();

        var adminRole = new Role
        {
            TenantId = tenant.Id,
            Name = "Administrator",
            Slug = "admin",
            Description = "Full system access",
            IsSystemRole = true,
            CreateDateTime = DateTime.UtcNow,
            UpdateDateTime = DateTime.UtcNow
        };
        var userRole = new Role
        {
            TenantId = tenant.Id,
            Name = "User",
            Slug = "user",
            Description = "Standard user access",
            IsSystemRole = true,
            CreateDateTime = DateTime.UtcNow,
            UpdateDateTime = DateTime.UtcNow
        };

        db.Roles.AddRange(adminRole, userRole);
        await db.SaveChangesAsync();

        // Grant all permissions to admin role
        foreach (var permId in allPermIds)
        {
            db.RolePermissions.Add(new RolePermission
            {
                RoleId = adminRole.Id,
                PermissionId = permId,
                CreateDateTime = DateTime.UtcNow,
                UpdateDateTime = DateTime.UtcNow
            });
        }
        await db.SaveChangesAsync();
    }

    // ─── Admin user ───────────────────────────────────────────────────────────

    private static async Task SeedAdminUserAsync(ApplicationDbContext db, IPasswordHasher<User> hasher)
    {
        if (await db.Users.AnyAsync()) return;

        var tenant = await db.Tenants.FirstAsync();
        var adminRole = await db.Roles.FirstAsync(r => r.Slug == "admin");

        var adminUser = new User
        {
            UserName = "Admin",
            UserMailAddress = "admin@example.com",
            IsActive = true,
            EmailVerified = true,
            CreateDateTime = DateTime.UtcNow,
            UpdateDateTime = DateTime.UtcNow
        };
        adminUser.Password = hasher.HashPassword(adminUser, "Admin@123");

        db.Users.Add(adminUser);
        await db.SaveChangesAsync();

        db.UserTenants.Add(new UserTenant
        {
            UserId = adminUser.Id,
            TenantId = tenant.Id,
            CreateDateTime = DateTime.UtcNow,
            UpdateDateTime = DateTime.UtcNow
        });

        db.UserRoles.Add(new UserRole
        {
            UserId = adminUser.Id,
            RoleId = adminRole.Id,
            CreateDateTime = DateTime.UtcNow,
            UpdateDateTime = DateTime.UtcNow
        });

        await db.SaveChangesAsync();
    }

    // ─── Entity Metadata ──────────────────────────────────────────────────────

    private static async Task SeedEntityMetadataAsync(ApplicationDbContext db)
    {
        if (await db.EntityMetadatas.AnyAsync()) return;

        var tenant = await db.Tenants.FirstAsync();

        // Products entity
        var products = new EntityMetadata
        {
            TenantId = tenant.Id,
            Name = "Products",
            NamePlural = "Products",
            Slug = "products",
            Description = "Product catalog",
            TableName = "Products",
            IsActive = true,
            EnableAuditLog = true,
            EnableSoftDelete = true,
            CreateDateTime = DateTime.UtcNow,
            UpdateDateTime = DateTime.UtcNow
        };
        db.EntityMetadatas.Add(products);
        await db.SaveChangesAsync();

        var productFields = new[]
        {
            new EntityField { EntityMetadataId = products.Id, ColumnName = "name",        Name = "name",        Label = "Name",        FieldType = "text",    IsRequired = true,  SortOrder = 1, ShowInList = true,  CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
            new EntityField { EntityMetadataId = products.Id, ColumnName = "description", Name = "description", Label = "Description", FieldType = "textarea", IsRequired = false, SortOrder = 2, ShowInList = false, CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
            new EntityField { EntityMetadataId = products.Id, ColumnName = "price",       Name = "price",       Label = "Price",       FieldType = "number", IsRequired = true,  SortOrder = 3, ShowInList = true,  CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
            new EntityField { EntityMetadataId = products.Id, ColumnName = "stock",       Name = "stock",       Label = "Stock",       FieldType = "number", IsRequired = false, SortOrder = 4, ShowInList = true,  CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
            new EntityField { EntityMetadataId = products.Id, ColumnName = "is_active",   Name = "is_active",   Label = "Active",      FieldType = "boolean",IsRequired = false, SortOrder = 5, ShowInList = true,  CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
        };
        db.EntityFields.AddRange(productFields);

        // Customers entity
        var customers = new EntityMetadata
        {
            TenantId = tenant.Id,
            Name = "Customers",
            NamePlural = "Customers",
            Slug = "customers",
            Description = "Customer directory",
            TableName = "Customers",
            IsActive = true,
            EnableAuditLog = true,
            EnableSoftDelete = true,
            CreateDateTime = DateTime.UtcNow,
            UpdateDateTime = DateTime.UtcNow
        };
        db.EntityMetadatas.Add(customers);
        await db.SaveChangesAsync();

        var customerFields = new[]
        {
            new EntityField { EntityMetadataId = customers.Id, ColumnName = "name",    Name = "name",    Label = "Full Name", FieldType = "text",  IsRequired = true,  SortOrder = 1, ShowInList = true, CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
            new EntityField { EntityMetadataId = customers.Id, ColumnName = "email",   Name = "email",   Label = "Email",     FieldType = "email", IsRequired = true,  SortOrder = 2, ShowInList = true, CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
            new EntityField { EntityMetadataId = customers.Id, ColumnName = "phone",   Name = "phone",   Label = "Phone",     FieldType = "text",  IsRequired = false, SortOrder = 3, ShowInList = true, CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
            new EntityField { EntityMetadataId = customers.Id, ColumnName = "company", Name = "company", Label = "Company",   FieldType = "text",  IsRequired = false, SortOrder = 4, ShowInList = true, CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
        };
        db.EntityFields.AddRange(customerFields);
        await db.SaveChangesAsync();
    }

    // ─── Dashboard ────────────────────────────────────────────────────────────

    private static async Task SeedDashboardAsync(ApplicationDbContext db)
    {
        if (await db.DashboardConfigs.AnyAsync()) return;

        var tenant = await db.Tenants.FirstAsync();

        var dashboard = new DashboardConfig
        {
            TenantId = tenant.Id,
            Name = "Main Dashboard",
            Slug = "main",
            IsDefault = true,
            CreateDateTime = DateTime.UtcNow,
            UpdateDateTime = DateTime.UtcNow
        };
        db.DashboardConfigs.Add(dashboard);
        await db.SaveChangesAsync();

        var widgets = new[]
        {
            new DashboardWidget { DashboardConfigId = dashboard.Id, Title = "Total Users",    WidgetType = "stat", ConfigJson = "{\"entity\":\"users\"}", SortOrder = 1, CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
            new DashboardWidget { DashboardConfigId = dashboard.Id, Title = "Total Products", WidgetType = "stat", ConfigJson = "{\"entity\":\"products\"}", SortOrder = 2, CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
            new DashboardWidget { DashboardConfigId = dashboard.Id, Title = "Audit Activity", WidgetType = "chart", ConfigJson = "{\"entity\":\"audit_logs\"}", SortOrder = 3, CreateDateTime = DateTime.UtcNow, UpdateDateTime = DateTime.UtcNow },
        };
        db.DashboardWidgets.AddRange(widgets);
        await db.SaveChangesAsync();
    }
}
