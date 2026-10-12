using Microsoft.AspNetCore.Identity;
using TaskManagement.Application.Common.Interfaces;

namespace TaskManagement.Infrastructure.Security;

public class PasswordHasherService : IPasswordHasher {
    private static readonly object HashSubject = new();
    private readonly PasswordHasher<object> _hasher = new();

    public string Hash(string password)
    {
        return _hasher.HashPassword(HashSubject, password);
    }

    public bool Verify(string password, string passwordHash)
    {
        var result = _hasher.VerifyHashedPassword(HashSubject, passwordHash, password);
        return result != PasswordVerificationResult.Failed;
    }
}
