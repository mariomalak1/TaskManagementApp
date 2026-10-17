using TaskManagement.Application.Authentication.Dtos;
using TaskManagement.Application.Common.Models;
using TaskManagement.Application.Users.Dtos;

namespace TaskManagement.Application.Common.Interfaces;

public interface IUserService
{
    Task<UserResponse> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<UserResponse>> GetAllUsersAsync(PaginationQuery pagination, CancellationToken cancellationToken = default);
    Task DeleteUserAsync(Guid id, CancellationToken cancellationToken = default);
}
