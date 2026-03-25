import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

    deleteCoach(id: number): Observable<string> {
        return this.http.delete(`${this.apiUrl}/coaches/${id}`, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }

    deleteAthlete(id: number): Observable<string> {
        return this.http.delete(`${this.apiUrl}/athletes/${id}`, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }

    deleteUserWithFallback(id: number, role: string): Observable<string> {
        const normalizedRole = (role || '').toUpperCase();

        return this.deleteUser(id).pipe(
            catchError(() => {
                if (normalizedRole === 'COACH') {
                    return this.deleteCoach(id);
                }

                if (normalizedRole === 'ATHLETE') {
                    return this.deleteAthlete(id);
                }

                return throwError(() => new Error('Suppression utilisateur impossible: rôle inconnu.'));
            })
        );
    }

    updateUser(id: number, user: any): Observable<string> {
        return this.http.put(`${this.apiUrl}/users/${id}`, user, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }

    deactivateUser(user: AdminUser): Observable<string> {
        const payload: any = {
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            telephone: user.telephone,
            role: user.role,
            enabled: false
        };

        if (user.role === 'ATHLETE') {
            payload.sportId = (user as any).sport?.id;
            payload.niveau = user.niveau;
        }

        if (user.role === 'COACH') {
            payload.specialiteId = (user as any).specialite?.id;
            payload.experience = (user as any).experience ?? 0;
        }

        return this.updateUser(user.id, payload);
    }
}