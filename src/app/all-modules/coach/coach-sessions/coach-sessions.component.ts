import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoachSeancesService } from 'src/app/services/coach-seances.service';
import {
    CoachDashboardService,
    CoachAthleteResponse,
    CoachProfileResponse
} from 'src/app/services/coach-dashboard.service';
import { CategoryService } from 'src/app/services/category.service';
import { RessourceSportifService } from 'src/app/services/ressource-sportif.service';
import { Seance } from 'src/app/all-modules/models/seance.model';
import { RessourceSportif } from 'src/app/all-modules/models/ressource-sportif.model';

@Component({
    selector: 'app-coach-sessions',
    templateUrl: './coach-sessions.component.html',
    styleUrls: ['./coach-sessions.component.css']
})
export class CoachSessionsComponent implements OnInit {

    seances: Seance[] = [];
    selectedSession: Seance | null = null;

    athletes: CoachAthleteResponse[] = [];
    sports: any[] = [];
    ressources: RessourceSportif[] = [];

    loading = false;
    saving = false;
    deletingSessionId: number | null = null;

    successMessage = '';
    errorMessage = '';

    selectedStatus = '';
    selectedDate = '';
    selectedGroup = '';

    showAddForm = false;
    showEditForm = false;

    coachSpecialite = '';

    groupOptions: { label: string; sport: string }[] = [];
    allGroups: string[] = [];
    groupes: string[] = [];

    selectedRessourceIds: number[] = [];
    editSelectedRessourceIds: number[] = [];

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
        coachId: 0,
        sportId: null,
        sportTitle: null,
        niveau: ''
    };

    editSeance: Seance = {
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

    constructor(
        private coachSeancesService: CoachSeancesService,
        private coachDashboardService: CoachDashboardService,
        private categoryService: CategoryService,
        private ressourceSportifService: RessourceSportifService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadCoachProfile();
        this.loadRessources();
        this.loadAthletes();
        this.loadSeances();
    }

    loadCoachProfile(): void {
        this.coachDashboardService.getCoachProfile().subscribe({
            next: (profile: CoachProfileResponse) => {
                this.coachSpecialite = profile?.specialite || '';
                this.loadSports();
            },
            error: (err: any) => {
                console.error('Erreur chargement profil coach =', err);
                this.loadSports();
            }
        });
    }

    loadRessources(): void {
        this.ressourceSportifService.getAll(undefined, true).subscribe({
            next: (data: RessourceSportif[]) => {
                this.ressources = (data || []).filter(r => r.disponibilite === true);
            },
            error: (err: any) => {
                console.error('Erreur chargement ressources =', err);
                this.ressources = [];
            }
        });
    }

    loadSports(): void {
        this.categoryService.getAllCategories().subscribe({
            next: (data: any[]) => {
                const allSports = data || [];
                const coachSport = this.normalizeText(this.coachSpecialite);

                if (!coachSport) {
                    this.sports = allSports;
                } else {
                    this.sports = allSports.filter((sport: any) =>
                        this.normalizeText(sport.title) === coachSport
                    );
                }

                if (this.sports.length === 1) {
                    this.newSeance.sportId = this.sports[0].id;
                    this.newSeance.sportTitle = this.sports[0].title;

                    if (!this.editSeance.sportId) {
                        this.editSeance.sportId = this.sports[0].id;
                        this.editSeance.sportTitle = this.sports[0].title;
                    }
                }

                this.refreshGroupsBySelectedSport();
            },
            error: (err: any) => {
                console.error('Erreur chargement sports =', err);
            }
        });
    }

    loadSeances(): void {
        this.loading = true;
        this.errorMessage = '';

        this.coachSeancesService.getMySeances().subscribe({
            next: (data: Seance[]) => {
                this.seances = data || [];
                this.selectedSession = this.seances.length ? this.seances[0] : null;

                if (this.selectedSession?.id) {
                    this.selectSession(this.selectedSession);
                }

                this.loading = false;
            },
            error: (err: any) => {
                console.error('Erreur chargement séances =', err);
                this.errorMessage = 'Erreur lors du chargement des séances';
                this.loading = false;
            }
        });
    }

    loadAthletes(): void {
        this.coachDashboardService.getMyAthletes().subscribe({
            next: (data: CoachAthleteResponse[]) => {
                this.athletes = data || [];

                const options = this.athletes
                    .map((athlete: any) => {
                        const sport = this.extractAthleteSportTitle(athlete);
                        const niveau = (athlete?.niveau || '').toString().trim();
                        const rawGroup = (
                            athlete?.groupe ||
                            athlete?.group ||
                            athlete?.groupName ||
                            athlete?.nomGroupe ||
                            ''
                        ).toString().trim();

                        if (rawGroup) {
                            return { label: rawGroup, sport };
                        }

                        if (sport && niveau) {
                            return { label: `${sport} - ${niveau}`, sport };
                        }

                        if (sport) {
                            return { label: sport, sport };
                        }

                        return null;
                    })
                    .filter((option: { label: string; sport: string } | null): option is { label: string; sport: string } =>
                        !!option?.label
                    );

                const uniqueOptions = options.filter((option, index, array) => {
                    const key = `${this.normalizeText(option.label)}|${this.normalizeText(option.sport)}`;
                    return index === array.findIndex(item =>
                        `${this.normalizeText(item.label)}|${this.normalizeText(item.sport)}` === key
                    );
                });

                this.groupOptions = uniqueOptions;
                this.allGroups = uniqueOptions.map(option => option.label);
                this.refreshGroupsBySelectedSport();
            },
            error: (err: any) => {
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
            const matchedSport = this.sports.find((s: any) =>
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

        const selectedSport = this.sports.find((s: any) => Number(s.id) === numericSportId);
        this.newSeance.sportTitle = selectedSport?.title || null;

        this.newSeance.groupe = '';
        this.newSeance.niveau = '';
        this.refreshGroupsBySelectedSport();
    }

    applyFilters(): void {
        this.loading = true;
        this.errorMessage = '';

        this.coachSeancesService.filterMySeances(
            this.selectedStatus,
            this.selectedGroup || undefined,
            this.selectedDate
        ).subscribe({
            next: (data: Seance[]) => {
                this.seances = data || [];
                this.selectedSession = this.seances.length ? this.seances[0] : null;

                if (this.selectedSession?.id) {
                    this.selectSession(this.selectedSession);
                }

                this.loading = false;
            },
            error: (err: any) => {
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
        if (!session.id) {
            this.selectedSession = session;
            return;
        }

        this.coachSeancesService.getById(session.id).subscribe({
            next: (fullSession: Seance) => {
                console.log('FULL SESSION =', fullSession);
                this.selectedSession = fullSession;
            },
            error: (err: any) => {
                console.error('Erreur chargement détail séance =', err);
                this.selectedSession = session;
            }
        });
    }

    openAddForm(): void {
        this.showAddForm = true;
        this.successMessage = '';
        this.errorMessage = '';

        if (this.sports.length === 1) {
            this.newSeance.sportId = this.sports[0].id;
            this.newSeance.sportTitle = this.sports[0].title;
        }

        this.refreshGroupsBySelectedSport();
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
            next: (created: Seance) => {
                this.successMessage = 'Séance ajoutée avec succès';
                this.showAddForm = false;
                this.resetForm();
                this.saving = false;
                this.loadSeances();

                if (created?.id) {
                    this.selectSession(created);
                }
            },
            error: (err: any) => {
                console.error('Erreur ajout séance =', err);
                this.errorMessage =
                    err?.error?.message ||
                    err?.error ||
                    'Erreur lors de l’ajout de la séance';
                this.saving = false;
            }
        });
    }

    openEditForm(session: Seance): void {
        this.successMessage = '';
        this.errorMessage = '';

        this.editSeance = {
            ...session,
            dateSeance: session.dateSeance || '',
            heureSeance: session.heureSeance
                ? session.heureSeance.toString().substring(0, 5)
                : '',
            groupe: session.groupe || '',
            description: session.description || '',
            duree: session.duree || '',
            objectif: session.objectif || '',
            statut: session.statut || 'Planifiée',
            lieu: session.lieu || '',
            theme: session.theme || '',
            nombreAthletes: session.nombreAthletes || 0,
            coachId: session.coachId || 0,
            sportId: session.sportId || null,
            sportTitle: session.sportTitle || null,
            niveau: session.niveau || this.extractNiveauFromGroup(session.groupe)
        };

        this.editSelectedRessourceIds = session.ressourceIds ? [...session.ressourceIds] : [];

        if (!this.editSeance.sportId && this.editSeance.sportTitle) {
            const matchedSport = this.sports.find((s: any) =>
                this.normalizeText(s.title) === this.normalizeText(this.editSeance.sportTitle || '')
            );
            if (matchedSport?.id) {
                this.editSeance.sportId = matchedSport.id;
                this.editSeance.sportTitle = matchedSport.title;
            }
        }

        this.refreshGroupsForEdit();
        this.showEditForm = true;
    }

    closeEditForm(): void {
        if (this.saving) {
            return;
        }

        this.showEditForm = false;
    }

    onEditSportChange(sportId: number | string): void {
        const numericSportId = Number(sportId || 0);
        this.editSeance.sportId = numericSportId > 0 ? numericSportId : null;

        const selectedSport = this.sports.find((s: any) => Number(s.id) === numericSportId);
        this.editSeance.sportTitle = selectedSport?.title || null;

        this.editSeance.groupe = '';
        this.editSeance.niveau = '';
        this.refreshGroupsForEdit();
    }

    onEditGroupChange(groupValue: string): void {
        const group = (groupValue || '').trim();
        if (!group) {
            this.editSeance.niveau = '';
            return;
        }

        const [sportTitleRaw, niveauRaw] = group.split('-').map(value => (value || '').trim());
        const sportTitle = sportTitleRaw || '';
        const niveau = niveauRaw || '';

        this.editSeance.niveau = niveau || this.editSeance.niveau || '';

        if (!this.editSeance.sportId || this.editSeance.sportId <= 0) {
            const matchedSport = this.sports.find((s: any) =>
                (s.title || '').trim().toLowerCase() === sportTitle.toLowerCase()
            );

            if (matchedSport?.id) {
                this.editSeance.sportId = matchedSport.id;
                this.editSeance.sportTitle = matchedSport.title;
            } else {
                this.editSeance.sportTitle = sportTitle;
            }
        }
    }

    updateSession(): void {
        if (this.saving || !this.editSeance.id) {
            return;
        }

        if (
            !this.editSeance.theme ||
            !this.editSeance.dateSeance ||
            !this.editSeance.heureSeance ||
            !this.editSeance.lieu ||
            !this.editSeance.sportId
        ) {
            this.errorMessage = 'Veuillez remplir les champs obligatoires (sport inclus).';
            return;
        }

        this.saving = true;
        this.successMessage = '';
        this.errorMessage = '';

        const payload: Seance = {
            ...this.editSeance,
            niveau: this.editSeance.niveau || this.extractNiveauFromGroup(this.editSeance.groupe),
            heureSeance: this.editSeance.heureSeance?.length === 5
                ? this.editSeance.heureSeance + ':00'
                : this.editSeance.heureSeance,
            ressourceIds: this.editSelectedRessourceIds.length ? this.editSelectedRessourceIds : undefined
        };

        this.coachSeancesService.updateSeance(this.editSeance.id, payload).subscribe({
            next: (updated: Seance) => {
                this.successMessage = 'Séance modifiée avec succès';
                this.showEditForm = false;
                this.saving = false;
                this.loadSeances();

                if (updated?.id) {
                    this.selectSession(updated);
                }
            },
            error: (err: any) => {
                console.error('Erreur modification séance =', err);
                this.errorMessage =
                    err?.error?.message ||
                    err?.error ||
                    'Erreur lors de la modification de la séance';
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
                    if (this.selectedSession?.id) {
                        this.selectSession(this.selectedSession);
                    }
                }

                this.deletingSessionId = null;
                this.loadSeances();
            },
            error: (err: any) => {
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

    toggleEditRessource(id: number): void {
        const idx = this.editSelectedRessourceIds.indexOf(id);
        if (idx === -1) {
            this.editSelectedRessourceIds = [...this.editSelectedRessourceIds, id];
        } else {
            this.editSelectedRessourceIds = this.editSelectedRessourceIds.filter(r => r !== id);
        }
    }

    isEditRessourceSelected(id: number): boolean {
        return this.editSelectedRessourceIds.includes(id);
    }

    getSelectedSessionRessources(): string[] {
        if (!this.selectedSession?.ressourceIds?.length || !this.ressources?.length) {
            return [];
        }

        return this.ressources
            .filter((r: RessourceSportif) => this.selectedSession?.ressourceIds?.includes(r.id!))
            .map((r: RessourceSportif) => r.nom)
            .filter((nom: string) => !!nom);
    }

    buildSessionGroupLabel(session: Seance | null): string {
        if (!session) {
            return '';
        }

        if (session.groupe && session.groupe.trim()) {
            return session.groupe.trim();
        }

        const sport = (session.sportTitle || '').trim();
        const niveau = (session.niveau || '').trim();

        if (sport && niveau) {
            return `${sport} - ${niveau}`;
        }

        if (niveau) {
            return niveau;
        }

        return '';
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
            sportId: this.sports.length === 1 ? this.sports[0].id : null,
            sportTitle: this.sports.length === 1 ? this.sports[0].title : null,
            niveau: ''
        };

        this.selectedRessourceIds = [];
        this.refreshGroupsBySelectedSport();
    }

    private extractNiveauFromGroup(group?: string | null): string {
        const value = (group || '').trim();
        if (!value || !value.includes('-')) {
            return '';
        }

        return value.split('-')[1]?.trim() || '';
    }

    private extractAthleteSportTitle(athlete: any): string {
        const rawSport = athlete?.sport;

        if (typeof rawSport === 'string') {
            return rawSport.trim();
        }

        if (rawSport && typeof rawSport === 'object') {
            return (rawSport.title || rawSport.nom || '').toString().trim();
        }

        return '';
    }

    private getCurrentSportFilterTitle(): string {
        if (this.newSeance.sportId) {
            const selectedSport = this.sports.find((s: any) => Number(s.id) === Number(this.newSeance.sportId));
            if (selectedSport?.title) {
                return selectedSport.title;
            }
        }

        if (this.sports.length === 1 && this.sports[0].title) {
            return this.sports[0].title;
        }

        return this.coachSpecialite;
    }

    private getCurrentEditSportFilterTitle(): string {
        if (this.editSeance.sportId) {
            const selectedSport = this.sports.find((s: any) => Number(s.id) === Number(this.editSeance.sportId));
            if (selectedSport?.title) {
                return selectedSport.title;
            }
        }

        return this.editSeance.sportTitle || this.coachSpecialite;
    }

    private buildDefaultGroupsForSport(sportTitle: string): string[] {
        const sport = (sportTitle || '').trim();
        if (!sport) {
            return [];
        }

        return [
            `${sport} - DEBUTANT`,
            `${sport} - INTERMEDIAIRE`,
            `${sport} - AVANCE`
        ];
    }

    private refreshGroupsBySelectedSport(): void {
        const currentSportTitle = this.getCurrentSportFilterTitle();
        this.groupes = this.computeGroupsForSport(currentSportTitle);
    }

    private refreshGroupsForEdit(): void {
        const currentSportTitle = this.getCurrentEditSportFilterTitle();
        this.groupes = this.computeGroupsForSport(currentSportTitle);
    }

    private computeGroupsForSport(sportTitle: string): string[] {
        const sportFilter = this.normalizeText(sportTitle);

        if (!sportFilter) {
            return [...this.allGroups];
        }

        const exactMatches = this.groupOptions
            .filter(option => {
                const optionSport = this.normalizeText(option.sport);
                const groupPrefix = this.normalizeText((option.label || '').split(/\s*-\s*/)[0] || '');
                return optionSport === sportFilter || groupPrefix === sportFilter;
            })
            .map(option => option.label);

        if (exactMatches.length > 0) {
            return [...new Set(exactMatches)];
        }

        const fuzzyMatches = this.groupOptions
            .filter(option => {
                const optionSport = this.normalizeText(option.sport);
                if (!optionSport) {
                    return false;
                }
                return optionSport.includes(sportFilter) || sportFilter.includes(optionSport);
            })
            .map(option => option.label);

        if (fuzzyMatches.length > 0) {
            return [...new Set(fuzzyMatches)];
        }

        if (this.allGroups.length > 0) {
            return [...this.allGroups];
        }

        return this.buildDefaultGroupsForSport(sportTitle);
    }

    private normalizeText(value: string | null | undefined): string {
        return (value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();
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