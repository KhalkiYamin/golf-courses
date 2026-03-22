import { Component, OnInit } from '@angular/core';
import { Seance } from '../../models/seance.model';
import { CoachSeancesService } from 'src/app/services/coach-seances.service';
import {
    CoachDashboardService,
    CoachAthleteResponse
} from 'src/app/services/coach-dashboard.service';

@Component({
    selector: 'app-coach-sessions',
    templateUrl: './coach-sessions.component.html',
    styleUrls: ['./coach-sessions.component.css']
})
export class CoachSessionsComponent implements OnInit {

    seances: Seance[] = [];
    selectedSession: Seance | null = null;

    selectedStatus: string = '';
    selectedDate: string = '';

    loading = false;
    saving = false;
    successMessage = '';
    errorMessage = '';

    showAddForm = false;

    athletes: CoachAthleteResponse[] = [];
    selectedAthleteId: number | null = null;

    newSeance: Seance = {
        theme: '',
        description: '',
        dateSeance: '',
        heureSeance: '',
        lieu: '',
        nombreAthletes: 0,
        statut: 'Planifiée',
        duree: '',
        objectif: '',
        coachId: 0
    };

    constructor(
        private coachSeancesService: CoachSeancesService,
        private coachDashboardService: CoachDashboardService
    ) { }

    ngOnInit(): void {
        this.loadSeances();
        this.loadAthletes();
    }

    loadSeances(): void {
        this.loading = true;
        this.errorMessage = '';

        this.coachSeancesService.getMySeances().subscribe({
            next: (data) => {
                this.seances = data;
                this.selectedSession = this.seances.length ? this.seances[0] : null;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.errorMessage = 'Erreur lors du chargement des séances';
                this.loading = false;
            }
        });
    }

    loadAthletes(): void {
        this.coachDashboardService.getMyAthletes().subscribe({
            next: (data) => {
                this.athletes = data;
            },
            error: (err) => {
                console.error('Erreur chargement athlètes =', err);
            }
        });
    }

    applyFilters(): void {
        this.loading = true;
        this.errorMessage = '';

        this.coachSeancesService.filterMySeances(
            this.selectedStatus,
            undefined,
            this.selectedDate
        ).subscribe({
            next: (data) => {
                this.seances = data;
                this.selectedSession = this.seances.length ? this.seances[0] : null;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.errorMessage = 'Erreur lors du filtrage';
                this.loading = false;
            }
        });
    }

    selectSession(session: Seance): void {
        this.selectedSession = session;
    }

    openAddForm(): void {
        this.showAddForm = true;
        this.successMessage = '';
        this.errorMessage = '';
    }

    closeAddForm(): void {
        if (this.saving) {
            return;
        }

        this.showAddForm = false;
        this.resetForm();
    }

    saveSeance(): void {
        if (this.saving) {
            return;
        }

        if (
            !this.newSeance.theme ||
            !this.newSeance.dateSeance ||
            !this.newSeance.heureSeance ||
            !this.newSeance.lieu
        ) {
            this.errorMessage = 'Veuillez remplir les champs obligatoires';
            return;
        }

        if (!this.selectedAthleteId) {
            this.errorMessage = 'Veuillez sélectionner un athlète';
            return;
        }

        this.successMessage = '';
        this.errorMessage = '';
        this.saving = true;

        const payload: Seance = {
            ...this.newSeance,
            heureSeance: this.newSeance.heureSeance.length === 5
                ? this.newSeance.heureSeance + ':00'
                : this.newSeance.heureSeance
        };

        this.coachSeancesService.createSeance(payload).subscribe({
            next: (res) => {
                const seanceId = res?.id;
                const athleteId = this.selectedAthleteId;

                console.log('seanceId =', seanceId);
                console.log('athleteId =', athleteId);

                if (!seanceId) {
                    this.errorMessage = 'Séance créée mais id introuvable';
                    this.saving = false;
                    return;
                }

                if (!athleteId) {
                    this.errorMessage = 'Veuillez sélectionner un athlète';
                    this.saving = false;
                    return;
                }

                this.coachSeancesService.assignAthleteToSeance(seanceId, athleteId).subscribe({
                    next: () => {
                        this.successMessage = 'Séance ajoutée et affectée avec succès';
                        this.showAddForm = false;
                        this.resetForm();
                        this.loadSeances();
                        this.saving = false;
                    },
                    error: (err) => {
                        console.error('Erreur affectation athlete =', err);
                        this.errorMessage = 'Séance créée, mais erreur lors de l’affectation de l’athlète';
                        this.saving = false;
                    }
                });
            },
            error: (err) => {
                console.error('erreur ajout séance =', err);
                this.errorMessage =
                    err?.error?.message ||
                    err?.error ||
                    'Erreur lors de l’ajout de la séance';
                this.saving = false;
            }
        });
    }

    deleteSession(id?: number): void {
        if (!id) return;

        const confirmed = window.confirm('Supprimer cette séance ?');
        if (!confirmed) return;

        this.coachSeancesService.deleteSeance(id).subscribe({
            next: () => {
                this.successMessage = 'Séance supprimée avec succès';
                this.loadSeances();
            },
            error: (err) => {
                console.error(err);
                this.errorMessage = 'Erreur lors de la suppression';
            }
        });
    }

    resetForm(): void {
        this.newSeance = {
            theme: '',
            description: '',
            dateSeance: '',
            heureSeance: '',
            lieu: '',
            nombreAthletes: 0,
            statut: 'Planifiée',
            duree: '',
            objectif: '',
            coachId: 0
        };

        this.selectedAthleteId = null;
        this.saving = false;
    }

    get nextSession(): Seance | null {
        return this.seances.length ? this.seances[0] : null;
    }

    get totalSessions(): number {
        return this.seances.length;
    }

    get completedSessions(): number {
        return this.seances.filter(s => s.statut === 'Terminée').length;
    }

    get todaySessions(): number {
        const today = new Date().toISOString().split('T')[0];
        return this.seances.filter(s => s.dateSeance === today).length;
    }

    get totalAthletes(): number {
        return this.seances.reduce((sum, s) => sum + (s.nombreAthletes || 0), 0);
    }
}