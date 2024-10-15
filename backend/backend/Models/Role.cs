using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Role
    {
        [Key] 
        public string RoleId { get; set; }
        public string RoleName { get; set; }
    }
}
