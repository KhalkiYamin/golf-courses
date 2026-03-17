import { Component, OnInit } from '@angular/core';
import { CoachDashboardService, EvaluationResponse } from 'src/app/services/coach-dashboard.service';

@Component({
    selector: 'app-coach-evaluations',
    templateUrl: './coach-evaluations.component.html',
    styleUrls: ['./coach-evaluations.component.css']
})
export class CoachEvaluationsComponent implements OnInit {

    evaluations: EvaluationResponse[] = [];
    isLoading: boolean = false;
    errorMessage: string = '';

    constructor(private coachDashboardService: CoachDashboardService) { }

    ngOnInit(): void {
        this.loadEvaluations();
    }

    loadEvaluations(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.coachDashboardService.getMyEvaluations().subscribe({
            next: (data: EvaluationResponse[]) => {
                this.evaluations = data || [];
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Erreur chargement évaluations :', error);
                this.errorMessage = 'Impossible de charger les évaluations.';
                this.isLoading = false;
            }
        });
    }
}