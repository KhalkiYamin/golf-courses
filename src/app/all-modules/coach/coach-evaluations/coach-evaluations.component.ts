import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
    CoachAthleteResponse,
    CoachDashboardService,
    EvaluationResponse
} from 'src/app/services/coach-dashboard.service';
import {
    EvaluationBridgeService,
    ManagedEvaluation
} from 'src/app/services/evaluation-bridge.service';

type ScoreKey = 'technique' | 'physique' | 'mental' | 'discipline' | 'overallPerformance';
type FocusFilter = 'all' | 'urgent' | 'developing' | 'performing';

interface CoachEvaluationView extends ManagedEvaluation {
    overallPerformance: number;
    coachAction: string;
}

@Component({
    selector: 'app-coach-evaluations',
    templateUrl: './coach-evaluations.component.html',
    styleUrls: ['./coach-evaluations.component.css']
})
export class CoachEvaluationsComponent implements OnInit {

    readonly starOptions = [1, 2, 3, 4, 5];

    evaluations: CoachEvaluationView[] = [];
    selectedAthleteId: number | null = null;
    isLoading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';

    searchTerm: string = '';
    focusFilter: FocusFilter = 'all';

    constructor(
        private coachDashboardService: CoachDashboardService,
        private evaluationBridgeService: EvaluationBridgeService
    ) { }

    ngOnInit(): void {
        this.loadEvaluations();
    }

    loadEvaluations(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        forkJoin({
            athletes: this.coachDashboardService.getMyAthletes(),
            evaluations: this.coachDashboardService.getMyEvaluations().pipe(
                catchError(() => of([] as EvaluationResponse[]))
            )
        }).subscribe({
            next: ({ athletes, evaluations }: { athletes: CoachAthleteResponse[]; evaluations: EvaluationResponse[] }) => {
                const baseEvaluations = this.evaluationBridgeService.buildEvaluations(athletes || [], evaluations || []);
                this.evaluations = baseEvaluations.map((item: ManagedEvaluation) => {
                    const extended = item as ManagedEvaluation & {
                        overallPerformance?: number;
                        coachAction?: string;
                    };

                    return {
                        ...item,
                        overallPerformance: this.evaluationBridgeService.clampScore(extended.overallPerformance || this.evaluationBridgeService.overall(item)),
                        coachAction: extended.coachAction || 'Planifier un point individuel cette semaine avec objectifs mesurables.'
                    };
                });

                this.selectedAthleteId = this.evaluations.length ? this.evaluations[0].athleteId : null;
                this.isLoading = false;
            },
            error: (error: any) => {
                this.errorMessage = 'Impossible de charger les évaluations.';
                this.isLoading = false;
            }
        });
    }

    get selectedEvaluation(): CoachEvaluationView | null {
        if (!this.selectedAthleteId) {
            return null;
        }

        return this.evaluations.find((item: CoachEvaluationView) => item.athleteId === this.selectedAthleteId) || null;
    }

    get filteredEvaluations(): CoachEvaluationView[] {
        const term = this.searchTerm.trim().toLowerCase();

        return this.evaluations.filter((item: CoachEvaluationView) => {
            const matchesSearch = !term ||
                item.athleteName.toLowerCase().includes(term) ||
                item.sport.toLowerCase().includes(term) ||
                item.niveau.toLowerCase().includes(term);

            const status = this.getStatus(item);
            const matchesFilter =
                this.focusFilter === 'all' ||
                (this.focusFilter === 'urgent' && status === 'Urgent') ||
                (this.focusFilter === 'developing' && status === 'Developing') ||
                (this.focusFilter === 'performing' && status === 'Performing');

            return matchesSearch && matchesFilter;
        });
    }

    get averageScore(): number {
        if (!this.filteredEvaluations.length) {
            return 0;
        }

        const total = this.filteredEvaluations.reduce((sum: number, item: CoachEvaluationView) => {
            return sum + this.overallScore(item);
        }, 0);

        return Number((total / this.filteredEvaluations.length).toFixed(1));
    }

    get urgentCount(): number {
        return this.filteredEvaluations.filter((item: CoachEvaluationView) => this.getStatus(item) === 'Urgent').length;
    }

    get performingCount(): number {
        return this.filteredEvaluations.filter((item: CoachEvaluationView) => this.getStatus(item) === 'Performing').length;
    }

    get followUpCount(): number {
        return this.filteredEvaluations.filter((item: CoachEvaluationView) => {
            return !item.feedback || item.feedback.trim().length < 20;
        }).length;
    }

    get urgentLane(): CoachEvaluationView[] {
        return this.filteredEvaluations.filter((item: CoachEvaluationView) => this.getStatus(item) === 'Urgent');
    }

    get developingLane(): CoachEvaluationView[] {
        return this.filteredEvaluations.filter((item: CoachEvaluationView) => this.getStatus(item) === 'Developing');
    }

    get performingLane(): CoachEvaluationView[] {
        return this.filteredEvaluations.filter((item: CoachEvaluationView) => this.getStatus(item) === 'Performing');
    }

    selectEvaluation(athleteId: number): void {
        this.selectedAthleteId = athleteId;
        this.successMessage = '';
    }

    setScore(evaluation: CoachEvaluationView, key: ScoreKey, value: number | string): void {
        evaluation[key] = this.evaluationBridgeService.clampScore(Number(value || 0));
    }

    setStarRating(evaluation: CoachEvaluationView, key: ScoreKey, star: number): void {
        this.setScore(evaluation, key, star * 2);
    }

    isStarFilled(score: number, star: number): boolean {
        return star <= this.starCount(score);
    }

    starCount(score: number): number {
        const count = Math.round(this.evaluationBridgeService.clampScore(score) / 2);
        return Math.max(1, Math.min(5, count));
    }

    setFocusFilter(filter: FocusFilter): void {
        this.focusFilter = filter;
    }

    selectNextAthlete(): void {
        if (!this.filteredEvaluations.length) {
            return;
        }

        const currentIndex = this.filteredEvaluations.findIndex((item: CoachEvaluationView) => {
            return item.athleteId === this.selectedAthleteId;
        });

        const nextIndex = currentIndex < 0 || currentIndex === this.filteredEvaluations.length - 1
            ? 0
            : currentIndex + 1;

        this.selectedAthleteId = this.filteredEvaluations[nextIndex].athleteId;
        this.successMessage = '';
    }

    saveEvaluation(): void {
        const evaluation = this.selectedEvaluation;
        if (!evaluation) {
            return;
        }

        const refreshed = this.evaluationBridgeService.refreshUpdatedAt(evaluation) as CoachEvaluationView;
        this.evaluations = this.evaluations.map((item: CoachEvaluationView) => {
            return item.athleteId === refreshed.athleteId ? refreshed : item;
        });

        this.evaluationBridgeService.saveAll(this.evaluations as ManagedEvaluation[]);
        this.successMessage = `Evaluation de ${refreshed.athleteName} enregistree.`;
    }

    resetEvaluation(): void {
        const evaluation = this.selectedEvaluation;
        if (!evaluation) {
            return;
        }

        evaluation.technique = 6;
        evaluation.physique = 6;
        evaluation.mental = 6;
        evaluation.discipline = 6;
        evaluation.overallPerformance = 6;
        evaluation.feedback = 'Ajuster le volume d entrainement, renforcer la regularite et conserver une execution propre.';
        evaluation.coachAction = 'Planifier un point individuel cette semaine avec objectifs mesurables.';
        evaluation.updatedAt = new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        this.evaluationBridgeService.saveAll(this.evaluations as ManagedEvaluation[]);
        this.successMessage = `Evaluation de ${evaluation.athleteName} reinitialisee.`;
    }

    overallScore(evaluation: CoachEvaluationView): number {
        const criteriaAverage = this.evaluationBridgeService.overall(evaluation);
        return Number(((criteriaAverage * 0.75) + (evaluation.overallPerformance * 0.25)).toFixed(1));
    }

    scoreWidth(score: number): number {
        return this.evaluationBridgeService.scoreToPercent(score);
    }

    getStatus(evaluation: CoachEvaluationView): 'Urgent' | 'Developing' | 'Performing' {
        const score = this.overallScore(evaluation);

        if (score >= 8) {
            return 'Performing';
        }

        if (score >= 6) {
            return 'Developing';
        }

        return 'Urgent';
    }

    getStatusClass(evaluation: CoachEvaluationView): string {
        const status = this.getStatus(evaluation);
        if (status === 'Performing') {
            return 'status-performing';
        }

        if (status === 'Developing') {
            return 'status-developing';
        }

        return 'status-urgent';
    }
}