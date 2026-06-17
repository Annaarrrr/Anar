using auth_service.Data;
using auth_service.DTOs;
using auth_service.Models;
using Microsoft.EntityFrameworkCore;

namespace auth_service.Services;

public class FcmTokenService
{
    private readonly AppDbContext _context;

    public FcmTokenService(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// تسجيل رمز FCM جديد أو تحديث رمز موجود.
    /// إذا كان الرمز موجوداً مسبقاً لمستخدم آخر، يتم نقله إلى المستخدم الحالي.
    /// </summary>
    public async Task<FcmTokenDto> RegisterTokenAsync(Guid userId, FcmTokenRegisterDto dto)
    {
        // البحث عن رمز موجود بنفس القيمة
        var existingToken = await _context.FcmTokens
            .FirstOrDefaultAsync(t => t.Token == dto.Token);

        if (existingToken != null)
        {
            // تحديث المستخدم المرتبط بالرمز (نقل الملكية)
            existingToken.UserId = userId;
            existingToken.DeviceName = dto.DeviceName ?? existingToken.DeviceName;
            existingToken.UpdatedAt = DateTime.UtcNow;
            _context.FcmTokens.Update(existingToken);
        }
        else
        {
            // إنشاء رمز جديد
            var newToken = new FcmToken
            {
                Token = dto.Token,
                DeviceName = dto.DeviceName,
                UserId = userId
            };
            _context.FcmTokens.Add(newToken);
        }

        await _context.SaveChangesAsync();

        // إعادة الرمز المحدث أو الجديد
        var tokenEntity = existingToken ?? await _context.FcmTokens
            .FirstAsync(t => t.Token == dto.Token);

        return MapToDto(tokenEntity);
    }

    /// <summary>
    /// جلب جميع رموز FCM لمستخدم معين.
    /// </summary>
    public async Task<List<FcmTokenDto>> GetTokensForUserAsync(Guid userId)
    {
        var tokens = await _context.FcmTokens
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.UpdatedAt)
            .ToListAsync();

        return tokens.Select(MapToDto).ToList();
    }

    /// <summary>
    /// جلب جميع معرفات المستخدمين الذين لديهم رموز مسجلة.
    /// </summary>
    public async Task<List<Guid>> GetAllUserIdsWithTokensAsync()
    {
        return await _context.FcmTokens
            .Select(t => t.UserId)
            .Distinct()
            .ToListAsync();
    }

    private static FcmTokenDto MapToDto(FcmToken token)
    {
        return new FcmTokenDto
        {
            Id = token.Id,
            Token = token.Token,
            DeviceName = token.DeviceName,
            CreatedAt = token.CreatedAt,
            UpdatedAt = token.UpdatedAt
        };
    }
}