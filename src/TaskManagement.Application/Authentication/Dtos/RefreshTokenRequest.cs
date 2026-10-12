using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Application.Authentication.Dtos;

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
