using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RolesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Roles
        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            var roles = await _context.Roles.ToListAsync();
            return Ok(new
            {
                status = new
                {
                    code = "200",
                    description = "Success"
                },
                data = roles.Select(r => new
                {
                    roleId = r.RoleId,
                    roleName = r.RoleName
                })
            });
        }

        // POST: api/Roles
        [HttpPost]
        public async Task<IActionResult> AddRole([FromBody] Role role)
        {
            if (role == null || string.IsNullOrEmpty(role.RoleName))
            {
                return BadRequest(new
                {
                    status = new
                    {
                        code = "400",
                        description = "Invalid role data"
                    }
                });
            }

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                status = new
                {
                    code = "201",
                    description = "Role added successfully"
                },
                data = new
                {
                    roleId = role.RoleId,
                    roleName = role.RoleName
                }
            });
        }

    }
}
