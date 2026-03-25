import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Seance } from '../all-modules/models/seance.model';

@Injectable({
    providedIn: 'root'
})
export class CoachSeancesService {

    private apiUrl = 'http://localhost:8081/api/seances';
    private coachDashboardApiUrl = 'http://localhost:8081/api/coach/dashboard';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', 'Bearer ' + token);
        }

        return headers;
    }

    private getCoachId(): number {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                const coachId = Number(parsed?.coachId);
                if (Number.isFinite(coachId) && coachId > 0) {
                    return coachId;
                }
            } catch {
            }
        }

        const token = localStorage.getItem('token');
        const tokenCoachId = this.extractCoachIdFromJwt(token);
        if (tokenCoachId > 0) {
            return tokenCoachId;
        }

        const storedCoachId = Number(localStorage.getItem('coachId'));
        if (Number.isFinite(storedCoachId) && storedCoachId > 0) {
            return storedCoachId;
        }

        return 0;
    }

    private extractCoachIdFromJwt(token: string | null): number {
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

    private resolveCoachId(): Observable<number> {
        const coachId = this.getCoachId();
        if (coachId > 0) {
            return of(coachId);
        }

        return this.http.get<any>(`${this.coachDashboardApiUrl}/profile`, {
            headers: this.getHeaders()
        }).pipe(
            map((profile) => Number(profile?.id || 0)),
            tap((profileCoachId) => {
                if (profileCoachId > 0) {
                    localStorage.setItem('coachId', String(profileCoachId));

                    const userRaw = localStorage.getItem('user');
                    if (userRaw) {
                        try {
                            const parsed = JSON.parse(userRaw);
                            localStorage.setItem('user', JSON.stringify({
                                ...parsed,
                                coachId: profileCoachId
                            }));
                        } catch {
                        }
                    }
                }
            }),
            switchMap((profileCoachId) => {
                if (profileCoachId > 0) {
                    return of(profileCoachId);
                }

                return throwError(() => new Error('Coach introuvable'));
            })
        );
    }

    getMySeances(): Observable<Seance[]> {
        return this.resolveCoachId().pipe(
            switchMap((coachId) => this.http.get<Seance[]>(`${this.apiUrl}/coach/${coachId}`, {
                headers: this.getHeaders()
            }))
        );
    }

    filterMySeances(statut?: string, groupe?: string, dateSeance?: string): Observable<Seance[]> {
        return this.resolveCoachId().pipe(
            switchMap((coachId) => {
                let params = new HttpParams();

                if (statut) {
                    params = params.set('statut', statut);
                }

                if (groupe) {
                    params = params.set('niveau', groupe);
                }

                if (dateSeance) {
                    params = params.set('dateSeance', dateSeance);
                }

                return this.http.get<Seance[]>(`${this.apiUrl}/coach/${coachId}/filter`, {
                    headers: this.getHeaders(),
                    params
                });
            })
        );
    }

    createSeance(seance: Seance): Observable<Seance> {
        return this.resolveCoachId().pipe(
            switchMap((coachId) => {
                const payload: Seance = {
                    ...seance,
                    coachId: coachId
                };

                return this.http.post<Seance>(this.apiUrl, payload, {
                    headers: this.getHeaders()
                });
            })
        );
    }

    updateSeance(id: number, seance: Seance): Observable<Seance> {
        return this.resolveCoachId().pipe(
            switchMap((coachId) => {
                const payload: Seance = {
                    ...seance,
                    coachId: coachId
                };

                return this.http.put<Seance>(`${this.apiUrl}/${id}`, payload, {
                    headers: this.getHeaders()
                });
            })
        );
    }

    deleteSeance(id: number): Observable<string> {
        return this.http.delete(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }

    getById(id: number): Observable<Seance> {
        return this.http.get<Seance>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }
}