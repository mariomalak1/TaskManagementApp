using System.Threading.Channels;
using TaskManagement.Application.Common.Models;

namespace TaskManagement.Application.Common.Interfaces;

public interface ITaskEventPublisher
{
    void Publish(Guid userId, TaskStatusChangedEvent change);

    ITaskEventSubscription Subscribe(Guid userId);
}

public interface ITaskEventSubscription : IDisposable
{
    ChannelReader<TaskStatusChangedEvent> Reader { get; }
}
