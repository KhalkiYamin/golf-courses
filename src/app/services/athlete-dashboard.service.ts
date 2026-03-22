import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AthleteSeance } from '../all-modules/models/athlete-seance.model';

@Injectable({
    providedIn: 'root'
})
export class AthleteDashboardService {

    private apiUrl = 'http://localhost:8081/api/athlete/dashboard';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', 'Bearer ' + token);
        }

        return headers;
    }

    getAthleteSeances(): Observable<AthleteSeance[]> {
        return this.http.get<AthleteSeance[]>(
            `${this.apiUrl}/seances`,
            { headers: this.getHeaders() }
        );
    }
}