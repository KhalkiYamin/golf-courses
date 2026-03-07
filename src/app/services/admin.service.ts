import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../all-modules/models/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private adminBaseUrl = 'http://localhost:8081/api/admin';
  private authBaseUrl = 'http://localhost:8081/api/auth';

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

  approveCoach(id: number): Observable<any> {
    return this.http.put(`${this.authBaseUrl}/approve-coach/${id}`, null, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  rejectCoach(id: number): Observable<any> {
    return this.http.put(`${this.adminBaseUrl}/coaches/${id}/reject`, null, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
}