using TaskManagement.Application.Common.Models;
using TaskManagement.Application.Tasks.Dtos;

namespace TaskManagement.Application.Common.Interfaces;

public interface ITaskService
{
    Task<TaskResponse> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default);
    Task<TaskResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedResult<TaskResponse>> GetAllAsync(TaskFilterRequest filter, PaginationQuery pagination, CancellationToken cancellationToken = default);
    Task<TaskResponse> UpdateStatusAsync(Guid id, UpdateTaskStatusRequest request, CancellationToken cancellationToken = default);
}
