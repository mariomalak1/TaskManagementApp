namespace TaskManagement.Application.Authentication.Dtos;

public class AuthResponse
{
    public UserResponse User { get; set; } = new();
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}
