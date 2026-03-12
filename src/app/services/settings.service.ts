import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Settings, ChangePasswordRequest } from '../all-modules/models/settings.model';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private apiUrl = 'http://localhost:8081/api/settings';

    constructor(private http: HttpClient) { }

    getSettings(): Observable<Settings> {
        return this.http.get<Settings>(this.apiUrl);
    }

    updateAcademy(settings: Settings): Observable<Settings> {
        return this.http.put<Settings>(`${this.apiUrl}/academy`, settings);
    }

    updateInscription(settings: Settings): Observable<Settings> {
        return this.http.put<Settings>(`${this.apiUrl}/inscription`, settings);
    }

    updateSession(settings: Settings): Observable<Settings> {
        return this.http.put<Settings>(`${this.apiUrl}/security/session`, settings);
    }

    changePassword(data: ChangePasswordRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/security/password`, data, {
            responseType: 'text'
        });
    }
}