using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Domain.Entities;
using DynamicAdminPanel.Infrastructure.Persistence;
using DynamicAdminPanel.Shared.Exceptions;
using DynamicAdminPanel.Shared.Requests;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DynamicAdminPanel.Infrastructure.Identity;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthService(
        ApplicationDbContext context,
        ITokenService tokenService,
        IPasswordHasher<User> passwordHasher)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<LoginResponse> LoginAsync(string email, string password)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserMailAddress == email);

        if (user == null)
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedException("Account is inactive");
        }

        if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
        {
            throw new UnauthorizedException("Account is locked");
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.Password, password);
        
        if (result == PasswordVerificationResult.Failed)
        {
            user.FailedLoginAttempts++;
            
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutEnd = DateTime.UtcNow.AddMinutes(30);
            }
            
            await _context.SaveChangesAsync();
            throw new UnauthorizedException("Invalid email or password");
        }

        // Reset failed attempts on successful login
        user.FailedLoginAttempts = 0;
        user.LastLoginAt = DateTime.UtcNow;
        user.LockoutEnd = null;

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.UserMailAddress, user.UserName, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        await _context.SaveChangesAsync();

        return new LoginResponse
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.UserMailAddress,
                FirstName = user.UserName,
                LastName = string.Empty,
                PhoneNumber = user.UserPhoneNumber,
                Roles = roles
            }
        };
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.UserMailAddress == request.Email);

        if (existingUser != null)
        {
            throw new ValidationException("Email already registered");
        }

        var user = new User
        {
            UserName = request.FirstName + " " + request.LastName,
            UserMailAddress = request.Email,
            UserPhoneNumber = request.PhoneNumber,
            IsActive = true,
            EmailVerified = false
        };

        user.Password = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new RegisterResponse
        {
            UserId = user.Id,
            Email = user.UserMailAddress,
            Message = "User registered successfully"
        };
    }

    public async Task<TokenResponse> RefreshTokenAsync(string refreshToken)
    {
        // In a real implementation, you would validate the refresh token against a stored value
        // For now, we'll throw an exception
        throw new UnauthorizedException("Invalid refresh token");
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        var principal = _tokenService.ValidateToken(token);
        return principal != null;
    }
}
