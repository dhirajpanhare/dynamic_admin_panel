# Dynamic Admin Panel Platform - Complete Documentation & Implementation Guide

## A Metadata-Driven Multi-Tenant Administration System

**Version:** 1.0.0

**Last Updated:** May 2026

**Technology:** .NET 9 Core Web API + SQL Server + React TypeScript

**Author:** Senior Software Architect

---

## 📋 Table of Contents

1. [Executive Summary]
2. [Project Overview]
3. [System Architecture]
4. [Technology Stack]
5. [Complete Database Schema]
6. [Backend Architecture & Implementation]
7. [Frontend Architecture & Implementation]
8. [API Documentation]
9. [Authentication & Authorization]
10. [Multi-Tenant Architecture]
11. [Dynamic Rendering Engine]
12. [Workflow Engine]
13. [Security Implementation]
14. [Performance Optimization]
15. [Deployment Guide]
16. [Development Roadmap]
17. [Testing Strategy]
18. [Monitoring & Observability]
19. [Complete Folder Structure]
---

## 1. Executive Summary

### 1.1 What We're Building

The **Dynamic Admin Panel Platform** is an enterprise-grade, metadata-driven administration system built on **.NET 9 Core Web API** with **SQL Server** backend and **React TypeScript** frontend. It eliminates the need to build custom admin panels for every application by dynamically generating APIs, pages, forms, and tables from database metadata.

### 1.2 Core Innovation

Traditional admin panels require:

1. Creating database tables
2. Writing backend APIs for each table
3. Building frontend pages for each entity
4. Implementing CRUD operations repeatedly
5. Handling permissions per endpoint

**Our platform transforms this into:**

1. Define entities and fields in metadata tables
2. APIs, pages, forms, and tables are **automatically generated**
3. Permissions are **metadata-driven**
4. New modules can be **plugged in** without code changes
5. Multi-tenancy is **built into the core architecture**

### 1.3 Business Value

| Metric | Traditional Approach | Dynamic Admin Panel |
| --- | --- | --- |
| Time to Add New Module | 2-4 weeks | 30 minutes |
| API Endpoints per Entity | 5+ custom endpoints | 0 (dynamic) |
| Frontend Pages per Entity | 4+ custom pages | 0 (dynamic) |
| Permission Configuration | Code changes | UI configuration |
| Multi-Tenant Support | Months to implement | Built-in |
| Maintenance Cost | High | Low |
| Database Migrations per Module | Manual | Automatic |

---

## 2. Project Overview

### 2.1 System Capabilities

### Core Features

- ✅ **Dynamic CRUD APIs** - Automatically generated for any entity
- ✅ **Dynamic Form Builder** - JSON schema-driven form generation
- ✅ **Dynamic Table/Grid** - Server-side pagination, sorting, filtering
- ✅ **Role-Based Access Control** - Field-level permissions
- ✅ **Multi-Tenant Architecture** - Database-per-tenant, schema-per-tenant, or shared
- ✅ **Workflow Engine** - Configurable approval workflows
- ✅ **Dashboard Builder** - Drag-and-drop widget configuration
- ✅ **Audit Logging** - Complete change tracking
- ✅ **File Management** - Multi-provider storage (Local, Azure Blob, AWS S3)
- ✅ **Notification System** - Email, SMS, in-app notifications
- ✅ **Plugin/Module System** - Plug-and-play business modules
- ✅ **Export Engine** - Excel, PDF, CSV exports
- ✅ **Tenant Branding** - Per-tenant custom themes, logos, colors
- ✅ **API Rate Limiting** - Configurable per endpoint, per tenant
- ✅ **Caching Layer** - Redis-powered performance optimization
- ✅ **Background Jobs** - Hangfire for scheduled tasks

### Advanced Features

- ✅ **Dynamic Query Builder** - Complex filtering without SQL knowledge
- ✅ **Field-Level Validation** - Configurable validation rules
- ✅ **Relationship Management** - Dynamic joins and eager loading
- ✅ **Bulk Operations** - Multi-record create, update, delete
- ✅ **Soft Delete** - Configurable per entity
- ✅ **Full-Text Search** - SQL Server Full-Text Search integration
- ✅ **API Versioning** - Backward compatible API evolution
- ✅ **Request Throttling** - Prevent abuse
- ✅ **Circuit Breaker** - Polly for fault tolerance
- ✅ **Health Checks** - Comprehensive health monitoring
- ✅ **OpenTelemetry** - Distributed tracing

### 2.2 Use Cases

### 1. E-Commerce Platform Administration

```yaml
Tables Configured:
  - Products (ProductId, Name, SKU, Price, Stock, CategoryId)
  - Categories (CategoryId, Name, ParentCategoryId, Image)
  - Orders (OrderId, CustomerId, TotalAmount, Status, OrderDate)
  - OrderItems (OrderItemId, OrderId, ProductId, Quantity, Price)
  - Customers (CustomerId, Name, Email, Phone, Address)
  - Inventory (InventoryId, ProductId, WarehouseId, Quantity)
  - Coupons (CouponId, Code, DiscountType, Value, ExpiryDate)

Automatically Generated:
  - 7 List Pages with search, filter, sort
  - 7 Create/Edit Forms with validation
  - 7 Detail Views
  - 35+ API Endpoints
  - Role-based access for each entity

Time Saved: 3-4 weeks of development
```

### 2. Learning Management System

```yaml
Tables Configured:
  - Courses (CourseId, Title, Description, InstructorId, Price)
  - Lessons (LessonId, CourseId, Title, Content, VideoUrl, Order)
  - Students (StudentId, UserId, EnrollmentDate, Progress)
  - Assignments (AssignmentId, LessonId, Title, DueDate, MaxScore)
  - Quizzes (QuizId, LessonId, Questions, PassingScore)

Time Saved: 2-3 weeks of development
```

### 3. HR Management System

```yaml
Tables Configured:
  - Employees (EmployeeId, Name, Email, Department, Position, Salary)
  - Departments (DepartmentId, Name, ManagerId, Budget)
  - Attendance (AttendanceId, EmployeeId, Date, CheckIn, CheckOut)
  - LeaveRequests (LeaveRequestId, EmployeeId, Type, StartDate, EndDate)
  - Performance (ReviewId, EmployeeId, ReviewerId, Score, Comments)

Time Saved: 4-5 weeks of development
```

---

## 3. System Architecture

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                                      │
│                                                                               │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────────┐ │
│  │   React Admin Panel │  │   Mobile PWA        │  │   External API       │ │
│  │   (Vite + TS)       │  │   (Responsive)      │  │   Consumers          │ │
│  │   Port 5173         │  │                     │  │   (Postman, SDKs)    │ │
│  └──────────┬──────────┘  └──────────┬──────────┘  └───────────┬──────────┘ │
└─────────────┼────────────────────────┼─────────────────────────┼────────────┘
              │                        │                         │
              └────────────────────────┼─────────────────────────┘
                                       │ HTTPS
                              ┌────────┴────────┐
                              │   API Gateway    │
                              │   (YARP/Nginx)   │
                              │   Port 443       │
                              │   SSL, Rate Limit│
                              └────────┬────────┘
                                       │
┌──────────────────────────────────────┼──────────────────────────────────────┐
│                          APPLICATION TIER (.NET 9)                            │
│                                                                               │
│  ┌──────────────────────────────────┴────────────────────────────────────┐  │
│  │                        Load Balancer / YARP Reverse Proxy              │  │
│  └──────┬──────────────────────────┬──────────────────────────┬──────────┘  │
│         │                          │                          │              │
│  ┌──────┴────────┐  ┌──────────────┴──────┐  ┌───────────────┴──────────┐  │
│  │  API Instance 1│  │  API Instance 2     │  │  API Instance 3          │  │
│  │  (.NET 9)      │  │  (.NET 9)           │  │  (.NET 9)               │  │
│  │  Port 5001     │  │  Port 5002          │  │  Port 5003              │  │
│  └──────┬─────────┘  └─────────┬───────────┘  └────────────┬─────────────┘  │
│         │                      │                           │                 │
│  ┌──────┴──────────────────────┴───────────────────────────┴─────────────┐  │
│  │                         Background Services                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │  │
│  │  │ Hangfire │  │ Workflow │  │ Audit    │  │ Notification         │   │  │
│  │  │ Jobs     │  │ Engine   │  │ Service  │  │ Service              │   │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         Cross-Cutting Concerns                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │ │
│  │  │ Logging  │  │ Caching  │  │ Metrics  │  │ OpenTelemetry        │   │ │
│  │  │ (Serilog)│  │ (Redis)  │  │ (OTel)   │  │ Tracing              │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────┼──────────────────────────────────────┐
│                              DATA TIER                                        │
│                                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  SQL Server  │  │  Redis       │  │  Azure Blob  │  │  Elasticsearch   │ │
│  │  (Primary)   │  │  (Cache)     │  │  Storage     │  │  (Search)        │ │
│  │  Port 1433   │  │  Port 6379   │  │  / AWS S3    │  │  Port 9200       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘ │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │                    Tenant Database Isolation Options                      ││
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐  ││
│  │  │ Shared Database│  │ Separate       │  │ Separate Database          │  ││
│  │  │ (All tenants)  │  │ Schema per     │  │ per Tenant                 │  ││
│  │  │                │  │ Tenant         │  │                            │  ││
│  │  └────────────────┘  └────────────────┘  └────────────────────────────┘  ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Request Flow Diagram

```
Client Request: GET /api/v1/products?page=1&perPage=10&sort=name&order=asc&search=laptop

┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 1: API Gateway Middleware                                                │
│ - SSL Termination                                                            │
│ - Rate Limiting Check (per tenant, per IP)                                   │
│ - Request Correlation ID generation                                          │
│ - Route to API Service                                                       │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────────┐
│ Step 2: Tenant Resolution Middleware (.NET Middleware)                        │
│ - Extract X-Tenant-Id header or subdomain                                    │
│ - Resolve tenant from database                                               │
│ - Set TenantContext (TenantId, ConnectionString, Schema)                     │
│ - Validate tenant subscription status                                        │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────────┐
│ Step 3: Authentication Middleware (JWT Bearer)                                │
│ - Extract JWT from Authorization header                                      │
│ - Validate token signature using symmetric/asymmetric key                    │
│ - Validate token expiry, issuer, audience                                    │
│ - Extract claims: UserId, TenantId, Roles                                    │
│ - Set HttpContext.User (ClaimsPrincipal)                                     │
│ - Log login audit                                                           │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────────┐
│ Step 4: Authorization Middleware (RBAC)                                       │
│ - Determine required permission: "products.read"                             │
│ - Check user roles against required permission                               │
│ - Check organization-scoped permissions                                      │
│ - Load field-level permission restrictions                                   │
│ - Return 403 Forbidden if unauthorized                                       │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────────┐
│ Step 5: Dynamic API Controller                                               │
│ - Route: /api/v1/{entity} → DynamicApiController                            │
│ - Extract entity slug: "products"                                            │
│ - Load entity metadata from cache or database                                │
│ - Get entity: table_name, fields, relations, permissions                     │
│ - Validate entity exists and API is enabled                                  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────────┐
│ Step 6: Dynamic Query Builder Service                                        │
│ - Load entity fields from metadata                                           │
│ - Filter fields based on user's field-level permissions                      │
│ - Build SELECT clause with allowed fields                                    │
│ - Build JOIN clauses from relations (if ?include=category)                   │
│ - Build WHERE from query filters                                             │
│ - Build WHERE from search term (full-text search)                            │
│ - Build ORDER BY from sort parameters                                        │
│ - Build OFFSET/FETCH from pagination                                         │
│ - Generate parameterized SQL query (anti-SQL injection)                      │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────────┐
│ Step 7: Query Execution (Dapper/EF Core)                                      │
│ - Execute COUNT query for total records                                      │
│ - Execute main SELECT query                                                  │
│ - Use Dapper for performance (raw SQL mapping)                               │
│ - Apply row-level security filters                                           │
│ - Execute within tenant's database context                                   │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────────┐
│ Step 8: Response Transformation                                              │
│ - Map DbColumn names to ApiField names                                       │
│ - Apply data formatting (dates, currencies, enums)                           │
│ - Remove fields user doesn't have permission to see                          │
│ - Structure response: { status, message, data: { items, total, ... } }      │
│ - Add HATEOAS links if configured                                            │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────────────────┐
│ Step 9: Response & Audit                                                      │
│ - Set cache headers (ETag, Cache-Control)                                    │
│ - Compress response (GZip/Brotli)                                            │
│ - Return JSON response                                                       │
│ - Log audit trail (async, non-blocking)                                      │
│ - Update API usage metrics                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 .NET 9 Service Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      .NET 9 APPLICATION LAYERS                                │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        PRESENTATION LAYER                                 ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────────┐ ││
│  │  │ Controllers   │  │ Middleware    │  │ Filters (Auth, Exception,     │ ││
│  │  │ (REST APIs)   │  │ Pipeline      │  │ RateLimit, Validation)        │ ││
│  │  └───────────────┘  └───────────────┘  └───────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                      │                                        │
│  ┌──────────────────────────────────┴──────────────────────────────────────┐│
│  │                         APPLICATION LAYER                                 ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────────┐ ││
│  │  │ Services      │  │ DTOs/Models   │  │ Validators (FluentValidation) │ ││
│  │  │ (Business     │  │ (Request/     │  │                               │ ││
│  │  │  Logic)       │  │  Response)    │  │                               │ ││
│  │  └───────────────┘  └───────────────┘  └───────────────────────────────┘ ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────────┐ ││
│  │  │ AutoMapper    │  │ MediatR       │  │ Background Services           │ ││
│  │  │ Profiles      │  │ (CQRS)        │  │ (IHostedService, Hangfire)    │ ││
│  │  └───────────────┘  └───────────────┘  └───────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                      │                                        │
│  ┌──────────────────────────────────┴──────────────────────────────────────┐│
│  │                          DOMAIN LAYER                                     ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────────┐ ││
│  │  │ Entities      │  │ Value Objects │  │ Domain Events                 │ ││
│  │  │ (Core Models) │  │               │  │                               │ ││
│  │  └───────────────┘  └───────────────┘  └───────────────────────────────┘ ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────────┐ ││
│  │  │ Enums         │  │ Interfaces    │  │ Domain Services               │ ││
│  │  └───────────────┘  └───────────────┘  └───────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                      │                                        │
│  ┌──────────────────────────────────┴──────────────────────────────────────┐│
│  │                      INFRASTRUCTURE LAYER                                 ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────────┐ ││
│  │  │ DbContext     │  │ Repositories  │  │ Unit of Work                  │ ││
│  │  │ (EF Core)     │  │ (Generic)     │  │                               │ ││
│  │  └───────────────┘  └───────────────┘  └───────────────────────────────┘ ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────────┐ ││
│  │  │ Dapper        │  │ Redis Cache   │  │ External Services             │ ││
│  │  │ (Dynamic SQL) │  │ Provider      │  │ (Email, SMS, Storage)         │ ││
│  │  └───────────────┘  └───────────────┘  └───────────────────────────────┘ ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────────┐ ││
│  │  │ Logging       │  │ Configuration │  │ Dependency Injection          │ ││
│  │  │ (Serilog)     │  │ (Options)     │  │ (Microsoft DI)                │ ││
│  │  └───────────────┘  └───────────────┘  └───────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technology Stack

### 4.1 Complete Technology Matrix

### Backend (.NET 9 Core)

| Category | Technology | Version | Purpose |
| --- | --- | --- | --- |
| **Framework** | .NET Core | 9.0 | Web API Framework |
| **Language** | C# | 13.0 | Primary Language |
| **ORM** | Entity Framework Core | 9.0 | Database ORM |
| **Micro ORM** | Dapper | 2.1+ | Dynamic Query Execution |
| **Authentication** | JWT Bearer | 9.0 | Token-based Auth |
| **Validation** | FluentValidation | 11+ | Request Validation |
| **Mapping** | AutoMapper | 12+ | Object Mapping |
| **CQRS** | MediatR | 12+ | Command/Query Separation |
| **Caching** | StackExchange.Redis | 2.7+ | Distributed Caching |
| **Background Jobs** | Hangfire | 1.8+ | Background Processing |
| **Logging** | Serilog | 3.1+ | Structured Logging |
| **Health Checks** | AspNetCore.HealthChecks | 9.0 | Health Monitoring |
| **API Docs** | Swashbuckle/Scalar | 6.5+ | OpenAPI Documentation |
| **Rate Limiting** | AspNetCoreRateLimit | 5.0+ | Rate Limiting |
| **Resilience** | Polly | 8.0+ | Fault Tolerance |
| **Tracing** | OpenTelemetry | 1.8+ | Distributed Tracing |
| **Metrics** | Prometheus | 8.0+ | Metrics Collection |
| **Testing** | xUnit + Moq + FluentAssertions | Latest | Unit/Integration Testing |

### Frontend (React TypeScript)

| Category | Technology | Version | Purpose |
| --- | --- | --- | --- |
| **Framework** | React | 18.3+ | UI Library |
| **Build Tool** | Vite | 5.2+ | Build & Dev Server |
| **Language** | TypeScript | 5.4+ | Type Safety |
| **Routing** | React Router DOM | 6.23+ | Client-side Routing |
| **UI Components** | Shadcn UI | Latest | Component Library |
| **Icons** | Lucide React | 0.378+ | Icon Library |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **State Management** | Zustand | 4.5+ | Client State |
| **Server State** | TanStack React Query | 5.40+ | Data Fetching |
| **Forms** | React Hook Form | 7.51+ | Form Management |
| **Validation** | Zod | 3.23+ | Schema Validation |
| **Tables** | TanStack Table | 8.17+ | Data Grid |
| **Charts** | Recharts | 2.12+ | Data Visualization |
| **HTTP Client** | Axios | 1.7+ | API Requests |
| **Date Handling** | date-fns | 3.6+ | Date Utilities |
| **Rich Text** | TipTap | 2.3+ | WYSIWYG Editor |
| **Drag & Drop** | @dnd-kit | 6.1+ | Drag and Drop |
| **File Upload** | React Dropzone | 14.2+ | File Uploads |
| **Export** | xlsx, jspdf | Latest | Export Functionality |
| **Notifications** | Sonner | 1.5+ | Toast Notifications |

### Database & Infrastructure

| Category | Technology | Version | Purpose |
| --- | --- | --- | --- |
| **Primary Database** | SQL Server | 2022 | Relational Data |
| **Cache** | Redis | 7.2+ | Caching & Sessions |
| **Search** | SQL Server Full-Text | Built-in | Full-text Search |
| **File Storage** | Azure Blob / AWS S3 / Local | Latest | Object Storage |
| **Container** | Docker | 24+ | Containerization |
| **Orchestration** | Kubernetes / Docker Compose | Latest | Container Orchestration |
| **CI/CD** | GitHub Actions / Azure DevOps | - | Automated Deployment |
| **Monitoring** | Prometheus + Grafana | Latest | Metrics & Monitoring |
| **Logging** | Seq / ELK Stack | Latest | Centralized Logging |
| **Reverse Proxy** | YARP / Nginx | Latest | Load Balancing |

---

## 5. Complete Database Schema

### 5.1 Base Tables (Provided)

```sql
-- ============================================
-- DATABASE: DynamicAdminPanel
-- SERVER: SQL Server 2022
-- VERSION: 2.0.0
-- ============================================

-- ============================================
-- 1. USERS
-- ============================================
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    UserName VARCHAR(100) NOT NULL,
    UserMailAddress VARCHAR(100) NOT NULL UNIQUE,
    UserPhoneNumber VARCHAR(20) NULL,
    Password VARCHAR(150) NOT NULL, -- Will use ASP.NET Identity hashing in practice
    IsActive TINYINT DEFAULT 1, -- 1=Active, 0=Inactive
    EmailVerified TINYINT DEFAULT 0,
    TwoFactorEnabled TINYINT DEFAULT 0,
    FailedLoginAttempts INT DEFAULT 0,
    LockoutEnd DATETIME NULL,
    LastLoginAt DATETIME NULL,
    LastLoginIP VARCHAR(45) NULL,
    ProfilePictureUrl NVARCHAR(500) NULL,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME DEFAULT GETDATE()
);

-- ============================================
-- 2. USER LOGIN LOG
-- ============================================
CREATE TABLE UserLoginLog (
    UserLoggingLogId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    LoginIPAddress VARCHAR(45) NULL,
    UserAgent VARCHAR(500) NULL,
    UserType VARCHAR(100) NOT NULL, -- 'Email', 'Phone', 'SSO', 'API'
    LoginWithEmail VARCHAR(100) NULL,
    LoginWithNumber VARCHAR(20) NULL,
    IsSuccessful TINYINT DEFAULT 1,
    FailureReason VARCHAR(250) NULL,
    CreateDateTime DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_UserLoginLog_Users FOREIGN KEY (UserId)
        REFERENCES Users(UserId) ON DELETE CASCADE
);

-- ============================================
-- 3. TENANTS
-- ============================================
CREATE TABLE Tenants (
    TenantId INT IDENTITY(1,1) PRIMARY KEY,
    WorkSpaceName VARCHAR(100) NOT NULL,
    SubDomainName VARCHAR(100) UNIQUE NOT NULL,
    CustomDomain VARCHAR(255) NULL,
    Status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Suspended, Deleted, Trial
    IsolationLevel VARCHAR(50) DEFAULT 'Shared', -- Shared, Schema, Database
    DatabaseConnectionString NVARCHAR(500) NULL, -- For Database-level isolation
    DatabaseSchema VARCHAR(100) DEFAULT 'dbo', -- For Schema-level isolation

    -- Subscription
    SubscriptionTier VARCHAR(50) DEFAULT 'Free', -- Free, Starter, Pro, Enterprise
    SubscriptionStatus VARCHAR(50) DEFAULT 'Active',
    SubscriptionStartsAt DATETIME NULL,
    SubscriptionExpiresAt DATETIME NULL,

    -- Limits
    MaxUsers INT DEFAULT 10,
    MaxStorageMB INT DEFAULT 500,
    MaxApiCallsPerDay INT DEFAULT 10000,

    -- Settings
    Timezone VARCHAR(50) DEFAULT 'UTC',
    DateFormat VARCHAR(20) DEFAULT 'MM/dd/yyyy',
    Currency VARCHAR(10) DEFAULT 'USD',
    Locale VARCHAR(10) DEFAULT 'en-US',

    -- Metadata
    Settings NVARCHAR(MAX) DEFAULT '{}', -- JSON
    Features NVARCHAR(MAX) DEFAULT '{}', -- JSON

    CreatedBy VARCHAR(100) NULL,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME DEFAULT GETDATE(),
    DeleteDateTime DATETIME NULL
);

-- ============================================
-- 4. TENANT BRANDING
-- ============================================
CREATE TABLE TenantBranding (
    TenantBrandingId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL UNIQUE,
    FaviconUrl NVARCHAR(500) NULL,
    LogoUrl NVARCHAR(500) NULL,
    LogoDarkUrl NVARCHAR(500) NULL,
    PrimaryColor NVARCHAR(50) DEFAULT '#6366f1',
    SecondaryColor NVARCHAR(50) DEFAULT '#8b5cf6',
    BackgroundColor NVARCHAR(50) DEFAULT '#ffffff',
    TextColor NVARCHAR(50) DEFAULT '#111827',
    FontFamily NVARCHAR(100) DEFAULT 'Inter',
    BorderRadius NVARCHAR(20) DEFAULT '0.5rem',
    CustomCSS NVARCHAR(MAX) NULL,
    CustomJS NVARCHAR(MAX) NULL,
    EmailHeader NVARCHAR(MAX) NULL,
    EmailFooter NVARCHAR(MAX) NULL,
    LoginPageBackground NVARCHAR(500) NULL,
    CreatedBy VARCHAR(100) NULL,
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_TenantBranding_Tenants FOREIGN KEY (TenantId)
        REFERENCES Tenants(TenantId) ON DELETE CASCADE
);
```

### 5.2 Extended Tables

```sql
-- ============================================
-- 5. ORGANIZATIONS (For hierarchical structure within tenant)
-- ============================================
CREATE TABLE Organizations (
    OrganizationId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Slug VARCHAR(100) NOT NULL,
    ParentOrganizationId INT NULL,
    Path VARCHAR(500) NULL, -- Materialized path for tree queries
    Depth INT DEFAULT 0,
    SortOrder INT DEFAULT 0,
    Email VARCHAR(255) NULL,
    Phone VARCHAR(50) NULL,
    Address NVARCHAR(MAX) NULL,
    Settings NVARCHAR(MAX) DEFAULT '{}',
    Status VARCHAR(20) DEFAULT 'Active',
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Organizations_Tenants FOREIGN KEY (TenantId)
        REFERENCES Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT FK_Organizations_Parent FOREIGN KEY (ParentOrganizationId)
        REFERENCES Organizations(OrganizationId),
    CONSTRAINT UQ_Organizations_Tenant_Slug UNIQUE (TenantId, Slug)
);

-- ============================================
-- 6. USER-TENANT MAPPING
-- ============================================
CREATE TABLE UserTenants (
    UserTenantId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    TenantId INT NOT NULL,
    OrganizationId INT NULL,
    IsPrimary TINYINT DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'Active',
    CreateDateTime DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_UserTenants_Users FOREIGN KEY (UserId)
        REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_UserTenants_Tenants FOREIGN KEY (TenantId)
        REFERENCES Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT FK_UserTenants_Organizations FOREIGN KEY (OrganizationId)
        REFERENCES Organizations(OrganizationId),
    CONSTRAINT UQ_UserTenants_User_Tenant UNIQUE (UserId, TenantId)
);

-- ============================================
-- 7. ROLES
-- ============================================
CREATE TABLE Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Slug VARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    Icon VARCHAR(100) NULL,
    ParentRoleId INT NULL,
    IsSystem TINYINT DEFAULT 0, -- System roles cannot be deleted
    IsDefault TINYINT DEFAULT 0, -- Auto-assigned to new users
    Priority INT DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'Active',
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Roles_Tenants FOREIGN KEY (TenantId)
        REFERENCES Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT FK_Roles_Parent FOREIGN KEY (ParentRoleId)
        REFERENCES Roles(RoleId),
    CONSTRAINT UQ_Roles_Tenant_Slug UNIQUE (TenantId, Slug)
);

-- ============================================
-- 8. PERMISSIONS
-- ============================================
CREATE TABLE Permissions (
    PermissionId INT IDENTITY(1,1) PRIMARY KEY,
    TenantId INT NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Slug VARCHAR(255) NOT NULL,
    Description NVARCHAR(500) NULL,
    ResourceType VARCHAR(50) NOT NULL, -- Module, Entity, Page, API, Field, Action
    ResourceId INT NULL,
    ResourceSlug VARCHAR(255) NULL,
    Action VARCHAR(50) NOT NULL, -- Create, Read, Update, Delete, Manage, Export, Import, Approve
    Conditions NVARCHAR(MAX) DEFAULT '{}', -- JSON for field-level permissions
    Status VARCHAR(20) DEFAULT 'Active',
    CreateDateTime DATETIME DEFAULT GETDATE(),
    UpdateDateTime DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Permissions_Tenants FOREIGN KEY (TenantId)
        REFERENCES Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT UQ_Permissions_Tenant_Slug UNIQUE (TenantId, Slug)
);

-- ============================================
-- 9. USER-ROLE ASSIGNMENTS
-- ============================================
CREATE TABLE UserRoles (
    UserRoleId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    TenantId INT NOT NULL,
    OrganizationId INT
```