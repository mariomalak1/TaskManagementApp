using FluentAssertions;
using NSubstitute;
using TaskManagement.Application.Common.Exceptions;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Users;
using TaskManagement.Application.Users.Dtos;
using TaskManagement.Domain.Constants;
using TaskManagement.Domain.Entities;
using Xunit;

namespace TaskManagement.UnitTests.Users;

public class UserServiceTests
{
    private readonly IUserRepository _users = Substitute.For<IUserRepository>();
    private readonly IPasswordHasher _hasher = Substitute.For<IPasswordHasher>();
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _sut = new UserService(_users, _hasher);
    }

    [Fact]
    public async Task CreateUserAsync_WhenEmailExists_ThrowsConflict()
    {
        _users.EmailExistsAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(true);

        Func<Task> act = () => _sut.CreateUserAsync(new CreateUserRequest
        {
            Name = "A",
            Email = "a@a.com",
            Password = "Passw0rd",
            Role = UserRoles.User
        });

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task CreateUserAsync_WhenValid_HonorsRequestedRole()
    {
        _users.EmailExistsAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(false);
        _hasher.Hash(Arg.Any<string>()).Returns("HASHED");

        var result = await _sut.CreateUserAsync(new CreateUserRequest
        {
            Name = "A",
            Email = "a@a.com",
            Password = "Passw0rd",
            Role = UserRoles.Admin
        });

        result.Role.Should().Be(UserRoles.Admin);
        await _users.Received(1).AddAsync(
            Arg.Is<User>(u => u.Role == UserRoles.Admin && u.PasswordHash == "HASHED"),
            Arg.Any<CancellationToken>());
    }
}
