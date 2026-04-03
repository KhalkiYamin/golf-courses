import { Component, OnInit } from '@angular/core';
import { CoachAthleteResponse, CoachDashboardService } from 'src/app/services/coach-dashboard.service';
import { CoachSeancesService } from 'src/app/services/coach-seances.service';
import { Seance } from 'src/app/all-modules/models/seance.model';

@Component({
    selector: 'app-coach-planning',
    templateUrl: './coach-planning.component.html',
    styleUrls: ['./coach-planning.component.css']
})
export class CoachPlanningComponent implements OnInit {
    sessions: Seance[] = [];
    athletes: CoachAthleteResponse[] = [];

    loadingSessions = false;
    loadingAthletes = false;
    errorMessage = '';
    successMessage = '';

    statusFilter = '';
    dateFilter = '';
    searchFilter = '';

    selectedSessionId: number | null = null;
    assignmentMap: { [sessionId: number]: number[] } = {};

    readonly statusOptions = ['Planifiée', 'Confirmée', 'En cours', 'Terminée', 'Annulée'];

    constructor(
        private coachSeancesService: CoachSeancesService,
        private coachDashboardService: CoachDashboardService
    ) { }

    ngOnInit(): void {
        this.loadSessions();
        this.loadAthletes();
    }

    loadSessions(): void {
        this.loadingSessions = true;
        this.errorMessage = '';

        this.coachSeancesService.getMySeances().subscribe({
            next: (data: Seance[]) => {
                this.sessions = (data || []).sort((a: Seance, b: Seance) => {
                    const dateA = this.toDateValue(a);
                    const dateB = this.toDateValue(b);
                    return dateA - dateB;
                });

                this.initializeAssignments();
                this.selectedSessionId = this.sessions.length ? (this.sessions[0].id || null) : null;
                this.loadingSessions = false;
            },
            error: () => {
                this.errorMessage = 'Impossible de charger le planning des séances.';
                this.loadingSessions = false;
            }
        });
    }

    loadAthletes(): void {
        this.loadingAthletes = true;

        this.coachDashboardService.getMyAthletes().subscribe({
            next: (data: CoachAthleteResponse[]) => {
                this.athletes = data || [];
                this.initializeAssignments();
                this.loadingAthletes = false;
            },
            error: () => {
                this.loadingAthletes = false;
                this.errorMessage = this.errorMessage || 'Impossible de charger les athlètes.';
            }
        });
    }

    initializeAssignments(): void {
        this.sessions.forEach((session: Seance) => {
            if (!session.id) {
                return;
            }

            const fallbackCount = Number(session.nombreAthletes || 0);
            const defaultIds = this.athletes.slice(0, fallbackCount).map((athlete: CoachAthleteResponse) => athlete.id);

            if (!this.assignmentMap[session.id]) {
                this.assignmentMap[session.id] = defaultIds;
            }
        });
    }

    get filteredSessions(): Seance[] {
        return this.sessions.filter((session: Seance) => {
            const matchesStatus = !this.statusFilter || session.statut === this.statusFilter;
            const matchesDate = !this.dateFilter || session.dateSeance === this.dateFilter;
            const query = this.searchFilter.toLowerCase().trim();

            const groupLabel = this.resolveGroupLabel(session);
            const matchesSearch = !query ||
                (session.theme || '').toLowerCase().includes(query) ||
                (session.lieu || '').toLowerCase().includes(query) ||
                groupLabel.toLowerCase().includes(query);

            return matchesStatus && matchesDate && matchesSearch;
        });
    }

    get selectedSession(): Seance | null {
        if (!this.selectedSessionId) {
            return null;
        }

        return this.sessions.find((session: Seance) => session.id === this.selectedSessionId) || null;
    }

    get totalSessions(): number {
        return this.sessions.length;
    }

    get todaySessions(): number {
        const today = new Date().toISOString().split('T')[0];
        return this.sessions.filter((session: Seance) => session.dateSeance === today).length;
    }

    get completedSessions(): number {
        return this.sessions.filter((session: Seance) => session.statut === 'Terminée').length;
    }

    get assignedAthletesCount(): number {
        return this.sessions.reduce((sum: number, session: Seance) => {
            if (!session.id) {
                return sum;
            }
            return sum + this.getAssignedIds(session.id).length;
        }, 0);
    }

    getAssignmentRate(session: Seance): number {
        if (!session.id || this.athletes.length === 0) {
            return 0;
        }

        const assigned = this.getAssignedIds(session.id).length;
        return Math.min(100, Math.round((assigned / this.athletes.length) * 100));
    }

    selectSession(session: Seance): void {
        this.selectedSessionId = session.id || null;
        this.successMessage = '';
    }

    toggleAthleteAssignment(sessionId: number, athleteId: number): void {
        if (!sessionId) {
            return;
        }

        const assignedIds = this.getAssignedIds(sessionId);
        const exists = assignedIds.includes(athleteId);

        this.assignmentMap[sessionId] = exists
            ? assignedIds.filter((id: number) => id !== athleteId)
            : [...assignedIds, athleteId];

        this.syncSessionAthleteCount(sessionId);
    }

    isAssigned(sessionId: number, athleteId: number): boolean {
        return this.getAssignedIds(sessionId).includes(athleteId);
    }

    assignTopAvailable(sessionId: number): void {
        if (!sessionId) {
            return;
        }

        const current = this.getAssignedIds(sessionId);
        const available = this.athletes
            .map((athlete: CoachAthleteResponse) => athlete.id)
            .filter((athleteId: number) => !current.includes(athleteId));

        const toAssign = available.slice(0, 3);
        this.assignmentMap[sessionId] = [...current, ...toAssign];
        this.syncSessionAthleteCount(sessionId);

        this.successMessage = 'Assignations rapides appliquées.';
        setTimeout(() => this.successMessage = '', 2500);
    }

    updateSessionStatus(session: Seance, status: string): void {
        session.statut = status;
        this.successMessage = 'Statut de séance mis à jour.';
        setTimeout(() => this.successMessage = '', 2500);
    }

    refreshPlanning(): void {
        this.loadSessions();
        this.loadAthletes();
    }

    resolveGroupLabel(session: Seance): string {
        if (session.groupe && session.groupe.trim()) {
            return session.groupe;
        }

        if (session.sportTitle && session.niveau) {
            return `${session.sportTitle} - ${session.niveau}`;
        }

        return session.sportTitle || '-';
    }

    getStatusClass(status: string): string {
        return (status || '')
            .toLowerCase()
            .replace(/\s+/g, '-');
    }

    getSessionId(session: Seance): number {
        return Number(session.id || 0);
    }

    private getAssignedIds(sessionId: number): number[] {
        return this.assignmentMap[sessionId] || [];
    }

    private syncSessionAthleteCount(sessionId: number): void {
        const session = this.sessions.find((item: Seance) => item.id === sessionId);
        if (!session) {
            return;
        }

        session.nombreAthletes = this.getAssignedIds(sessionId).length;
    }

    private toDateValue(session: Seance): number {
        const rawDate = (session.dateSeance || '').trim();
        const rawTime = (session.heureSeance || '00:00').trim();
        const parsed = new Date(`${rawDate}T${rawTime}`);

        return Number.isNaN(parsed.getTime()) ? Number.MAX_SAFE_INTEGER : parsed.getTime();
    }
}
