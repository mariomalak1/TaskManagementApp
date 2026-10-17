using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Channels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Common.Models;
using TaskManagement.Application.Tasks.Dtos;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private static readonly JsonSerializerOptions StreamSerializerOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly ITaskService _taskService;
    private readonly ICurrentUser _currentUser;
    private readonly ITaskEventPublisher _taskEvents;

    public TasksController(
        ITaskService taskService,
        ICurrentUser currentUser,
        ITaskEventPublisher taskEvents)
    {
        _taskService = taskService;
        _currentUser = currentUser;
        _taskEvents = taskEvents;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request, CancellationToken cancellationToken)
    {
        var task = await _taskService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var task = await _taskService.GetByIdAsync(id, cancellationToken);
        return Ok(task);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] TaskFilterRequest filter, [FromQuery] PaginationQuery pagination, CancellationToken cancellationToken)
    {
        var result = await _taskService.GetAllAsync(filter, pagination, cancellationToken);
        return Ok(result);
    }
    
    // for SSE listen by client
    [HttpGet("stream")]
    public async Task Stream(CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId;

        Response.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no";

        using var subscription = _taskEvents.Subscribe(userId);

        await Response.WriteAsync(": connected\n\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);

        try {
            await foreach (var change in subscription.Reader.ReadAllAsync(cancellationToken)) {
                var json = JsonSerializer.Serialize(change, StreamSerializerOptions);
                await Response.WriteAsync($"event: task-updated\ndata: {json}\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }
        }
        catch (OperationCanceledException) {
            // Client disconnected
        }
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTaskStatusRequest request, CancellationToken cancellationToken)
    {
        var task = await _taskService.UpdateStatusAsync(id, request, cancellationToken);
        return Ok(task);
    }
}
