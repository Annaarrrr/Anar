using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace auth_service.Models;

public class FcmToken
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Token { get; set; } = string.Empty;

    public string? DeviceName { get; set; } // اختياري: اسم الجهاز (مثل "iPhone 15")

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // العلاقة مع المستخدم
    [ForeignKey("User")]
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}