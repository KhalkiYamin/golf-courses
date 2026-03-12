import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
    totalCoachs: number;
    totalAthletes: number;
    totalPayments: number;
    totalResources: number;
    activityRate: number;
    activeSubscriptions: number;
    plannedSessions: number;
    globalSatisfaction: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = 'http://localhost:8081/api/dashboard';

    constructor(private http: HttpClient) { }

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(this.apiUrl);
    }
}