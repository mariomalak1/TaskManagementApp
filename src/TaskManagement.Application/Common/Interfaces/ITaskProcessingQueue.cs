namespace TaskManagement.Application.Common.Interfaces;

public interface ITaskProcessingQueue
{
    ValueTask EnqueueAsync(Guid taskId, CancellationToken cancellationToken = default);
    ValueTask<Guid> DequeueAsync(CancellationToken cancellationToken);
}
