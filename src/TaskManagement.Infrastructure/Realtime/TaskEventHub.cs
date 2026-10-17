using System.Collections.Concurrent;
using System.Threading.Channels;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Common.Models;

namespace TaskManagement.Infrastructure.Realtime;

public class TaskEventHub : ITaskEventPublisher
{
    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<Guid, Channel<TaskStatusChangedEvent>>> _subscribers = new();

    public void Publish(Guid userId, TaskStatusChangedEvent change)
    {
        if (_subscribers.TryGetValue(userId, out var channels))
        {
            foreach (var channel in channels.Values)
                channel.Writer.TryWrite(change);
        }
    }

    public ITaskEventSubscription Subscribe(Guid userId)
    {
        var subscriptionId = Guid.NewGuid();
        var channel = Channel.CreateUnbounded<TaskStatusChangedEvent>(
            new UnboundedChannelOptions { SingleReader = true, SingleWriter = false });

        var userChannels = _subscribers.GetOrAdd(
            userId, _ => new ConcurrentDictionary<Guid, Channel<TaskStatusChangedEvent>>());
        userChannels[subscriptionId] = channel;

        return new Subscription(channel.Reader, () =>
        {
            channel.Writer.TryComplete();
            if (_subscribers.TryGetValue(userId, out var channels))
            {
                channels.TryRemove(subscriptionId, out _);
                if (channels.IsEmpty)
                    _subscribers.TryRemove(userId, out _);
            }
        });
    }

    private sealed class Subscription : ITaskEventSubscription
    {
        private readonly Action _onDispose;

        public Subscription(ChannelReader<TaskStatusChangedEvent> reader, Action onDispose)
        {
            Reader = reader;
            _onDispose = onDispose;
        }

        public ChannelReader<TaskStatusChangedEvent> Reader { get; }

        public void Dispose() => _onDispose();
    }
}
