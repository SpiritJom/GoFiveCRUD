using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class PermissionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PermissionsController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/Permissions
    [HttpPost]
    public async Task<IActionResult> AddPermission([FromBody] Permission permission)
    {
        if (permission == null || string.IsNullOrEmpty(permission.PermissionName))
        {
            return BadRequest(new
            {
                status = new
                {
                    code = "400",
                    description = "Invalid permission data"
                }
            });
        }

        _context.Permissions.Add(permission);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            status = new
            {
                code = "201",
                description = "Permission added successfully"
            },
            data = new
            {
                permissionId = permission.PermissionId,
                permissionName = permission.PermissionName
            }
        });
    }

    // GET: api/Permissions
    [HttpGet]
    public async Task<IActionResult> GetPermissions()
    {
        var permissions = await _context.Permissions.ToListAsync();
        return Ok(new
        {
            status = new
            {
                code = "200",
                description = "Success"
            },
            data = permissions.Select(p => new
            {
                permissionId = p.PermissionId,
                permissionName = p.PermissionName
            })
        });
    }
}
