using DynamicAdminPanel.Shared.Exceptions;
using DynamicAdminPanel.Shared.Responses;
using System.Net;
using System.Text.Json;

namespace DynamicAdminPanel.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        var apiResponse = new ApiResponse<object>
        {
            Success = false,
            TraceId = context.TraceIdentifier
        };

        switch (exception)
        {
            case NotFoundException notFoundException:
                response.StatusCode = (int)HttpStatusCode.NotFound;
                apiResponse.Message = notFoundException.Message;
                break;

            case ValidationException validationException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                apiResponse.Message = validationException.Message;
                apiResponse.Errors = validationException.Errors;
                break;

            case UnauthorizedException unauthorizedException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                apiResponse.Message = unauthorizedException.Message;
                break;

            case ForbiddenException forbiddenException:
                response.StatusCode = (int)HttpStatusCode.Forbidden;
                apiResponse.Message = forbiddenException.Message;
                break;

            case BadRequestException badRequestException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                apiResponse.Message = badRequestException.Message;
                break;

            case TenantNotFoundException tenantNotFoundException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                apiResponse.Message = tenantNotFoundException.Message;
                break;

            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                apiResponse.Message = "An internal server error occurred";
                apiResponse.Errors = new List<string> { exception.Message };
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(apiResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await response.WriteAsync(jsonResponse);
    }
}
