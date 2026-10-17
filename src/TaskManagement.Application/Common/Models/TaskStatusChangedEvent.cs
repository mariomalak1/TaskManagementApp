using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.Common.Models;

public record TaskStatusChangedEvent(Guid TaskId, TaskItemStatus Status);
