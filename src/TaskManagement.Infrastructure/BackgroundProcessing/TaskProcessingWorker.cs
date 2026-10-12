using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Tasks;
using TaskManagement.Domain.Enums;
using TaskManagement.Infrastructure.Persistence;

namespace TaskManagement.Infrastructure.BackgroundProcessing;

public class TaskProcessingWorker : BackgroundService
{
    private static readonly TimeSpan SimulatedWork = TimeSpan.FromSeconds(5);

    private readonly ITaskProcessingQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TaskProcessingWorker> _logger;

    public TaskProcessingWorker(
        ITaskProcessingQueue queue,
        IServiceScopeFactory scopeFactory,
        ILogger<TaskProcessingWorker> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var taskId = await _queue.DequeueAsync(stoppingToken);

            try
            {
                await ProcessAsync(taskId, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process task {TaskId}.", taskId);
            }
        }
    }

    private async Task ProcessAsync(Guid taskId, CancellationToken cancellationToken)
    {
        await Task.Delay(SimulatedWork, cancellationToken);

        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var cache = scope.ServiceProvider.GetRequiredService<ICacheService>();

        var task = await dbContext.Tasks.FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);
        if (task is null || task.Status != TaskItemStatus.Pending)
            return;

        task.Status = TaskItemStatus.InProgress;
        await dbContext.SaveChangesAsync(cancellationToken);

        await cache.RemoveAsync(TaskCacheKeys.ForTask(task.UserId, task.Id), cancellationToken);

        _logger.LogInformation("Task {TaskId} processed and moved to InProgress.", taskId);
    }
}
