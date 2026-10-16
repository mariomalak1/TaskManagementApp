using TaskManagement.Application.Authentication.Dtos;
using TaskManagement.Application.Common.Exceptions;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Common.Models;
using TaskManagement.Application.Users.Dtos;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Users;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _userRepository.EmailExistsAsync(email, cancellationToken))
            throw new ConflictException("A user with this email already exists.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = request.Role,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user, cancellationToken);

        return MapToUserResponse(user);
    }

    public async Task<PagedResult<UserResponse>> GetAllUsersAsync(PaginationQuery pagination, CancellationToken cancellationToken = default)
    {
        var (users, totalCount) = await _userRepository.GetPagedAsync(
            pagination.Skip, pagination.NormalizedPageSize, cancellationToken);

        var data = users.Select(MapToUserResponse).ToList();

        return PagedResult<UserResponse>.Create(
            data, pagination.NormalizedPage, pagination.NormalizedPageSize, totalCount);
    }

    
    public async Task DeleteUserAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);

        if (user is null)
            throw new NotFoundException("User not found.");

        user.SoftDelete();

        await _userRepository.SaveChangesAsync(cancellationToken);
    }
    
    


    private static UserResponse MapToUserResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }
}
