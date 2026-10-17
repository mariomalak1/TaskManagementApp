using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.Common.Interfaces;
using TaskManagement.Application.Common.Models;
using TaskManagement.Application.Users.Dtos;
using TaskManagement.Domain.Constants;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = UserRoles.Admin)]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _userService.CreateUserAsync(request, cancellationToken);
        return Created($"/api/users/{user.Id}", user);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery pagination, CancellationToken cancellationToken)
    {
        var users = await _userService.GetAllUsersAsync(pagination, cancellationToken);
        return Ok(users);
    }
    
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _userService.DeleteUserAsync(id, cancellationToken);

        return NoContent();
    }
}
