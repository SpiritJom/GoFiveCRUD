import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadPermissions();
  }

  // Load user Data
  loadUsers(): void {
    this.http.post<any>('https://localhost:7206/api/users/DataTable', {
      "orderBy":  this.sortField,
      "orderDirection": this.sortDirection,
      "pageNumber": this.currentPage, // currentPage
      "pageSize": this.pageSize,      // pageSize
      "search": this.searchTerm       // Search term
    }).subscribe(response => {
      this.users = response.dataSource;
      this.totalUsers = response.totalCount; // total users
    });
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
    this.http.get<any>('https://localhost:7206/api/Roles').subscribe(response => {
      this.roles = response.data;
    });
  }

  // Load Permisssions
  loadPermissions(): void {
    this.http.get<any>('https://localhost:7206/api/Permissions').subscribe(response => {
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

  // For add or edit user
  openModal(isEditMode: boolean, user?: any): void {
    this.isEditMode = isEditMode;
    this.showModal = true;
  
    if (isEditMode && user) {
      this.http.get<any>(`https://localhost:7206/api/Users/${user.userId}`).subscribe(userData => {
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
        // if confirm
        this.http.delete<any>(`https://localhost:7206/api/Users/${userId}`).subscribe(response => {
          Swal.fire(
            'Deleted!',
            'The user has been deleted.',
            'success'
          );
          this.loadUsers(); 
        });
      }
    });
  }

  selectHighestPermission(): any[] {
    const permissionOrder = ['4444', '3333', '2222', '1111'];
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

  // add new user
  addUser(): void {
    if (this.newUser.password !== this.newUser.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    this.newUser.permissions = this.selectHighestPermission();
    this.http.post<any>('https://localhost:7206/api/Users', this.newUser).subscribe(response => {
      this.closeModal();
      this.loadUsers(); // รีเฟรชรายชื่อผู้ใช้หลังจากเพิ่ม
    });
  }

  // edit user
  editUser(): void {
    if (this.newUser.password !== this.newUser.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    this.newUser.permissions = this.selectHighestPermission();
    this.http.put<any>(`https://localhost:7206/api/Users/${this.newUser.id}`, this.newUser).subscribe(response => {
      this.closeModal();
      this.loadUsers();
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
}
