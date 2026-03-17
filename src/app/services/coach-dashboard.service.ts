import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CoachProfileResponse {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    imageProfil?: string;
    specialite: string;
    experience: number;
    totalAthletes: number;
    note: string;
    forme: string;
    seances: number;
    succes: string;
}

export interface CoachAthleteResponse {
    id: number;
    nomComplet: string;
    sport: string;
    niveau: string;
    statutPresence: string;
}

export interface UpdateCoachProfileRequest {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    experience: number;
}

export interface EvaluationResponse {
    athleteId: number;
    athlete: string;
    technique: number;
    physique: number;
    mental: number;
}
export interface PresenceResponse {
    athleteId: number;
    athlete: string;
    seance: string;
    presence: string;
}

@Injectable({
    providedIn: 'root'
})
export class CoachDashboardService {
    private apiUrl = 'http://localhost:8081/api/coach/dashboard';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', 'Bearer ' + token);
        }

        return headers;
    }

    getCoachProfile(): Observable<CoachProfileResponse> {
        return this.http.get<CoachProfileResponse>(`${this.apiUrl}/profile`, {
            headers: this.getHeaders()
        });
    }

    getMyAthletes(): Observable<CoachAthleteResponse[]> {
        return this.http.get<CoachAthleteResponse[]>(`${this.apiUrl}/my-athletes`, {
            headers: this.getHeaders()
        });
    }

    getMyEvaluations(): Observable<EvaluationResponse[]> {
        return this.http.get<EvaluationResponse[]>(`${this.apiUrl}/my-evaluations`, {
            headers: this.getHeaders()
        });
    }

    uploadCoachPhoto(file: File): Observable<CoachProfileResponse> {
        const formData = new FormData();
        formData.append('image', file);

        return this.http.put<CoachProfileResponse>(`${this.apiUrl}/upload-photo`, formData, {
            headers: this.getHeaders()
        });
    }

    updateCoachProfile(data: UpdateCoachProfileRequest): Observable<CoachProfileResponse> {
        return this.http.put<CoachProfileResponse>(`${this.apiUrl}/update-profile`, data, {
            headers: this.getHeaders()
        });
    }
    getMyPresences(): Observable<PresenceResponse[]> {
        return this.http.get<PresenceResponse[]>(`${this.apiUrl}/my-presences`, {
            headers: this.getHeaders()
        });
    }
}