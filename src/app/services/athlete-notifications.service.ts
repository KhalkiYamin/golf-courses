import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationItem {
    id: number;
    title: string;
    message: string;
    time: string;
    type: 'session' | 'resource' | 'program' | 'message' | 'payment';
    read: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AthleteNotificationsService {

    private apiUrl = 'http://localhost:8081/api/notifications';

    constructor(private http: HttpClient) { }

    getNotifications(): Observable<NotificationItem[]> {
        return this.http.get<NotificationItem[]>(this.apiUrl);
    }
}