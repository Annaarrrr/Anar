using Microsoft.EntityFrameworkCore;
using auth_service.Models;

namespace auth_service.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<FcmToken> FcmTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().ToTable("users");

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // فهرس فريد على البريد الإلكتروني
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // فهرس فريد على رمز FCM نفسه (لضمان عدم تكراره عبر المستخدمين)
        modelBuilder.Entity<FcmToken>()
            .HasIndex(t => t.Token)
            .IsUnique();

        // العلاقة: مستخدم واحد ← عدة رموز
        modelBuilder.Entity<FcmToken>()
            .HasOne(t => t.User)
            .WithMany(u => u.FcmTokens)   // سنضيف خاصية التنقل في User
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // خريطة الجدول والأعمدة لرموز FCM لتطابق قاعدة البيانات
        modelBuilder.Entity<FcmToken>().ToTable("fcm_tokens");
        modelBuilder.Entity<FcmToken>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Token).HasColumnName("device_token");
            entity.Property(e => e.DeviceName).HasColumnName("device_type");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.UpdatedAt).HasColumnName("last_updated");
            entity.Ignore(e => e.CreatedAt); // تجاهل لعدم وجوده في قاعدة البيانات
        });
    }

    // Configuration for connecton string and database

    //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //{

    //    base.OnConfiguring(optionsBuilder);

    //    var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();

    //    var constr = configuration.GetSection("constr").Value;

    //    optionsBuilder.UseSqlServer(constr);
    //}
}