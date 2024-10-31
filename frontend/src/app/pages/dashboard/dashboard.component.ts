import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {MatIconModule} from '@angular/material/icon'
import { ApiService } from '../../api.service';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  users: any[] = [];
  roles: any[] = [];
  permissions: any[] = [];
  showModal: boolean = false;
  isEditMode: boolean = false; 
  newUser: any = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '', 
    roleId: '',
    permissions: []
  };

  // Pagination
  currentPage: number = 1;  // start page
  pageSize: number = 6;     // number items of page
  totalUsers: number = 0;   // total users

  searchTerm: string = ''; // Search term
  sortField: string = 'firstName'; // Default sort field
  sortDirection: string = 'asc'; // Default sort direction

  

  selectedPermissions: any = {};

  constructor(private apiService: ApiService) {}


  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadPermissions();
  }

  // Load user data
  loadUsers(): void {
    const filter = {
      orderBy: this.sortField,
      orderDirection: this.sortDirection,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm
    };
    this.apiService.getUsers(filter).subscribe(
      response => {
        console.log("Response data:", response);
        this.users = response.dataSource;
        this.totalUsers = response.totalCount;
      },  
      error => {
        console.error("Error loading users:", error);
      }
    );
  }
  

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadUsers(); 
  }

  // search input
  searchUsers(): void {
    this.currentPage = 1; // Reset to first page on search
    this.loadUsers();
  }


  // sorting
  sortUsers(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadUsers();
  }


  // Load Roles
  loadRoles(): void {
    this.apiService.getRoles().subscribe(response => {
      this.roles = response.data;
    });
  }

  // Load Permisssions
  loadPermissions(): void {
    this.apiService.getPermissions().subscribe(response => {
      this.permissions = response.data;
      this.permissions.forEach((permission: any) => {
        this.selectedPermissions[permission.permissionId] = {
          isReadable: false,
          isWritable: false,
          isDeletable: false
        };
      });
    });
  }

  // Function to get permission name by ID
  getPermissionName(permissionId: string): string {
    const permission = this.permissions.find(p => p.permissionId === permissionId);
    return permission ? permission.permissionName : 'Unknown';
  }

  // For add or edit user
  openModal(isEditMode: boolean, user?: any): void {
    this.isEditMode = isEditMode;
    this.showModal = true;
  
    if (isEditMode && user) {
      this.apiService.getUserById(user.userId).subscribe(userData => {
        const data = userData.data;  
        console.log(data);  
        this.newUser = {
          id: data.id,  
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '', 
          username: data.username,
          password: '', 
          confirmPassword: '',  
          roleId: data.role?.roleId || '', 
          permissions: data.permissions || [] 
        };
        data.permissions?.forEach((perm: any) => {
          this.selectedPermissions[perm.permissionId] = {
            isReadable: perm.isReadable,
            isWritable: perm.isWritable,
            isDeletable: perm.isDeletable
          };
        });
      });
    } else {
      // if add user
      this.newUser = {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        roleId: '',
        permissions: []
      };
    }
  }
  
  
  closeModal(): void {
    this.showModal = false;
  }

  // delete user
  deleteUser(userId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteUser(userId).subscribe(() => {
          Swal.fire('Deleted!', 'The user has been deleted.', 'success');
          this.loadUsers();
        });
      }
    });
  }

  selectHighestPermission(): any[] {
    const permissionOrder = ['2222', '1111', '3333', '4444'];
    const finalPermissions = [];
    for (const permId of permissionOrder) {
      if (
        this.selectedPermissions[permId]?.isReadable || 
        this.selectedPermissions[permId]?.isWritable || 
        this.selectedPermissions[permId]?.isDeletable
      ) {
        finalPermissions.push({
          permissionId: permId,
          isReadable: this.selectedPermissions[permId].isReadable || false,
          isWritable: this.selectedPermissions[permId].isWritable || false,
          isDeletable: this.selectedPermissions[permId].isDeletable || false
        });
        break; 
      }
    }
    return finalPermissions;
  }

  // Add User
addUser(): void {
  if (!this.newUser.username || !this.newUser.password || !this.newUser.confirmPassword || !this.newUser.roleId) {
    Swal.fire('Error', 'Please fill in all required fields.', 'error');
    return;
  }
  
  if (this.newUser.password !== this.newUser.confirmPassword) {
    Swal.fire('Error', 'Passwords do not match', 'error');
    return;
  }
  
  if (!this.hasPermissionSelected()) {
    Swal.fire('Error', 'At least one permission is required.', 'error');
    return;
  }

  this.newUser.permissions = this.selectHighestPermission();
  this.apiService.addUser(this.newUser).subscribe(response => {
    this.closeModal();
    this.loadUsers();
    
    // Show success message
    Swal.fire('Success', 'User has been added successfully.', 'success');
  });
}

// Edit User
editUser(): void {
  if (!this.newUser.username || !this.newUser.password || !this.newUser.confirmPassword || !this.newUser.roleId) {
    Swal.fire('Error', 'Please fill in all required fields.', 'error');
    return;
  }

  if (this.newUser.password !== this.newUser.confirmPassword) {
    Swal.fire('Error', 'Passwords do not match', 'error');
    return;
  }

  if (!this.hasPermissionSelected()) {
    Swal.fire('Error', 'At least one permission is required.', 'error');
    return;
  }

  this.newUser.permissions = this.selectHighestPermission();
  this.apiService.editUser(this.newUser.id, this.newUser).subscribe(response => {
    this.closeModal();
    this.loadUsers();
    
    // Show success message
    Swal.fire('Success', 'User has been edited successfully.', 'success');
  });
}
  

  // save (or edit) user
  saveUser(): void {
    if (this.isEditMode) {
      this.editUser();
    } else {
      this.addUser();
    }
  }

  getRoleName(roleId: string): string {
    const role = this.roles.find(r => r.roleId === roleId); 
    return role ? role.roleName : 'Unknown';
  }


  // Function to format the date according to the month length condition
formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const year = date.getFullYear();

  // Array of month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Get the month name
  const monthName = monthNames[date.getMonth()];

  // If month name is longer than 5 characters, shorten to 3 characters
  const formattedMonth = monthName.length > 5 ? monthName.substring(0, 3) : monthName;

  // Return the formatted date
  return `${day} ${formattedMonth}, ${year}`;
}


hasPermissionSelected(): boolean {
  return Object.values(this.selectedPermissions).some((perm: any) => {
    return perm && (perm.isReadable === true || perm.isWritable === true || perm.isDeletable === true);
  });
}




  
}
