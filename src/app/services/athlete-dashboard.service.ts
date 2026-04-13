import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AthleteSeance } from '../all-modules/models/athlete-seance.model';

export interface AthleteEvaluationResponse {
    technique?: number;
    physique?: number;
    mental?: number;
    discipline?: number;
    endurance?: number;
    speed?: number;
    consistency?: number;
    commentaire?: string;
    coachName?: string;
    updatedAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AthleteDashboardService {

    private apiUrl = 'http://localhost:8081/api/athlete/dashboard';
    private adminCoachApiUrl = 'http://localhost:8081/api/admin/coaches';
    private adminApprovedCoachApiUrl = 'http://localhost:8081/api/admin/coaches/approved';
    private coachProfileApiUrl = 'http://localhost:8081/api/coach/profile';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', 'Bearer ' + token);
        }

        return headers;
    }

    private isAdminRole(): boolean {
        const role = (localStorage.getItem('role') || '').toUpperCase();
        return role === 'ADMIN' || role === 'ROLE_ADMIN';
    }

    getAthleteSeances(): Observable<AthleteSeance[]> {
        return this.http.get<AthleteSeance[]>(
            `${this.apiUrl}/seances`,
            { headers: this.getHeaders() }
        );
    }

    getPresenceSummary(): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/presences/summary`,
            { headers: this.getHeaders() }
        );
    }

    getAthleteProfile(): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/profile`,
            { headers: this.getHeaders() }
        );
    }
    updateAthleteProfile(profile: { nom: string; prenom: string; telephone: string; niveau: string }) {
        return this.http.put<any>(
            `${this.apiUrl}/profile`,
            profile,
            { headers: this.getHeaders() }
        );
    }

    getAthleteEvaluations(): Observable<AthleteEvaluationResponse> {
        return this.http.get<AthleteEvaluationResponse>(
            `${this.apiUrl}/evaluations`,
            { headers: this.getHeaders() }
        );
    }

    getCoachDirectory(): Observable<any[]> {
        const canUseAdminEndpoints = this.isAdminRole();

        return this.fetchCoachList(`${this.apiUrl}/coaches`).pipe(
            switchMap((athleteRows) => {
                if (athleteRows.length) {
                    return of(athleteRows);
                }

                if (!canUseAdminEndpoints) {
                    return this.fetchCoachList('http://localhost:8081/api/coaches/approved').pipe(
                        catchError(() => of([]))
                    );
                }

                return this.fetchCoachList(this.adminApprovedCoachApiUrl).pipe(
                    switchMap((approvedRows) => {
                        if (approvedRows.length) {
                            return of(approvedRows);
                        }

                        return this.fetchCoachList(this.adminCoachApiUrl).pipe(
                            catchError(() => of([]))
                        );
                    }),
                    catchError(() =>
                        this.fetchCoachList(this.adminCoachApiUrl).pipe(
                            catchError(() => of([]))
                        )
                    )
                );
            }),
            catchError(() => of([]))
        );
    }

    getCoachProfileDetails(coachId: number): Observable<any | null> {
        if (!coachId || coachId <= 0) {
            return of(null);
        }

        const canUseAdminEndpoints = this.isAdminRole();

        return this.http.get<any>(`${this.apiUrl}/coaches/${coachId}`, {
            headers: this.getHeaders()
        }).pipe(
            map((response) => this.extractObject(response)),
            catchError(() =>
                (canUseAdminEndpoints
                    ? this.http.get<any>(`${this.adminCoachApiUrl}/${coachId}`, {
                        headers: this.getHeaders()
                    })
                    : this.http.get<any>(`${this.coachProfileApiUrl}/${coachId}`, {
                        headers: this.getHeaders()
                    })
                ).pipe(
                    map((response) => this.extractObject(response)),
                    catchError(() =>
                        this.http.get<any>(`${this.coachProfileApiUrl}/${coachId}`, {
                            headers: this.getHeaders()
                        }).pipe(
                            map((response) => this.extractObject(response)),
                            catchError(() =>
                                this.http.get<any>(`${this.coachProfileApiUrl}/public/${coachId}`, {
                                    headers: this.getHeaders()
                                }).pipe(
                                    map((response) => this.extractObject(response)),
                                    catchError(() =>
                                        (canUseAdminEndpoints
                                            ? this.http.get<any>(`${this.adminCoachApiUrl}/${coachId}/profile`, {
                                                headers: this.getHeaders()
                                            })
                                            : this.http.get<any>(`${this.coachProfileApiUrl}/coach/${coachId}`, {
                                                headers: this.getHeaders()
                                            })
                                        ).pipe(
                                            map((response) => this.extractObject(response)),
                                            catchError(() =>
                                                this.http.get<any>(`${this.coachProfileApiUrl}/coach/${coachId}`, {
                                                    headers: this.getHeaders()
                                                }).pipe(
                                                    map((response) => this.extractObject(response)),
                                                    catchError(() =>
                                                        this.http.get<any>(`${this.coachProfileApiUrl}/public/${coachId}`).pipe(
                                                            map((response) => this.extractObject(response)),
                                                            catchError(() =>
                                                                this.http.get<any>(`http://localhost:8081/api/coaches/${coachId}/profile`).pipe(
                                                                    map((response) => this.extractObject(response)),
                                                                    catchError(() =>
                                                                        this.http.get<any>(`http://localhost:8081/api/public/coaches/${coachId}/profile`).pipe(
                                                                            map((response) => this.extractObject(response)),
                                                                            catchError(() => of(null))
                                                                        )
                                                                    )
                                                                )
                                                            )
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    private fetchCoachList(url: string): Observable<any[]> {
        return this.http.get<any>(url, {
            headers: this.getHeaders()
        }).pipe(
            map((response) => this.extractArray(response)),
            catchError(() => of([]))
        );
    }

    private extractArray(response: any): any[] {
        if (Array.isArray(response)) {
            return response;
        }

        const candidates = [
            response?.content,
            response?.data,
            response?.results,
            response?.items,
            response?.coaches,
            response?.users
        ];

        for (const candidate of candidates) {
            if (Array.isArray(candidate)) {
                return candidate;
            }
        }

        return [];
    }

    private extractObject(response: any): any {
        if (!response || typeof response !== 'object') {
            return null;
        }

        const candidates = [
            response?.data,
            response?.content,
            response?.details,
            response?.profileDetails,
            response?.coachProfile,
            response?.coach_profile,
            response?.coach,
            response?.profile,
            response?.user,
            response
        ];

        for (const candidate of candidates) {
            if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
                return candidate;
            }
        }

        return null;
    }
}