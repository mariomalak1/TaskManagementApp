using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Infrastructure.Persistence;
using TaskManagement.Infrastructure.Persistence.Seeders;

namespace TaskManagement.Infrastructure;

public static class DatabaseInitializer
{
    public static async Task InitializeDatabaseAsync(
        this IServiceProvider serviceProvider,
        CancellationToken cancellationToken = default)
    {
        using var scope = serviceProvider.CreateScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AdminSeeder>>();

        await dbContext.Database.MigrateAsync(cancellationToken);

        var adminSeeder = new AdminSeeder(dbContext, passwordHasher, configuration, logger);
        await adminSeeder.SeedAsync(cancellationToken);
    }
}
