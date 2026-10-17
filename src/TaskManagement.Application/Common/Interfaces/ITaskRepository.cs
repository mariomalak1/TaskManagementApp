using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Common.Interfaces;

public interface ITaskRepository
{
    Task AddAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetByIdForUserAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<TaskItem> Items, int TotalCount)> GetPagedForUserAsync(
        Guid userId, TaskItemStatus? status, string? search, int skip, int take, CancellationToken cancellationToken = default);
    Task<bool> ExistsWithTitleOnDateAsync(Guid userId, string title, DateTime dayUtc, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
