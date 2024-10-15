using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Delete User
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new
                {
                    status = new
                    {
                        code = "404",
                        description = "User not found"
                    },
                    data = new
                    {
                        result = false,
                        message = "User does not exist"
                    }
                });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                status = new
                {
                    code = "200",
                    description = "Success"
                },
                data = new
                {
                    result = true,
                    message = "User successfully deleted"
                }
            });
        }

        // 2. Edit User
        [HttpPut("{id}")]
        public async Task<IActionResult> EditUser(string id, [FromBody] CreateUserDto userDto)
        {
            var existingUser = await _context.Users.Include(u => u.Permissions).FirstOrDefaultAsync(u => u.Id == id);
            if (existingUser == null)
            {
                return NotFound(new
                {
                    status = new
                    {
                        code = "404",
                        description = "User not found"
                    }
                });
            }

            // Update user properties
            existingUser.FirstName = userDto.FirstName;
            existingUser.LastName = userDto.LastName;
            existingUser.Email = userDto.Email;
            existingUser.Phone = userDto.Phone;
            existingUser.Username = userDto.Username;

            // Hash password if it's provided in the DTO
            if (!string.IsNullOrEmpty(userDto.Password))
            {
                var hashedPassword = HashPassword(userDto.Password);
                existingUser.Password = hashedPassword;
            }

            existingUser.RoleId = userDto.RoleId;

            // Clear existing permissions
            existingUser.Permissions.Clear();

            // Add new permissions
            foreach (var permissionDto in userDto.Permissions)
            {
                var userPermission = new UserPermission
                {
                    UserId = existingUser.Id,  // ใช้ userId จาก existingUser
                    PermissionId = permissionDto.PermissionId,
                    IsReadable = permissionDto.IsReadable,
                    IsWritable = permissionDto.IsWritable,
                    IsDeletable = permissionDto.IsDeletable
                };

                _context.UserPermissions.Add(userPermission);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                status = new { code = "200", description = "Success" },
                data = new
                {
                    userId = existingUser.Id,
                    firstName = existingUser.FirstName,
                    lastName = existingUser.LastName,
                    email = existingUser.Email,
                    phone = existingUser.Phone,
                    role = new
                    {
                        roleId = existingUser.RoleId
                    },
                    username = existingUser.Username,
                    permissions = userDto.Permissions.Select(p => new { p.PermissionId })
                }
            });
        }


        // 3. Get User By Id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _context.Users.Include(u => u.Permissions)
                               .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                return NotFound(new
                {
                    status = new
                    {
                        code = "404",
                        description = "User not found"
                    }
                });
            }

            return Ok(new
            {
                status = new
                {
                    code = "200",
                    description = "Success"
                },
                data = new
                {
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    phone = user.Phone,
                    role = new
                    {
                        roleId = user.RoleId
                    },
                    username = user.Username,
                    permissions = user.Permissions.Select(p => new
                    {
                        permissionId = p.PermissionId
                    })
                }
            });

        }

        // 4. Get Users with Pagination (DataTable)
        [HttpPost("DataTable")]
        public async Task<IActionResult> GetUsers([FromBody] UserFilterDto filter)
        {
            var query = _context.Users.Include(u => u.Permissions).AsQueryable();


            if (!string.IsNullOrEmpty(filter.Search))
            {
                query = query.Where(u => u.FirstName.Contains(filter.Search) || u.LastName.Contains(filter.Search));
            }

            if (!string.IsNullOrEmpty(filter.OrderBy))
            {
                if (filter.OrderDirection == "asc")
                    query = query.OrderBy(u => u.FirstName);  // Adjust field based on your needs
                else
                    query = query.OrderByDescending(u => u.FirstName);
            }

            var totalCount = await query.CountAsync();
            var users = await query.Skip((filter.PageNumber - 1) * filter.PageSize)
                                   .Take(filter.PageSize).ToListAsync();

            return Ok(new
            {
                dataSource = users.Select(u => new
                {
                    userId = u.Id,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    email = u.Email,
                    role = new
                    {
                        roleId = u.RoleId
                    },
                    username = u.Username,
                    permissions = u.Permissions.Select(p => new
                    {
                        permissionId = p.PermissionId
                    }),
                    createdDate = u.CreatedDate.ToString("yyyy-MM-dd")
                }),
                page = filter.PageNumber,
                pageSize = filter.PageSize,
                totalCount = totalCount
            });

        }
        // 5. Add New User
        [HttpPost]
        public async Task<IActionResult> AddUser([FromBody] CreateUserDto userDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { status = new { code = "400", description = "Invalid data" }, data = ModelState });
            }

            // check Id 
            var existingUserWithId = await _context.Users.FirstOrDefaultAsync(u => u.Id == userDto.Id);
            if (existingUserWithId != null)
            {
                return BadRequest(new { status = new { code = "400", description = "User Id already exists" } });
            }

            // check RoleId
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleId == userDto.RoleId);
            if (role == null)
            {
                return BadRequest(new { status = new { code = "400", description = "Invalid RoleId" } });
            }

            // Hash 
            var hashedPassword = HashPassword(userDto.Password);

            // create new user
            var user = new User
            {
                Id = userDto.Id,
                FirstName = userDto.FirstName,
                LastName = userDto.LastName,
                Email = userDto.Email,
                Phone = userDto.Phone,
                Username = userDto.Username,
                Password = hashedPassword, 
                RoleId = userDto.RoleId,
                CreatedDate = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            foreach (var permissionDto in userDto.Permissions)
            {
                var userPermission = new UserPermission
                {
                    UserId = user.Id,
                    PermissionId = permissionDto.PermissionId,
                    IsReadable = permissionDto.IsReadable,
                    IsWritable = permissionDto.IsWritable,
                    IsDeletable = permissionDto.IsDeletable
                };

                _context.UserPermissions.Add(userPermission);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                status = new { code = "201", description = "User added successfully" },
                data = new
                {
                    userId = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    phone = user.Phone,
                    username = user.Username,
                    permissions = userDto.Permissions.Select(p => new { p.PermissionId })
                }
            });
        }

        // Hash
        private string HashPassword(string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }



    }
}