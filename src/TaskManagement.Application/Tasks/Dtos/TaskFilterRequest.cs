using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Tasks.Dtos;

public class TaskFilterRequest
{
    public TaskItemStatus? Status { get; set; }

    public string? Search { get; set; }
}
