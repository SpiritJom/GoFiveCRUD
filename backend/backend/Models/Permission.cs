using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Permission
    {
        [Key]
        public string PermissionId { get; set; }
        public string PermissionName { get; set; }
    }
}
