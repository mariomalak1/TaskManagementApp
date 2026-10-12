using FluentAssertions;
using NSubstitute;
using TaskManagement.Application.Authentication;
using TaskManagement.Application.Authentication.Dtos;
using TaskManagement.Application.Common.Exceptions;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Domain.Constants;
using TaskManagement.Domain.Entities;
using Xunit;

namespace TaskManagement.UnitTests.Authentication;

public class AuthServiceTests
{
    private readonly IUserRepository _users = Substitute.For<IUserRepository>();
    private readonly IPasswordHasher _hasher = Substitute.For<IPasswordHasher>();
    private readonly ITokenService _tokens = Substitute.For<ITokenService>();
    private readonly ICurrentUser _currentUser = Substitute.For<ICurrentUser>();
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _sut = new AuthService(_users, _hasher, _tokens, _currentUser);
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailExists_ThrowsConflict()
    {
        _users.EmailExistsAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(true);

        Func<Task> act = () => _sut.RegisterAsync(new RegisterRequest { Name = "A", Email = "a@a.com", Password = "Passw0rd" });

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task RegisterAsync_WhenValid_HashesPasswordAndAssignsUserRole()
    {
        _users.EmailExistsAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(false);
        _hasher.Hash("Passw0rd").Returns("HASHED");

        var result = await _sut.RegisterAsync(new RegisterRequest { Name = "A", Email = "A@A.com", Password = "Passw0rd" });

        result.Role.Should().Be(UserRoles.User);
        result.Email.Should().Be("a@a.com");
        await _users.Received(1).AddAsync(
            Arg.Is<User>(u => u.Role == UserRoles.User && u.PasswordHash == "HASHED" && u.Email == "a@a.com"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LoginAsync_WhenUserNotFound_ThrowsUnauthorized()
    {
        _users.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);

        Func<Task> act = () => _sut.LoginAsync(new LoginRequest { Email = "a@a.com", Password = "x" });

        await act.Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task LoginAsync_WhenPasswordInvalid_ThrowsUnauthorized()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "a@a.com", PasswordHash = "H" };
        _users.GetByEmailAsync("a@a.com", Arg.Any<CancellationToken>()).Returns(user);
        _hasher.Verify("x", "H").Returns(false);

        Func<Task> act = () => _sut.LoginAsync(new LoginRequest { Email = "a@a.com", Password = "x" });

        await act.Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task LoginAsync_WhenValid_ReturnsTokenAndUser()
    {
        var user = new User { Id = Guid.NewGuid(), Name = "A", Email = "a@a.com", PasswordHash = "H", Role = UserRoles.User };
        _users.GetByEmailAsync("a@a.com", Arg.Any<CancellationToken>()).Returns(user);
        _hasher.Verify("Passw0rd", "H").Returns(true);
        _tokens.GenerateToken(user).Returns("TOKEN");

        var result = await _sut.LoginAsync(new LoginRequest { Email = "a@a.com", Password = "Passw0rd" });

        result.AccessToken.Should().Be("TOKEN");
        result.User.Email.Should().Be("a@a.com");
    }
}
