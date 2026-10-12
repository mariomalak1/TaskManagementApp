using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Application.Authentication;
using TaskManagement.Application.Common.Interfaces;

namespace TaskManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
