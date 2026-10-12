using TaskManagement.Application.Authentication.Dtos;

namespace TaskManagement.Application.Common.Interfaces;

public interface IAuthService
{
    Task<UserResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
}
