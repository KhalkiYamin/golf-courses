import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminUser } from '../all-modules/models/admin-user';

@Injectable({
    providedIn: 'root'
})
export class AdminUserService {

    private apiUrl = 'http://localhost:8081/api/admin';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');

        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', 'Bearer ' + token);
        }

        return headers;
    }

    getAllUsers(): Observable<AdminUser[]> {
        return this.http.get<AdminUser[]>(`${this.apiUrl}/users`, {
            headers: this.getHeaders()
        });
    }

    getAthletes(): Observable<AdminUser[]> {
        return this.http.get<AdminUser[]>(`${this.apiUrl}/athletes`, {
            headers: this.getHeaders()
        });
    }

    getCoaches(): Observable<AdminUser[]> {
        return this.http.get<AdminUser[]>(`${this.apiUrl}/coaches`, {
            headers: this.getHeaders()
        });
    }

    addUser(payload: any): Observable<AdminUser> {
        return this.http.post<AdminUser>(`${this.apiUrl}/users`, payload, {
            headers: this.getHeaders()
        });
    }

    approveCoach(id: number): Observable<string> {
        return this.http.put(`${this.apiUrl}/coaches/${id}/approve`, {}, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }

    deleteUser(id: number): Observable<string> {
        return this.http.delete(`${this.apiUrl}/users/${id}`, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }

    updateUser(id: number, user: any): Observable<string> {
        return this.http.put(`${this.apiUrl}/users/${id}`, user, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }
}