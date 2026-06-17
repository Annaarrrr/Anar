using Microsoft.AspNetCore.Mvc;
using auth_service.DTOs;
using auth_service.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace auth_service.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // جميع النقاط تتطلب مصادقة ما لم نحدد AllowAnonymous
public class FcmController : ControllerBase
{
    private readonly FcmTokenService _fcmTokenService;

    public FcmController(FcmTokenService fcmTokenService)
    {
        _fcmTokenService = fcmTokenService;
    }

    // الحصول على معرف المستخدم من التوكن
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");
        return Guid.Parse(userIdClaim);
    }

    /// <summary>
    /// تسجيل رمز FCM للمستخدم الحالي.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> RegisterToken([FromBody] FcmTokenRegisterDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetUserId();
        var result = await _fcmTokenService.RegisterTokenAsync(userId, dto);
        return Ok(result);
    }

    /// <summary>
    /// جلب جميع رموز FCM للمستخدم الحالي.
    /// </summary>
    [HttpGet("tokens")]
    public async Task<IActionResult> GetMyTokens()
    {
        var userId = GetUserId();
        var tokens = await _fcmTokenService.GetTokensForUserAsync(userId);
        return Ok(tokens);
    }

    /// <summary>
    /// نقطة نهاية داخلية للحصول على جميع معرفات المستخدمين الذين لديهم رموز.
    /// </summary>
    [HttpGet("internal/users-with-tokens")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUsersWithTokensInternal([FromHeader(Name = "X-Internal-API-Key")] string apiKey)
    {
        var validApiKey = Environment.GetEnvironmentVariable("INTERNAL_API_KEY")
                          ?? "your-internal-api-key-change-me";
        if (string.IsNullOrEmpty(apiKey) || apiKey != validApiKey)
            return Unauthorized(new { message = "Invalid internal API key" });

        var userIds = await _fcmTokenService.GetAllUserIdsWithTokensAsync();
        return Ok(userIds);
    }

    /// <summary>
    /// نقطة نهاية داخلية (لخدمات أخرى) لجلب رموز أي مستخدم.
    /// محمية بواسطة مفتاح API مخصص (يُقرأ من الهيدر).
    /// </summary>
    [HttpGet("internal/tokens/{userId}")]
    [AllowAnonymous] // لا نستخدم JWT هنا بل مفتاح داخلي
    public async Task<IActionResult> GetTokensForUserInternal(Guid userId, [FromHeader(Name = "X-Internal-API-Key")] string apiKey)
    {
        // التحقق من مفتاح API الداخلي (مقارنة بقيمة من الإعدادات)
        var validApiKey = Environment.GetEnvironmentVariable("INTERNAL_API_KEY")
                          ?? "your-internal-api-key-change-me";
        if (string.IsNullOrEmpty(apiKey) || apiKey != validApiKey)
            return Unauthorized(new { message = "Invalid internal API key" });

        var tokens = await _fcmTokenService.GetTokensForUserAsync(userId);
        return Ok(tokens);
    }
}