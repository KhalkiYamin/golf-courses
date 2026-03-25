import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private baseUrl = 'http://localhost:8081/api';

    constructor(private http: HttpClient) { }

    register(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/auth/register`, data);
    }

    login(loginRequest: { email: string; password: string }): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/auth/login`, loginRequest)
            .pipe(
                tap((res: any) => {
                    localStorage.removeItem('user');
                    localStorage.removeItem('coachId');

                    const token = res.token || res.accessToken;
                    if (token) {
                        localStorage.setItem('token', token);
                    }
                    if (res.role) {
                        localStorage.setItem('role', res.role);
                    }

                    const user = res.user || res.utilisateur;
                    if (user) {
                        localStorage.setItem('user', JSON.stringify(user));
                    }

                    const coachId =
                        res.coachId ||
                        res.user?.coachId ||
                        this.extractUserIdFromJwt(token);

                    if (coachId) {
                        localStorage.setItem('coachId', String(coachId));
                    } else {
                        localStorage.removeItem('coachId');
                    }
                })
            );
    }

    forgotPassword(email: string): Observable<string> {
        return this.http.post(`${this.baseUrl}/auth/forgot-password`, { email }, {
            responseType: 'text'
        });
    }

    verifyResetCode(email: string, code: string): Observable<string> {
        return this.http.post(`${this.baseUrl}/auth/verify-reset-code`, { email, code }, {
            responseType: 'text'
        });
    }

    resetPassword(email: string, code: string, newPassword: string): Observable<string> {
        return this.http.post(`${this.baseUrl}/auth/reset-password`, { email, code, newPassword }, {
            responseType: 'text'
        });
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        localStorage.removeItem('coachId');
    }

    private extractUserIdFromJwt(token?: string): number {
        if (!token) {
            return 0;
        }

        try {
            const payloadPart = token.split('.')[1];
            if (!payloadPart) {
                return 0;
            }

            const base64 = payloadPart
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
            const payload = JSON.parse(atob(paddedBase64));

            const rawId = payload?.coachId ?? payload?.coach_id;
            const id = Number(rawId);
            return Number.isFinite(id) && id > 0 ? id : 0;
        } catch {
            return 0;
        }
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getRole(): string | null {
        return localStorage.getItem('role');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}