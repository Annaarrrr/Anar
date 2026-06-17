namespace auth_service.DTOs;

public class FcmTokenDto
{
    public Guid Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public string? DeviceName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
}