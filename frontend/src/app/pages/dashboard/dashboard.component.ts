import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  users: any[] = [];
  roles: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Get Users
    this.http.post<any>('https://localhost:7206/api/users/DataTable', {
      "orderBy": "firstName",
      "orderDirection": "asc",
      "pageNumber": 1,
      "pageSize": 10,
      "search": ""
    }).subscribe(response => {
      this.users = response.dataSource;
      console.log(this.users); 
    });
    
    // Get Roles 
    this.http.get<any>('https://localhost:7206/api/Roles').subscribe(response => {
      this.roles = response.data; 
    });
  }

  // Get RoleName from RoleId
  getRoleName(roleId: string): string {
    const role = this.roles.find(r => r.roleId === roleId); 
    return role ? role.roleName : 'Unknown'; 
  }
}
