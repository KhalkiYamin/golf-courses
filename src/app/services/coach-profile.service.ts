import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CoachDiplomaDto {
    id?: number;
    diplome: string;
    ecoleInstitut: string;
    anneeObtention: string;
}

export interface CoachExperienceDto {
    id?: number;
    nomClub: string;
    dateDebut: string;
    dateFin: string;
    poste: string;
}

export interface CoachRewardDto {
    id?: number;
    recompense: string;
    annee: string;
}

export interface CoachProfileDetailsResponse {
    userId?: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    imageProfil: string;

    nomUtilisateur: string;
    genre: string;
    dateNaissance: string;
    biographie: string;

    nomClub: string;
    adresseClub: string;
    clubImage: string;

    adresseLigne1: string;
    adresseLigne2: string;
    ville: string;
    etatProvince: string;
    pays: string;
    codePostal: string;

    services: string[];
    specialisations: string[];

    diplomes: CoachDiplomaDto[];
    experiences: CoachExperienceDto[];
    recompenses: CoachRewardDto[];
}

export interface UpdateCoachProfileDetailsRequest {
    nom: string;
    prenom: string;
    telephone: string;
    imageProfil: string;

    nomUtilisateur: string;
    genre: string;
    dateNaissance: string;
    biographie: string;

    nomClub: string;
    adresseClub: string;
    clubImage: string;

    adresseLigne1: string;
    adresseLigne2: string;
    ville: string;
    etatProvince: string;
    pays: string;
    codePostal: string;

    services: string[];
    specialisations: string[];

    diplomes: CoachDiplomaDto[];
    experiences: CoachExperienceDto[];
    recompenses: CoachRewardDto[];
}

@Injectable({
    providedIn: 'root'
})
export class CoachProfileService {
    private apiUrl = 'http://localhost:8081/api/coach/profile';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', 'Bearer ' + token);
        }

        return headers;
    }

    getMyProfile(): Observable<CoachProfileDetailsResponse> {
        return this.http.get<CoachProfileDetailsResponse>(`${this.apiUrl}/me`, {
            headers: this.getHeaders()
        });
    }

    updateMyProfile(payload: UpdateCoachProfileDetailsRequest): Observable<CoachProfileDetailsResponse> {
        return this.http.put<CoachProfileDetailsResponse>(`${this.apiUrl}/me`, payload, {
            headers: this.getHeaders()
        });
    }
}