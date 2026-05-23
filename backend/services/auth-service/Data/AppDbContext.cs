using Microsoft.EntityFrameworkCore;
using auth_service.Models;

namespace auth_service.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
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