using TaskManagement.Application.Common.Models;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
    RefreshTokenResult GenerateRefreshToken();
    string HashToken(string token);
}
