import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Seance } from '../../models/seance.model';
import { CoachSeancesService } from 'src/app/services/coach-seances.service';
import {
    CoachDashboardService,
    CoachAthleteResponse
} from 'src/app/services/coach-dashboard.service';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from '../../models/category';
import { RessourceSportifService } from 'src/app/services/ressource-sportif.service';
import { RessourceSportif } from '../../models/ressource-sportif.model';

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
    selectedGroup: string = '';

    loading = false;
    saving = false;
    deletingSessionId: number | null = null;
    successMessage = '';
    errorMessage = '';

    showAddForm = false;

    athletes: CoachAthleteResponse[] = [];
    groupes: string[] = [];
    sports: Category[] = [];
    ressources: RessourceSportif[] = [];
    selectedRessourceIds: number[] = [];

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

    constructor(
        private coachSeancesService: CoachSeancesService,
        private coachDashboardService: CoachDashboardService,
        private categoryService: CategoryService,
        private ressourceSportifService: RessourceSportifService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadSports();
        this.loadSeances();
        this.loadAthletes();
        this.loadRessources();
    }

    loadRessources(): void {
        this.ressourceSportifService.getAll().subscribe({
            next: (data) => {
                this.ressources = (data || []).filter(r => r.disponibilite);
            },
            error: (err) => {
                console.error('Erreur chargement ressources =', err);
            }
        });
    }

    loadSports(): void {
        this.categoryService.getAllCategories().subscribe({
            next: (data) => {
                this.sports = data || [];
            },
            error: (err) => {
                console.error('Erreur chargement sports =', err);
            }
        });
    }

    loadSeances(): void {
        this.loading = true;
        this.errorMessage = '';

        this.coachSeancesService.getMySeances().subscribe({
            next: (data) => {
                this.seances = data || [];
                this.selectedSession = this.seances.length ? this.seances[0] : null;
                this.loading = false;
            },
            error: (err) => {
                console.error('Erreur chargement séances =', err);
                this.errorMessage = 'Erreur lors du chargement des séances';
                this.loading = false;
            }
        });
    }

    loadAthletes(): void {
        this.coachDashboardService.getMyAthletes().subscribe({
            next: (data) => {
                this.athletes = data || [];

                const uniqueGroups = this.athletes
                    .map((athlete: any) => {
                        const sport = athlete?.sport || '';
                        const niveau = athlete?.niveau || '';
                        return sport && niveau ? `${sport} - ${niveau}` : '';
                    })
                    .filter((group: string) => group.trim() !== '');

                this.groupes = [...new Set(uniqueGroups)];
            },
            error: (err) => {
                console.error('Erreur chargement athlètes =', err);
            }
        });
    }

    onGroupChange(groupValue: string): void {
        const group = (groupValue || '').trim();
        if (!group) {
            this.newSeance.niveau = '';
            return;
        }

        const [sportTitleRaw, niveauRaw] = group.split('-').map(value => (value || '').trim());
        const sportTitle = sportTitleRaw || '';
        const niveau = niveauRaw || '';

        this.newSeance.niveau = niveau || this.newSeance.niveau || '';

        if (!this.newSeance.sportId || this.newSeance.sportId <= 0) {
            const matchedSport = this.sports.find(s =>
                (s.title || '').trim().toLowerCase() === sportTitle.toLowerCase()
            );

            if (matchedSport?.id) {
                this.newSeance.sportId = matchedSport.id;
                this.newSeance.sportTitle = matchedSport.title;
            } else {
                this.newSeance.sportTitle = sportTitle;
            }
        }
    }

    onSportChange(sportId: number | string): void {
        const numericSportId = Number(sportId || 0);
        this.newSeance.sportId = numericSportId > 0 ? numericSportId : null;

        const selectedSport = this.sports.find(s => Number(s.id) === numericSportId);
        this.newSeance.sportTitle = selectedSport?.title || null;
    }

    applyFilters(): void {
        this.loading = true;
        this.errorMessage = '';

        this.coachSeancesService.filterMySeances(
            this.selectedStatus,
            this.selectedGroup || undefined,
            this.selectedDate
        ).subscribe({
            next: (data) => {
                this.seances = data || [];
                this.selectedSession = this.seances.length ? this.seances[0] : null;
                this.loading = false;
            },
            error: (err) => {
                console.error('Erreur filtrage séances =', err);
                this.errorMessage = 'Erreur lors du filtrage';
                this.loading = false;
            }
        });
    }

    resetFilters(): void {
        this.selectedStatus = '';
        this.selectedDate = '';
        this.selectedGroup = '';
        this.loadSeances();
    }

    selectSession(session: Seance): void {
        this.selectedSession = session;
    }

    openAddForm(): void {
        this.showAddForm = true;
        this.successMessage = '';
        this.errorMessage = '';
    }

    toggleRessource(id: number): void {
        const idx = this.selectedRessourceIds.indexOf(id);
        if (idx === -1) {
            this.selectedRessourceIds = [...this.selectedRessourceIds, id];
        } else {
            this.selectedRessourceIds = this.selectedRessourceIds.filter(r => r !== id);
        }
    }

    isRessourceSelected(id: number): boolean {
        return this.selectedRessourceIds.includes(id);
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
            !this.newSeance.lieu ||
            !this.newSeance.sportId
        ) {
            this.errorMessage = 'Veuillez remplir les champs obligatoires (sport inclus).';
            return;
        }

        this.successMessage = '';
        this.errorMessage = '';
        this.saving = true;

        const payload: Seance = {
            ...this.newSeance,
            sportId: this.newSeance.sportId,
            niveau: this.newSeance.niveau || this.extractNiveauFromGroup(this.newSeance.groupe),
            heureSeance: this.newSeance.heureSeance?.length === 5
                ? this.newSeance.heureSeance + ':00'
                : this.newSeance.heureSeance,
            ressourceIds: this.selectedRessourceIds.length ? this.selectedRessourceIds : undefined
        };

        this.coachSeancesService.createSeance(payload).subscribe({
            next: () => {
                this.successMessage = 'Séance ajoutée avec succès';
                this.showAddForm = false;
                this.resetForm();
                this.loadSeances();
                this.saving = false;
            },
            error: (err) => {
                console.error('Erreur ajout séance =', err);
                this.errorMessage =
                    err?.error?.message ||
                    err?.error ||
                    'Erreur lors de l’ajout de la séance';
                this.saving = false;
            }
        });
    }

    deleteSession(id?: number): void {
        if (!id || this.deletingSessionId !== null) {
            return;
        }

        const confirmed = window.confirm('Supprimer cette séance ?');
        if (!confirmed) {
            return;
        }

        this.successMessage = '';
        this.errorMessage = '';
        this.deletingSessionId = id;

        this.coachSeancesService.deleteSeance(id).subscribe({
            next: () => {
                this.successMessage = 'Séance supprimée avec succès';
                this.seances = this.seances.filter((session) => session.id !== id);

                if (this.selectedSession?.id === id) {
                    this.selectedSession = this.seances.length ? this.seances[0] : null;
                }

                this.deletingSessionId = null;
                this.loadSeances();
            },
            error: (err) => {
                console.error('Erreur suppression séance =', err);
                this.errorMessage =
                    err?.error?.message ||
                    err?.error ||
                    (err?.status
                        ? `Erreur suppression (HTTP ${err.status})`
                        : 'Erreur lors de la suppression');
                this.deletingSessionId = null;
            }
        });
    }

    goToPresences(sessionId?: number): void {
        if (!sessionId) {
            return;
        }

        this.router.navigate(['/dashboard/coach/presences', sessionId]);
    }

    goToReservations(sessionId?: number): void {
        if (!sessionId) {
            return;
        }

        this.router.navigate(['/dashboard/coach/reservations', sessionId]);
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
            coachId: 0,
            sportId: null,
            sportTitle: null,
            niveau: ''
        };

        this.selectedRessourceIds = [];
        this.saving = false;
    }

    private extractNiveauFromGroup(group?: string): string {
        const groupValue = (group || '').trim();
        if (!groupValue.includes('-')) {
            return '';
        }

        const parts = groupValue.split('-').map(value => (value || '').trim());
        return parts[1] || '';
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