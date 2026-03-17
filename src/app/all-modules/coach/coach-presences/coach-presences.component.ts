import { Component, OnInit } from '@angular/core';
import { CoachDashboardService, PresenceResponse } from 'src/app/services/coach-dashboard.service';

@Component({
    selector: 'app-coach-presences',
    templateUrl: './coach-presences.component.html',
    styleUrls: ['./coach-presences.component.css']
})
export class CoachPresencesComponent implements OnInit {

    presences: PresenceResponse[] = [];
    isLoading: boolean = false;
    errorMessage: string = '';

    constructor(private coachDashboardService: CoachDashboardService) { }

    ngOnInit(): void {
        this.loadPresences();
    }

    loadPresences(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.coachDashboardService.getMyPresences().subscribe({
            next: (data: PresenceResponse[]) => {
                this.presences = data || [];
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Erreur chargement présences :', error);
                this.errorMessage = 'Impossible de charger les présences.';
                this.isLoading = false;
            }
        });
    }

    getStatusClass(status: string): string {
        const value = (status || '').toLowerCase();

        if (value.includes('présent') || value.includes('present')) {
            return 'status-present';
        }

        if (value.includes('absent')) {
            return 'status-absent';
        }

        return 'status-pending';
    }
}