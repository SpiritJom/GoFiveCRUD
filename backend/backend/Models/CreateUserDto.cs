namespace backend.Models
{
    public class CreateUserDto
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string RoleId { get; set; }
        public List<UserPermissionDto> Permissions { get; set; }
    }

    public class UserPermissionDto
    {
        public string PermissionId { get; set; }
        public bool IsReadable { get; set; }
        public bool IsWritable { get; set; }
        public bool IsDeletable { get; set; }
    }
}
