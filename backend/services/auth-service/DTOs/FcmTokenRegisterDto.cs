using System.ComponentModel.DataAnnotations;

namespace auth_service.DTOs;

public class FcmTokenRegisterDto
{
    [Required]
    public string Token { get; set; } = string.Empty;

    public string? DeviceName { get; set; }
}