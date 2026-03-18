import { Component, OnInit } from '@angular/core';
import { Seance } from '../../models/seance.model';
import { CoachSeancesService } from 'src/app/services/coach-seances.service';

@Component({
    selector: 'app-coach-sessions',
    templateUrl: './coach-sessions.component.html',
    styleUrls: ['./coach-sessions.component.css']
})
export class CoachSessionsComponent implements OnInit {

    seances: Seance[] = [];
    selectedSession: Seance | null = null;

    selectedStatus: string = '';
    selectedGroup: string = '';
    selectedDate: string = '';

    loading = false;
    successMessage = '';
    errorMessage = '';

    showAddForm = false;

    newSeance: Seance = {
        theme: '',
        description: '',
        dateSeance: '',
        heureSeance: '',
        groupe: '',
        lieu: '',
        nombreAthletes: 0,
        statut: 'Planifiée',
        duree: '',
        objectif: '',
        coachId: 0
    };

    constructor(private coachSeancesService: CoachSeancesService) { }

    ngOnInit(): void {
        this.loadSeances();
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

    applyFilters(): void {
        this.loading = true;
        this.errorMessage = '';

        this.coachSeancesService.filterMySeances(
            this.selectedStatus,
            this.selectedGroup,
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
        this.showAddForm = false;
        this.resetForm();
    }

    saveSeance(): void {
        console.log('saveSeance clicked');
        console.log('newSeance =', this.newSeance);

        if (
            !this.newSeance.theme ||
            !this.newSeance.dateSeance ||
            !this.newSeance.heureSeance ||
            !this.newSeance.groupe ||
            !this.newSeance.lieu
        ) {
            this.errorMessage = 'Veuillez remplir les champs obligatoires';
            return;
        }

        this.successMessage = '';
        this.errorMessage = '';

        const payload: Seance = {
            ...this.newSeance,
            heureSeance: this.newSeance.heureSeance.length === 5
                ? this.newSeance.heureSeance + ':00'
                : this.newSeance.heureSeance
        };

        console.log('payload envoyé =', payload);

        this.coachSeancesService.createSeance(payload).subscribe({
            next: (res) => {
                console.log('séance créée =', res);
                this.successMessage = 'Séance ajoutée avec succès';
                this.showAddForm = false;
                this.resetForm();
                this.loadSeances();
            },
            error: (err) => {
                console.error('erreur ajout séance =', err);
                this.errorMessage =
                    err?.error?.message ||
                    err?.error ||
                    'Erreur lors de l’ajout de la séance';
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
            groupe: '',
            lieu: '',
            nombreAthletes: 0,
            statut: 'Planifiée',
            duree: '',
            objectif: '',
            coachId: 0
        };
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