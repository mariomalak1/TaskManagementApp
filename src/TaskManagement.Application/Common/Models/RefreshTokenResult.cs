namespace TaskManagement.Application.Common.Models;

public class RefreshTokenResult
{
    public string RawToken { get; init; } = string.Empty;
    public string TokenHash { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
}
