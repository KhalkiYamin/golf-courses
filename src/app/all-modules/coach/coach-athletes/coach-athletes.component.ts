import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    CoachDashboardService,
    CoachAthleteResponse
} from 'src/app/services/coach-dashboard.service';

@Component({
    selector: 'app-coach-athletes',
    templateUrl: './coach-athletes.component.html',
    styleUrls: ['./coach-athletes.component.css']
})
export class CoachAthletesComponent implements OnInit {

    athletes: {
        id: number;
        nom: string;
        niveau: string;
        sport: string;
        progression: number;
    }[] = [];

    isLoading = false;
    errorMessage = '';

    constructor(
        private coachDashboardService: CoachDashboardService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadAthletes();
    }

    loadAthletes(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.coachDashboardService.getMyAthletes().subscribe({
            next: (data: CoachAthleteResponse[]) => {
                console.log('Athlètes API:', data);

                this.athletes = (data || []).map((athlete) => ({
                    id: athlete.id,
                    nom: athlete.nomComplet || 'Athlète',
                    niveau: athlete.niveau || '-',
                    sport: athlete.sport || '-',
                    progression: this.generateProgression(athlete.id)
                }));

                console.log('Athlètes affichés:', this.athletes);
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Erreur chargement athlètes :', error);
                this.errorMessage = 'Impossible de charger les athlètes.';
                this.isLoading = false;
            }
        });
    }

    viewProfile(athleteId: number): void {
        this.router.navigate(['/coach/athlete-profile', athleteId]);
    }

    private generateProgression(id: number): number {
        return 40 + (id % 60);
    }
}