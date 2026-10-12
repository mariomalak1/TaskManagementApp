using FluentAssertions;
using TaskManagement.Infrastructure.Security;
using Xunit;

namespace TaskManagement.UnitTests.Security;

public class PasswordHasherServiceTests
{
    private readonly PasswordHasherService _sut = new();

    [Fact]
    public void Hash_DoesNotReturnPlainTextPassword()
    {
        var hash = _sut.Hash("Passw0rd");

        hash.Should().NotBeNullOrWhiteSpace();
        hash.Should().NotBe("Passw0rd");
    }

    [Fact]
    public void Verify_WithCorrectPassword_ReturnsTrue()
    {
        var hash = _sut.Hash("Passw0rd");

        _sut.Verify("Passw0rd", hash).Should().BeTrue();
    }

    [Fact]
    public void Verify_WithWrongPassword_ReturnsFalse()
    {
        var hash = _sut.Hash("Passw0rd");

        _sut.Verify("wrong-password", hash).Should().BeFalse();
    }
}
