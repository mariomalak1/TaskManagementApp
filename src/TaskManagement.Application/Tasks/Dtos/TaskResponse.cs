using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Tasks.Dtos;

public class TaskResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskItemStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid UserId { get; set; }
}
