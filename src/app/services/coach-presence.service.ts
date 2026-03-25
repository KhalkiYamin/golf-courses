import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PresenceResponse {
    athleteId: number;
    nomComplet: string;
    statut: 'PRESENT' | 'ABSENT' | 'RETARD' | 'EN_ATTENTE';
}

export interface PresenceRequest {
    statut: string;
}

@Injectable({
    providedIn: 'root'
})
export class CoachPresenceService {

    private apiUrl = 'http://localhost:8081/api/presences';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        });
    }

    getPresencesBySeance(seanceId: number): Observable<PresenceResponse[]> {
        return this.http.get<PresenceResponse[]>(
            `${this.apiUrl}/seance/${seanceId}`,
            { headers: this.getHeaders() }
        );
    }

    updatePresence(seanceId: number, athleteId: number, statut: string): Observable<PresenceResponse> {
        return this.http.put<PresenceResponse>(
            `${this.apiUrl}/seance/${seanceId}/athlete/${athleteId}`,
            { statut },
            { headers: this.getHeaders() }
        );
    }
}