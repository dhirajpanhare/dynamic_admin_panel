using System.Security.Claims;

namespace DynamicAdminPanel.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(int userId, string email, string userName, List<string> roles);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
}
