import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../all-modules/models/user';
import { DashboardStats } from '../all-modules/models/dashboard-stats';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private adminBaseUrl = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', 'Bearer ' + token);
    }

    return headers;
  }

  getPendingCoaches(): Observable<User[]> {
    return this.http.get<User[]>(`${this.adminBaseUrl}/coaches/pending`, {
      headers: this.getHeaders()
    });
  }

  getAllCoaches(): Observable<User[]> {
    return this.http.get<User[]>(`${this.adminBaseUrl}/coaches`, {
      headers: this.getHeaders()
    });
  }

  approveCoach(id: number): Observable<any> {
    return this.http.put(`${this.adminBaseUrl}/coaches/${id}/approve`, {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  rejectCoach(id: number): Observable<any> {
    return this.http.put(`${this.adminBaseUrl}/coaches/${id}/reject`, {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.adminBaseUrl}/users`, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.adminBaseUrl}/users/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.adminBaseUrl}/dashboard`, {
      headers: this.getHeaders()
    });
  }
}