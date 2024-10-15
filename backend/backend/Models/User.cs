﻿using backend.Models;

public class User
{
    public string Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string RoleId { get; set; }
    public ICollection<UserPermission> Permissions { get; set; }

    public DateTime CreatedDate { get; set; }
}
