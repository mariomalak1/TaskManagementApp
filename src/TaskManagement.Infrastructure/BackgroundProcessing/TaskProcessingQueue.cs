using System.Threading.Channels;
using TaskManagement.Application.Common.Interfaces;

namespace TaskManagement.Infrastructure.BackgroundProcessing;

public class TaskProcessingQueue : ITaskProcessingQueue
{
    private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>();

    public ValueTask EnqueueAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        return _channel.Writer.WriteAsync(taskId, cancellationToken);
    }

    public ValueTask<Guid> DequeueAsync(CancellationToken cancellationToken)
    {
        return _channel.Reader.ReadAsync(cancellationToken);
    }
}
