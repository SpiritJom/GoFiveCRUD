import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://localhost:7206/api';

  constructor(private http: HttpClient) {}

  // Users API
  getUsers(filter: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/DataTable`, filter);
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Users/${userId}`);
  }

  addUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Users`, userData);
  }

  editUser(userId: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/Users/${userId}`, userData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/Users/${userId}`);
  }

  // Roles API
  getRoles(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Roles`);
  }

  // Permissions API
  getPermissions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Permissions`);
  }
}
