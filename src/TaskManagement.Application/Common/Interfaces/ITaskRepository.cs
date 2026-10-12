using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Common.Interfaces;

public interface ITaskRepository
{
    Task AddAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetByIdForUserAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TaskItem>> GetAllForUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> ExistsWithTitleOnDateAsync(Guid userId, string title, DateTime dayUtc, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
