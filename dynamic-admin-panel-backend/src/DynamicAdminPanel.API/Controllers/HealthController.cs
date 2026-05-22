using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace DynamicAdminPanel.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;

    public HealthController(ILogger<HealthController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = Assembly.GetExecutingAssembly().GetName().Version?.ToString(),
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
        });
    }

    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { Message = "Pong", Timestamp = DateTime.UtcNow });
    }
}
