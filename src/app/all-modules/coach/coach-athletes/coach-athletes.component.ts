import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import {
    CoachDashboardService,
    CoachAthleteResponse,
    EvaluationResponse
} from 'src/app/services/coach-dashboard.service';

type ScoreKey = 'technique' | 'physique' | 'mental' | 'discipline';

interface AthleteEvaluationItem {
    id: number;
    nom: string;
    niveau: string;
    sport: string;
    progression: number;
    technique: number;
    physique: number;
    mental: number;
    discipline: number;
    commentaire: string;
    coachInsight: string;
    lastUpdated: string;
}

@Component({
    selector: 'app-coach-athletes',
    templateUrl: './coach-athletes.component.html',
    styleUrls: ['./coach-athletes.component.css']
})
export class CoachAthletesComponent implements OnInit {
    private readonly storageKey = 'coach-athlete-evaluations';

    athletes: AthleteEvaluationItem[] = [];
    selectedAthleteId: number | null = null;

    isLoading = false;
    errorMessage = '';
    successMessage = '';

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
        this.successMessage = '';

        forkJoin({
            athletes: this.coachDashboardService.getMyAthletes(),
            evaluations: this.coachDashboardService.getMyEvaluations().pipe(
                catchError(() => of([] as EvaluationResponse[]))
            )
        }).subscribe({
            next: ({ athletes, evaluations }: { athletes: CoachAthleteResponse[]; evaluations: EvaluationResponse[] }) => {
                const evaluationMap = new Map<number, EvaluationResponse>();
                (evaluations || []).forEach((evaluation: EvaluationResponse) => {
                    evaluationMap.set(evaluation.athleteId, evaluation);
                });

                const persisted = this.readStoredEvaluations();

                this.athletes = (athletes || []).map((athlete: CoachAthleteResponse) => {
                    const apiEvaluation = evaluationMap.get(athlete.id);
                    const stored = persisted[athlete.id] || {};
                    const progression = this.generateProgression(athlete.niveau, athlete.id);

                    return {
                        id: athlete.id,
                        nom: athlete.nomComplet || 'Athlete',
                        niveau: athlete.niveau || '-',
                        sport: athlete.sport || '-',
                        progression,
                        technique: this.resolveScore(stored.technique, apiEvaluation?.technique, progression),
                        physique: this.resolveScore(stored.physique, apiEvaluation?.physique, progression - 5),
                        mental: this.resolveScore(stored.mental, apiEvaluation?.mental, progression - 8),
                        discipline: this.resolveScore(stored.discipline, undefined, progression - 2),
                        commentaire: stored.commentaire || this.buildDefaultComment(athlete, progression),
                        coachInsight: this.buildInsight(athlete, progression),
                        lastUpdated: stored.lastUpdated || this.formatDate(new Date())
                    };
                });

                this.selectedAthleteId = this.athletes.length ? this.athletes[0].id : null;
                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = 'Impossible de charger les athlètes.';
                this.isLoading = false;
            }
        });
    }

    get selectedAthlete(): AthleteEvaluationItem | null {
        if (!this.selectedAthleteId) {
            return null;
        }

        return this.athletes.find((athlete: AthleteEvaluationItem) => athlete.id === this.selectedAthleteId) || null;
    }

    get averageScore(): number {
        if (!this.athletes.length) {
            return 0;
        }

        const total = this.athletes.reduce((sum: number, athlete: AthleteEvaluationItem) => {
            return sum + this.overallScore(athlete);
        }, 0);

        return Number((total / this.athletes.length).toFixed(1));
    }

    get topAthlete(): AthleteEvaluationItem | null {
        if (!this.athletes.length) {
            return null;
        }

        return [...this.athletes].sort((left: AthleteEvaluationItem, right: AthleteEvaluationItem) => {
            return this.overallScore(right) - this.overallScore(left);
        })[0] || null;
    }

    get readyCount(): number {
        return this.athletes.filter((athlete: AthleteEvaluationItem) => this.overallScore(athlete) >= 7.5).length;
    }

    selectAthlete(athleteId: number): void {
        this.selectedAthleteId = athleteId;
        this.successMessage = '';
    }

    setScore(athlete: AthleteEvaluationItem, key: ScoreKey, value: number | string): void {
        athlete[key] = this.clampScore(Number(value || 0));
    }

    overallScore(athlete: AthleteEvaluationItem): number {
        const total = athlete.technique + athlete.physique + athlete.mental + athlete.discipline;
        return Number((total / 4).toFixed(1));
    }

    scoreWidth(score: number): number {
        return this.clampScore(score) * 10;
    }

    getProgressLabel(level: string): string {
        const normalizedLevel = this.normalizeLevel(level);

        if (/(pro|professionnel|professional|elite|expert|avance)/.test(normalizedLevel)) {
            return 'Niveau eleve';
        }

        if (/(intermediaire|intermediate|confirme|advanced)/.test(normalizedLevel)) {
            return 'Niveau moyen';
        }

        if (/(debutant|beginner|junior|initiation|novice)/.test(normalizedLevel)) {
            return 'Niveau debutant';
        }

        return 'Progression standard';
    }

    getProgressBarClass(level: string): string {
        const normalizedLevel = this.normalizeLevel(level);

        if (/(pro|professionnel|professional|elite|expert|avance)/.test(normalizedLevel)) {
            return 'progress-bar-pro';
        }

        if (/(intermediaire|intermediate|confirme|advanced)/.test(normalizedLevel)) {
            return 'progress-bar-intermediate';
        }

        if (/(debutant|beginner|junior|initiation|novice)/.test(normalizedLevel)) {
            return 'progress-bar-beginner';
        }

        return 'progress-bar-standard';
    }

    saveEvaluation(): void {
        const athlete = this.selectedAthlete;
        if (!athlete) {
            return;
        }

        athlete.lastUpdated = this.formatDate(new Date());
        this.writeStoredEvaluations();
        this.successMessage = `Evaluation de ${athlete.nom} mise a jour.`;
    }

    resetEvaluation(): void {
        const athlete = this.selectedAthlete;
        if (!athlete) {
            return;
        }

        const progression = athlete.progression;
        athlete.technique = this.resolveScore(undefined, undefined, progression);
        athlete.physique = this.resolveScore(undefined, undefined, progression - 5);
        athlete.mental = this.resolveScore(undefined, undefined, progression - 8);
        athlete.discipline = this.resolveScore(undefined, undefined, progression - 2);
        athlete.commentaire = this.buildDefaultComment({
            id: athlete.id,
            nomComplet: athlete.nom,
            niveau: athlete.niveau,
            sport: athlete.sport,
            statutPresence: ''
        }, progression);
        athlete.lastUpdated = this.formatDate(new Date());
        this.writeStoredEvaluations();
        this.successMessage = `Evaluation de ${athlete.nom} reinitialisee.`;
    }

    viewProfile(athleteId: number): void {
        this.router.navigate(['/coach/athlete-profile', athleteId]);
    }

    private resolveScore(stored?: number, api?: number, fallback?: number): number {
        if (typeof stored === 'number') {
            return this.clampScore(stored);
        }

        if (typeof api === 'number') {
            return this.clampScore(api);
        }

        return this.clampScore(Math.round(Number(fallback || 6) / 10));
    }

    private clampScore(score: number): number {
        return Math.max(1, Math.min(10, Number(score || 0)));
    }

    private buildDefaultComment(athlete: CoachAthleteResponse, progression: number): string {
        const level = athlete.niveau || 'niveau actuel';
        if (progression >= 75) {
            return `Tres bonne dynamique observee. ${athlete.nomComplet || 'Cet athlete'} montre une execution reguliere et un bon engagement sur le plan ${level}.`;
        }

        if (progression >= 55) {
            return `Progression encourageante. Il faut consolider la regularite technique et maintenir l implication physique sur les prochaines seances.`;
        }

        return `Le potentiel est present mais le cadre de travail doit etre renforce. Priorite a la discipline, au rythme d entrainement et aux fondamentaux.`;
    }

    private buildInsight(athlete: CoachAthleteResponse, progression: number): string {
        if (progression >= 75) {
            return `Profil performant en ${athlete.sport || 'sport'}, pret pour des objectifs plus exigeants.`;
        }

        if (progression >= 55) {
            return `Profil en consolidation avec une marge de progression nette sur la gestion des efforts.`;
        }

        return `Profil a accompagner de pres avec un suivi plus structure sur la constance et la confiance.`;
    }

    private readStoredEvaluations(): { [key: number]: Partial<AthleteEvaluationItem> } {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) {
            return {};
        }

        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }

    private writeStoredEvaluations(): void {
        const payload = this.athletes.reduce((accumulator: { [key: number]: Partial<AthleteEvaluationItem> }, athlete: AthleteEvaluationItem) => {
            accumulator[athlete.id] = {
                technique: athlete.technique,
                physique: athlete.physique,
                mental: athlete.mental,
                discipline: athlete.discipline,
                commentaire: athlete.commentaire,
                lastUpdated: athlete.lastUpdated
            };
            return accumulator;
        }, {});

        localStorage.setItem(this.storageKey, JSON.stringify(payload));
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    private generateProgression(level: string, athleteId: number): number {
        const normalizedLevel = this.normalizeLevel(level);
        const variation = athleteId % 6;

        if (/(pro|professionnel|professional|elite|expert|avance)/.test(normalizedLevel)) {
            return Math.min(100, 88 + variation * 2);
        }

        if (/(intermediaire|intermediate|confirme|advanced)/.test(normalizedLevel)) {
            return Math.min(82, 62 + variation * 3);
        }

        if (/(debutant|débutant|beginner|junior|initiation|novice)/.test(normalizedLevel)) {
            return Math.min(48, 24 + variation * 4);
        }

        return Math.min(70, 45 + variation * 4);
    }

    private normalizeLevel(level: string): string {
        return (level || '')
            .toString()
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
}