using DynamicAdminPanel.Shared.Requests;
using DynamicAdminPanel.Shared.Responses;

namespace DynamicAdminPanel.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(string email, string password);
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);
    Task<TokenResponse> RefreshTokenAsync(string refreshToken);
    Task<bool> ValidateTokenAsync(string token);
}
