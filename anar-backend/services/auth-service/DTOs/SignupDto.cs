using System.ComponentModel.DataAnnotations;

namespace auth_service.DTOs;

public class SignupDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;
}