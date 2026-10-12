using FluentAssertions;
using NSubstitute;
using TaskManagement.Application.Common.Exceptions;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Tasks;
using TaskManagement.Application.Tasks.Dtos;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using Xunit;

namespace TaskManagement.UnitTests.Tasks;

public class TaskServiceTests
{
    private readonly ITaskRepository _repository = Substitute.For<ITaskRepository>();
    private readonly ICurrentUser _currentUser = Substitute.For<ICurrentUser>();
    private readonly ICacheService _cache = Substitute.For<ICacheService>();
    private readonly ITaskProcessingQueue _queue = Substitute.For<ITaskProcessingQueue>();
    private readonly TaskService _sut;
    private readonly Guid _userId = Guid.NewGuid();

    public TaskServiceTests()
    {
        _currentUser.UserId.Returns(_userId);
        _sut = new TaskService(_repository, _currentUser, _cache, _queue);
    }

    [Fact]
    public async Task CreateAsync_WhenDuplicateTitleToday_ThrowsConflict()
    {
        _repository.ExistsWithTitleOnDateAsync(_userId, Arg.Any<string>(), Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(true);

        Func<Task> act = () => _sut.CreateAsync(new CreateTaskRequest { Title = "Report", Priority = TaskPriority.High });

        await act.Should().ThrowAsync<ConflictException>();
        await _repository.DidNotReceive().AddAsync(Arg.Any<TaskItem>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_WhenValid_CreatesPendingTaskAndEnqueuesProcessing()
    {
        _repository.ExistsWithTitleOnDateAsync(_userId, Arg.Any<string>(), Arg.Any<DateTime>(), Arg.Any<CancellationToken>())
            .Returns(false);

        var result = await _sut.CreateAsync(new CreateTaskRequest
        {
            Title = "  Report  ",
            Description = "monthly",
            Priority = TaskPriority.High
        });

        result.Status.Should().Be(TaskItemStatus.Pending);
        result.Priority.Should().Be(TaskPriority.High);
        result.Title.Should().Be("Report");
        result.UserId.Should().Be(_userId);

        await _repository.Received(1).AddAsync(
            Arg.Is<TaskItem>(t => t.Status == TaskItemStatus.Pending && t.UserId == _userId && t.Title == "Report"),
            Arg.Any<CancellationToken>());
        await _queue.Received(1).EnqueueAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetByIdAsync_WhenCached_ReturnsCachedAndSkipsRepository()
    {
        var id = Guid.NewGuid();
        var cached = new TaskResponse { Id = id, Title = "Cached", UserId = _userId };
        _cache.GetAsync<TaskResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(cached);

        var result = await _sut.GetByIdAsync(id);

        result.Should().BeSameAs(cached);
        await _repository.DidNotReceive().GetByIdForUserAsync(Arg.Any<Guid>(), Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotCached_LoadsFromRepositoryAndCachesIt()
    {
        var id = Guid.NewGuid();
        _cache.GetAsync<TaskResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((TaskResponse?)null);
        _repository.GetByIdForUserAsync(id, _userId, Arg.Any<CancellationToken>()).Returns(new TaskItem
        {
            Id = id,
            Title = "T",
            UserId = _userId,
            Status = TaskItemStatus.Pending,
            Priority = TaskPriority.Low
        });

        var result = await _sut.GetByIdAsync(id);

        result.Id.Should().Be(id);
        await _cache.Received(1).SetAsync(Arg.Any<string>(), Arg.Any<TaskResponse>(), Arg.Any<TimeSpan>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotOwnedOrMissing_ThrowsNotFound()
    {
        _cache.GetAsync<TaskResponse>(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((TaskResponse?)null);
        _repository.GetByIdForUserAsync(Arg.Any<Guid>(), _userId, Arg.Any<CancellationToken>()).Returns((TaskItem?)null);

        Func<Task> act = () => _sut.GetByIdAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenValid_UpdatesStatusAndInvalidatesCache()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdForUserAsync(id, _userId, Arg.Any<CancellationToken>()).Returns(new TaskItem
        {
            Id = id,
            UserId = _userId,
            Title = "T",
            Status = TaskItemStatus.Pending,
            Priority = TaskPriority.Low
        });

        var result = await _sut.UpdateStatusAsync(id, new UpdateTaskStatusRequest { Status = TaskItemStatus.Done });

        result.Status.Should().Be(TaskItemStatus.Done);
        await _repository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        await _cache.Received(1).RemoveAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenNotFound_ThrowsNotFound()
    {
        _repository.GetByIdForUserAsync(Arg.Any<Guid>(), _userId, Arg.Any<CancellationToken>()).Returns((TaskItem?)null);

        Func<Task> act = () => _sut.UpdateStatusAsync(Guid.NewGuid(), new UpdateTaskStatusRequest { Status = TaskItemStatus.Done });

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
