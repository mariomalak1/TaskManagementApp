using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Domain.Constants;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence.Seeders;

public class AdminSeeder
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminSeeder> _logger;

    public AdminSeeder(
        AppDbContext context,
        IPasswordHasher passwordHasher,
        IConfiguration configuration,
        ILogger<AdminSeeder> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var adminName = _configuration["Admin:Name"];
        var adminEmail = _configuration["Admin:Email"];
        var adminPassword = _configuration["Admin:Password"];

        if (string.IsNullOrWhiteSpace(adminName)
            || string.IsNullOrWhiteSpace(adminEmail)
            || string.IsNullOrWhiteSpace(adminPassword))
        {
            _logger.LogWarning("Admin seed configuration is incomplete. Skipping admin seed.");
            return;
        }

        var normalizedEmail = adminEmail.Trim().ToLowerInvariant();

        var alreadyExists = await _context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == normalizedEmail, cancellationToken);

        if (alreadyExists){
            _logger.LogInformation("Admin user already present. Skipping seed.");
            return;
        }

        var admin = new User
        {
            Id = Guid.NewGuid(),
            Name = adminName.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.Hash(adminPassword),
            Role = UserRoles.Admin,
            CreatedAt = DateTime.UtcNow
        };

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            _context.Users.Add(admin);
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            _logger.LogInformation("Admin user seeded successfully.");
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.LogInformation("Admin user was seeded concurrently by another instance. Skipping.");
        }
    }
}
