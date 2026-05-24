using auth_service.Data;
using auth_service.DTOs;
using auth_service.Models;
using Microsoft.EntityFrameworkCore;

namespace auth_service.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    // يمكن ضبط عدد جولات bcrypt (كلما زاد العدد، زاد الأمان والأداء)
    private const int BcryptWorkFactor = 12; // يوصى بـ 10-12 للتطبيقات العادية

    public AuthService(AppDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto?> SignupAsync(SignupDto dto)
    {
        // التحقق من وجود البريد مسبقاً
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null)
            return null; // أو إثارة استثناء مخصص

        // تشفير كلمة المرور باستخدام bcrypt مع salt تلقائي
        // يتم إنشاء salt عشوائي قوي لكل مستخدم ودمجه في الناتج
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, BcryptWorkFactor);

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = passwordHash
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user.Id, user.Email);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
            return null;

        // التحقق من كلمة المرور: bcrypt يستخرج الـ salt من الـ hash المخزن ويستخدمه للتحقق
        bool passwordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

        if (!passwordValid)
            return null;

        var token = _jwtService.GenerateToken(user.Id, user.Email);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };
    }
}