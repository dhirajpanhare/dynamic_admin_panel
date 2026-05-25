using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Infrastructure.Persistence;
using DynamicAdminPanel.Shared.Requests;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DynamicAdminPanel.API.Controllers;

/// <summary>
/// Authentication controller for user login, registration, and token management
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ApplicationDbContext _db;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ApplicationDbContext db, ILogger<AuthController> logger)
    {
        _authService = authService;
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Authenticate user and generate JWT tokens
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>JWT access token and refresh token</returns>
    /// <response code="200">Login successful</response>
    /// <response code="401">Invalid credentials</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request.Email, request.Password);
        return Ok(ApiResponse<LoginResponse>.SuccessResponse(result, "Login successful"));
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="request">User registration details</param>
    /// <returns>User information and JWT tokens</returns>
    /// <response code="200">Registration successful</response>
    /// <response code="400">Invalid registration data</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<RegisterResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<RegisterResponse>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<RegisterResponse>>> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(ApiResponse<RegisterResponse>.SuccessResponse(result, "Registration successful"));
    }

    /// <summary>
    /// Refresh an expired access token using a refresh token
    /// </summary>
    /// <param name="request">Refresh token</param>
    /// <returns>New JWT access token and refresh token</returns>
    /// <response code="200">Token refreshed successfully</response>
    /// <response code="401">Invalid or expired refresh token</response>
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<TokenResponse>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);
        return Ok(ApiResponse<TokenResponse>.SuccessResponse(result, "Token refreshed"));
    }

    /// <summary>
    /// Get the current authenticated user's profile.
    /// Called on every page load to restore the session.
    /// </summary>
    [HttpGet("profile")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<DynamicAdminPanel.Shared.Responses.UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<DynamicAdminPanel.Shared.Responses.UserDto>>> GetProfile()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(ApiResponse<UserDto>.ErrorResponse("Invalid token"));

        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.Id == userId && u.DeleteDateTime == null)
            .FirstOrDefaultAsync();

        if (user is null)
            return Unauthorized(ApiResponse<UserDto>.ErrorResponse("User not found"));

        var dto = new DynamicAdminPanel.Shared.Responses.UserDto
        {
            Id = user.Id,
            Email = user.UserMailAddress,
            FirstName = user.UserName,
            LastName = string.Empty,
            PhoneNumber = user.UserPhoneNumber,
            Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList()
        };

        return Ok(ApiResponse<DynamicAdminPanel.Shared.Responses.UserDto>.SuccessResponse(dto));
    }
}

