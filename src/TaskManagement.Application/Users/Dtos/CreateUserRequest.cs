using System.ComponentModel.DataAnnotations;
using TaskManagement.Domain.Constants;

namespace TaskManagement.Application.Users.Dtos;

public class CreateUserRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d).+$",
        ErrorMessage = "Password must contain at least one letter and one digit.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(User|Admin)$",
        ErrorMessage = "Role must be either 'User' or 'Admin'.")]
    public string Role { get; set; } = UserRoles.User;
}
