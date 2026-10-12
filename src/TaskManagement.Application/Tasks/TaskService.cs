using TaskManagement.Application.Common.Exceptions;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Tasks.Dtos;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Tasks;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ICurrentUser _currentUser;

    public TaskService(ITaskRepository taskRepository, ICurrentUser currentUser)
    {
        _taskRepository = taskRepository;
        _currentUser = currentUser;
    }

    public async Task<TaskResponse> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var userId = _currentUser.UserId;
        var title = request.Title.Trim();
        var today = DateTime.UtcNow.Date;

        if (await _taskRepository.ExistsWithTitleOnDateAsync(userId, title, today, cancellationToken))
            throw new ConflictException("A task with the same title already exists for today.");

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = title,
            Description = request.Description.Trim(),
            Status = TaskItemStatus.Pending,
            Priority = request.Priority!.Value,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        await _taskRepository.AddAsync(task, cancellationToken);

        return MapToResponse(task);
    }

    public async Task<TaskResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdForUserAsync(id, _currentUser.UserId, cancellationToken);

        if (task is null)
            throw new NotFoundException("Task not found.");

        return MapToResponse(task);
    }

    public async Task<IReadOnlyList<TaskResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var tasks = await _taskRepository.GetAllForUserAsync(_currentUser.UserId, cancellationToken);

        return tasks.Select(MapToResponse).ToList();
    }

    public async Task<TaskResponse> UpdateStatusAsync(Guid id, UpdateTaskStatusRequest request, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdForUserAsync(id, _currentUser.UserId, cancellationToken);

        if (task is null)
            throw new NotFoundException("Task not found.");

        task.Status = request.Status!.Value;

        await _taskRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(task);
    }

    private static TaskResponse MapToResponse(TaskItem task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            CreatedAt = task.CreatedAt,
            UserId = task.UserId
        };
    }
}
