import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RessourceSportif } from '../all-modules/models/ressource-sportif.model';

@Injectable({
    providedIn: 'root'
})
export class RessourceSportifService {

    private apiUrl = 'http://localhost:8081/api/ressources-sportives';

    constructor(private http: HttpClient) { }

    getAll(search?: string, disponibilite?: boolean): Observable<RessourceSportif[]> {
        let params = new HttpParams();

        if (search && search.trim()) {
            params = params.set('search', search.trim());
        }

        if (disponibilite !== undefined) {
            params = params.set('disponibilite', disponibilite);
        }

        return this.http.get<RessourceSportif[]>(this.apiUrl, { params });
    }

    create(data: RessourceSportif): Observable<RessourceSportif> {
        return this.http.post<RessourceSportif>(this.apiUrl, data);
    }

    update(id: number, data: RessourceSportif): Observable<RessourceSportif> {
        return this.http.put<RessourceSportif>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
    }
}