using Microsoft.EntityFrameworkCore;
using auth_service.Data;
using auth_service.Services;
using auth_service.Middleware;
using Microsoft.OpenApi;   // <-- أضف هذا لـ Swagger


var builder = WebApplication.CreateBuilder(args);

// إضافة الخدمات
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// إعداد DbContext (PostgreSQL كمثال)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// إضافة خدماتنا
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AuthService>();

// إضافة CORS (للتكامل مع frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// تطبيق الـ Middleware
app.UseCors("AllowAll");

app.UseMiddleware<JwtMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// تشغيل التطبيق
app.Run();