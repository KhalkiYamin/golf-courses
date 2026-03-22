import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Seance } from '../all-modules/models/seance.model';

@Injectable({
    providedIn: 'root'
})
export class CoachSeancesService {

    private apiUrl = 'http://localhost:8081/api/seances';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', 'Bearer ' + token);
        }

        return headers;
    }

    getMySeances(): Observable<Seance[]> {
        return this.http.get<Seance[]>(`${this.apiUrl}/my-seances`, {
            headers: this.getHeaders()
        });
    }

    filterMySeances(statut?: string, groupe?: string, dateSeance?: string): Observable<Seance[]> {
        let params = new HttpParams();

        if (statut) {
            params = params.set('statut', statut);
        }

        if (groupe) {
            params = params.set('groupe', groupe);
        }

        if (dateSeance) {
            params = params.set('dateSeance', dateSeance);
        }

        return this.http.get<Seance[]>(`${this.apiUrl}/my-seances/filter`, {
            headers: this.getHeaders(),
            params
        });
    }

    createSeance(seance: Seance): Observable<Seance> {
        return this.http.post<Seance>(this.apiUrl, seance, {
            headers: this.getHeaders()
        });
    }

    assignAthleteToSeance(seanceId: number, athleteId: number): Observable<string> {
        return this.http.put(
            `${this.apiUrl}/${seanceId}/assign-athlete/${athleteId}`,
            {},
            {
                headers: this.getHeaders(),
                responseType: 'text'
            }
        );
    }

    updateSeance(id: number, seance: Seance): Observable<Seance> {
        return this.http.put<Seance>(`${this.apiUrl}/${id}`, seance, {
            headers: this.getHeaders()
        });
    }

    deleteSeance(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    getById(id: number): Observable<Seance> {
        return this.http.get<Seance>(`${this.apiUrl}/details/${id}`, {
            headers: this.getHeaders()
        });
    }
}