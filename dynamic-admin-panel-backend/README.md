# Dynamic Admin Panel - Backend

A metadata-driven, multi-tenant administration system built with .NET 9, following Clean Architecture and Domain-Driven Design (DDD) principles.

## 🏗️ Architecture

This project follows **Clean Architecture** with clear separation of concerns:

```
src/
├── DynamicAdminPanel.API/          # Presentation Layer (Controllers, Middleware)
├── DynamicAdminPanel.Application/  # Application Layer (Use Cases, DTOs, Interfaces)
├── DynamicAdminPanel.Domain/       # Domain Layer (Entities, Value Objects, Interfaces)
├── DynamicAdminPanel.Infrastructure/ # Infrastructure Layer (Data Access, External Services)
├── DynamicAdminPanel.Shared/       # Shared Kernel (Common utilities, Exceptions)
└── DynamicAdminPanel.Modules/      # Dynamic Modules (Pluggable business modules)
```

## 🚀 Features

### Core Features
- ✅ **Dynamic CRUD APIs** - Metadata-driven API generation
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Authorization (RBAC)** - Fine-grained permission control
- ✅ **Multi-Tenancy** - Database-per-tenant, Schema-per-tenant, or Shared database
- ✅ **Stored Procedures Only** - All database operations via SPs (no inline SQL)
- ✅ **Cloudinary Integration** - File and image upload support
- ✅ **Redis Caching** - Distributed caching for performance
- ✅ **Hangfire Background Jobs** - Scheduled and background task processing
- ✅ **Audit Logging** - Complete change tracking
- ✅ **Swagger/OpenAPI** - Full API documentation
- ✅ **Health Checks** - SQL Server, Redis monitoring
- ✅ **Serilog Logging** - Structured logging to console and file

## 📋 Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for SQL Server & Redis)
- [SQL Server 2022](https://www.microsoft.com/sql-server/sql-server-downloads) (or use Docker)
- [Redis](https://redis.io/download) (or use Docker)
- [Cloudinary Account](https://cloudinary.com/) (for file uploads)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dynamic-admin-panel-backend
```

### 2. Start Infrastructure Services (Docker)

Start SQL Server and Redis using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- **SQL Server 2022** on `localhost:1433`
- **Redis** on `localhost:6379`

Verify services are running:
```bash
docker-compose ps
```

### 3. Configure Application Settings

Update `src/DynamicAdminPanel.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=DynamicAdminPanel;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;",
    "Redis": "localhost:6379"
  },
  "Jwt": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "DynamicAdminPanel",
    "Audience": "DynamicAdminPanelUsers",
    "ExpirationHours": "24"
  },
  "Cloudinary": {
    "CloudName": "your-cloud-name",
    "ApiKey": "your-api-key",
    "ApiSecret": "your-api-secret"
  }
}
```

**Important:** 
- Replace `YourStrong@Passw0rd` with your SQL Server password
- Get Cloudinary credentials from [Cloudinary Dashboard](https://cloudinary.com/console)
- Generate a strong JWT secret key (at least 32 characters)

### 4. Setup Database

Run the SQL scripts in order:

```bash
# Using sqlcmd (if installed)
sqlcmd -S localhost,1433 -U sa -P YourStrong@Passw0rd -i scripts/01_CreateTables.sql
sqlcmd -S localhost,1433 -U sa -P YourStrong@Passw0rd -i scripts/02_CreateStoredProcedures.sql
sqlcmd -S localhost,1433 -U sa -P YourStrong@Passw0rd -i scripts/03_SeedData.sql
```

Or use **SQL Server Management Studio (SSMS)** or **Azure Data Studio** to execute the scripts manually.

### 5. Restore NuGet Packages

```bash
dotnet restore DynamicAdminPanel.sln
```

### 6. Build the Solution

```bash
dotnet build DynamicAdminPanel.sln
```

### 7. Run the Application

```bash
cd src/DynamicAdminPanel.API
dotnet run
```

The API will start on:
- **HTTPS**: `https://localhost:5001`
- **HTTP**: `http://localhost:5000`

### 8. Access Swagger UI

Open your browser and navigate to:
```
https://localhost:5001
```

You'll see the Swagger UI with all available endpoints.

## 🔐 Authentication

### Register a New User

**POST** `/api/v1/auth/register`

```json
{
  "userName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "phoneNumber": "+1234567890"
}
```

### Login

**POST** `/api/v1/auth/login`

```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "a1b2c3d4e5f6...",
    "expiresAt": "2024-05-23T10:30:00Z",
    "user": {
      "id": 1,
      "userName": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Using the Token

Add the token to the `Authorization` header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🌐 Multi-Tenancy

The system supports multi-tenancy with tenant resolution via:

### 1. Header-Based (Recommended)
```bash
curl -H "X-Tenant-Id: 1" https://localhost:5001/api/v1/dynamic/users
```

### 2. Subdomain-Based
```
https://demo.yourdomain.com/api/v1/dynamic/users
```

The `TenantResolverMiddleware` automatically resolves the tenant from the header or subdomain.

## 📊 Dynamic API Usage

The Dynamic API Controller allows CRUD operations on any entity without writing custom endpoints.

### Get All Entities (Paginated)

**GET** `/api/v1/dynamic/{entitySlug}?page=1&pageSize=10&sortBy=CreateDateTime&sortOrder=desc&search=john`

Example:
```bash
GET /api/v1/dynamic/users?page=1&pageSize=10
```

### Get Entity by ID

**GET** `/api/v1/dynamic/{entitySlug}/{id}`

Example:
```bash
GET /api/v1/dynamic/users/1
```

### Create Entity

**POST** `/api/v1/dynamic/{entitySlug}`

```json
{
  "userName": "Jane Doe",
  "userMailAddress": "jane@example.com",
  "password": "SecurePass@123"
}
```

### Update Entity

**PUT** `/api/v1/dynamic/{entitySlug}/{id}`

```json
{
  "userName": "Jane Smith"
}
```

### Delete Entity

**DELETE** `/api/v1/dynamic/{entitySlug}/{id}?hardDelete=false`

- `hardDelete=false` - Soft delete (sets DeleteDateTime)
- `hardDelete=true` - Permanent deletion

## 📁 File Upload (Cloudinary)

### Upload File

**POST** `/api/v1/file/upload?folder=documents`

Form Data:
- `file`: The file to upload

Response:
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/documents/file.pdf",
    "fileName": "file.pdf",
    "fileSize": 102400
  }
}
```

### Upload Image

**POST** `/api/v1/file/upload-image?folder=avatars`

Supports: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

## 🔧 Background Jobs (Hangfire)

Access the Hangfire Dashboard:
```
https://localhost:5001/hangfire
```

Schedule background jobs, view job history, and monitor recurring tasks.

## 🏥 Health Checks

Check system health:
```bash
GET /health
```

Response:
```json
{
  "status": "Healthy",
  "checks": {
    "sqlserver": "Healthy",
    "redis": "Healthy"
  }
}
```

## 📝 Logging

Logs are written to:
- **Console** - Real-time logging during development
- **File** - `logs/log-YYYYMMDD.txt` (rotated daily)

Log levels can be configured in `appsettings.json`.

## 🧪 Testing

Run unit tests:
```bash
dotnet test
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t dynamic-admin-panel-api:latest -f src/DynamicAdminPanel.API/Dockerfile .
```

### Run with Docker Compose

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📚 Project Structure

```
dynamic-admin-panel-backend/
├── src/
│   ├── DynamicAdminPanel.API/
│   │   ├── Controllers/          # API Controllers
│   │   ├── Middleware/           # Custom Middleware
│   │   ├── Filters/              # Action Filters
│   │   └── Program.cs            # Application Entry Point
│   ├── DynamicAdminPanel.Application/
│   │   ├── Interfaces/           # Application Interfaces
│   │   ├── DTOs/                 # Data Transfer Objects
│   │   └── Features/             # Use Cases (MediatR)
│   ├── DynamicAdminPanel.Domain/
│   │   ├── Entities/             # Domain Entities
│   │   ├── ValueObjects/         # Value Objects
│   │   ├── Enums/                # Enumerations
│   │   └── Interfaces/           # Domain Interfaces
│   ├── DynamicAdminPanel.Infrastructure/
│   │   ├── Persistence/          # DbContext, Repositories
│   │   ├── Identity/             # Authentication Services
│   │   ├── Caching/              # Redis Cache Implementation
│   │   ├── Services/             # External Services (Cloudinary)
│   │   └── MultiTenancy/         # Tenant Resolution
│   ├── DynamicAdminPanel.Shared/
│   │   ├── Constants/            # Application Constants
│   │   ├── Exceptions/           # Custom Exceptions
│   │   ├── Responses/            # API Response Models
│   │   └── Requests/             # API Request Models
│   └── DynamicAdminPanel.Modules/
│       ├── CRM/                  # CRM Module
│       ├── HRMS/                 # HR Module
│       └── Ecommerce/            # E-commerce Module
├── scripts/
│   ├── 01_CreateTables.sql       # Database Schema
│   ├── 02_CreateStoredProcedures.sql  # Stored Procedures
│   └── 03_SeedData.sql           # Seed Data
├── docker-compose.yml            # Docker Services
└── README.md                     # This file
```

## 🔑 Key Technologies

| Technology | Purpose |
|------------|---------|
| .NET 9 | Web API Framework |
| Entity Framework Core 9 | ORM for migrations |
| Dapper | Stored Procedure execution |
| SQL Server 2022 | Primary database |
| Redis | Distributed caching |
| JWT Bearer | Authentication |
| Hangfire | Background jobs |
| Cloudinary | File storage |
| Serilog | Structured logging |
| Swagger/OpenAPI | API documentation |

## 🚨 Important Notes

### Stored Procedures Only
This project **exclusively uses Stored Procedures** for all database operations. No inline SQL or LINQ queries are used for data access.

### Security Considerations
- Change default passwords in production
- Use environment variables for sensitive configuration
- Enable HTTPS in production
- Implement rate limiting for public APIs
- Regular security audits

### Performance Tips
- Redis caching is enabled for tenant metadata
- Use pagination for large datasets
- Monitor Hangfire job performance
- Optimize stored procedures with proper indexing

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Email: support@dynamicadminpanel.com

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using .NET 9 and Clean Architecture**
