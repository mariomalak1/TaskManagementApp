using TaskManagement.Application.Authentication.Dtos;
using TaskManagement.Application.Users.Dtos;

namespace TaskManagement.Application.Common.Interfaces;

public interface IUserService
{
    Task<UserResponse> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
}
