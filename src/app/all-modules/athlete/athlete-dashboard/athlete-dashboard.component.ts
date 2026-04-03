import { Component, OnInit } from '@angular/core';
import { AthleteDashboardService } from '../../../services/athlete-dashboard.service';
import {
    ReservationSeanceDto,
    ReservationSeanceService
} from 'src/app/services/reservation-seance.service';

interface AthletePresenceSummary {
    presenceRate: number;
    presenceLabel: string;
    presentCount: number;
    absentCount: number;
    retardCount: number;
    totalSeances: number;
}

@Component({
    selector: 'app-athlete-dashboard',
    templateUrl: './athlete-dashboard.component.html',
    styleUrls: ['./athlete-dashboard.component.css']
})
export class AthleteDashboardComponent implements OnInit {

    stats = [
        { label: 'Séances disponibles', value: 0, icon: '📅', trend: '' },
        { label: 'Présence', value: '0%', icon: '✅', trend: '' },
        { label: 'Réservations', value: 0, icon: '📝', trend: '' },
        { label: 'Acceptées', value: 0, icon: '🎯', trend: '' }
    ];

    availableSeances: ReservationSeanceDto[] = [];
    myReservations: ReservationSeanceDto[] = [];

    loading = false;
    reservationsLoading = false;
    errorMessage = '';
    successMessage = '';

    toastVisible = false;
    toastType: 'success' | 'error' | 'info' = 'info';
    toastMessage = '';

    showCancelledAlert = false;
    cancelledAlertTitle = 'Séance annulée';
    cancelledAlertMessage = '';

    private toastTimeoutRef: any = null;
    private hasLoadedReservations = false;

    presenceRate = 0;
    presenceLabel = 'Aucune donnée';
    presentCount = 0;
    absentCount = 0;
    retardCount = 0;
    totalPresenceSeances = 0;
    athleteSpecialite = '';

    constructor(
        private athleteDashboardService: AthleteDashboardService,
        private reservationSeanceService: ReservationSeanceService
    ) { }

    ngOnInit(): void {
        this.loadAthleteProfile();
        this.loadAvailableSeances();
        this.loadMyReservations();
        this.loadPresenceSummary();
    }

    loadAthleteProfile(): void {
        this.athleteDashboardService.getAthleteProfile().subscribe({
            next: (profile: any) => {
                const rawSport = profile?.sport;

                if (typeof rawSport === 'string') {
                    this.athleteSpecialite = rawSport.trim();
                    return;
                }

                if (rawSport && typeof rawSport === 'object') {
                    this.athleteSpecialite = (rawSport.title || rawSport.nom || '').toString().trim();
                    return;
                }

                this.athleteSpecialite = '';
            },
            error: () => {
                this.athleteSpecialite = '';
            }
        });
    }

    get availableSeancesToReserve(): ReservationSeanceDto[] {
        return this.availableSeances.filter((session) => this.isAvailableStatus(session.statut));
    }

    loadAvailableSeances(): void {
        this.loading = true;
        this.errorMessage = '';

        this.reservationSeanceService.getSeancesDisponiblesPourAthlete().subscribe({
            next: (data: ReservationSeanceDto[]) => {
                this.availableSeances = data || [];
                this.stats[0].value = this.availableSeancesToReserve.length;
                this.loading = false;
            },
            error: (error: any) => {
                this.errorMessage = error?.error?.message || 'Impossible de charger les séances disponibles.';
                this.loading = false;
            }
        });
    }

    loadMyReservations(): void {
        this.reservationsLoading = true;

        this.reservationSeanceService.getMesReservations().subscribe({
            next: (data: ReservationSeanceDto[]) => {
                const nextReservations = data || [];

                if (this.hasLoadedReservations) {
                    const previousCancelled = new Set(
                        this.myReservations
                            .filter((r) => this.isSessionCancelled(r))
                            .map((r) => this.getSessionIdentity(r))
                    );

                    const newlyCancelled = nextReservations.find(
                        (r) => this.isSessionCancelled(r) && !previousCancelled.has(this.getSessionIdentity(r))
                    );

                    if (newlyCancelled) {
                        this.openCancelledAlert(newlyCancelled);
                    }
                }

                this.myReservations = nextReservations;
                this.stats[2].value = this.myReservations.length;
                this.stats[3].value = this.myReservations.filter(
                    r => this.normalizeStatus(r.statut) === 'ACCEPTEE'
                ).length;
                this.hasLoadedReservations = true;
                this.reservationsLoading = false;
            },
            error: () => {
                this.reservationsLoading = false;
            }
        });
    }

    loadPresenceSummary(): void {
        this.athleteDashboardService.getPresenceSummary().subscribe({
            next: (data: AthletePresenceSummary) => {
                this.presenceRate = data.presenceRate || 0;
                this.presenceLabel = data.presenceLabel || 'Aucune donnée';
                this.presentCount = data.presentCount || 0;
                this.absentCount = data.absentCount || 0;
                this.retardCount = data.retardCount || 0;
                this.totalPresenceSeances = data.totalSeances || 0;

                this.stats[1].value = `${this.presenceRate}%`;
                this.stats[1].trend = this.presenceLabel;
            },
            error: () => { }
        });
    }

    reserverSeance(seanceId: number, coachId: number): void {
        if (!seanceId || seanceId <= 0) {
            this.errorMessage = 'Identifiant de séance invalide.';
            this.showToast('error', this.errorMessage);
            return;
        }

        if (!coachId || coachId <= 0) {
            this.errorMessage = 'Coach invalide.';
            this.showToast('error', this.errorMessage);
            return;
        }

        this.successMessage = '';
        this.errorMessage = '';

        this.reservationSeanceService.reserverSeance(seanceId, coachId).subscribe({
            next: () => {
                this.successMessage = 'Réservation envoyée avec succès.';
                this.showToast('success', this.successMessage);
                this.loadAvailableSeances();
                this.loadMyReservations();
            },
            error: (error: any) => {
                this.errorMessage = error?.error?.message || 'Impossible d’effectuer la réservation.';
                this.showToast('error', this.errorMessage);
                this.loadAvailableSeances();
            }
        });
    }

    getReservationBadgeLabel(statut: string): string {
        switch (this.normalizeStatus(statut)) {
            case 'NON_RESERVEE':
                return 'Disponible';
            case 'EN_ATTENTE':
                return 'En attente';
            case 'ACCEPTEE':
                return 'Acceptée';
            case 'REFUSEE':
                return 'Refusée';
            case 'ANNULEE':
                return 'Annulée';
            default:
                return statut;
        }
    }

    getSeanceId(session: ReservationSeanceDto): number {
        return Number(session.seanceId || session.id || 0);
    }

    getCoachDisplayName(session: ReservationSeanceDto): string {
        return session.coachNomComplet || session.coachNom || session.coachName || 'Coach non défini';
    }

    getPlacesDisplay(session: ReservationSeanceDto): string {
        const count = Number(session.nombreAthletesCoachEtSeance ?? 0);
        return `${count}/20 athlètes`;
    }

    isSessionComplete(session: ReservationSeanceDto): boolean {
        return !!session.complet;
    }

    isSessionCancelled(session: ReservationSeanceDto): boolean {
        return (session.seanceStatut || '')
            .toUpperCase()
            .includes('ANNUL');
    }

    isCancelledLessThan24h(session: ReservationSeanceDto): boolean {
        return !!session.annuleeMoinsDe24h;
    }

    getCancellationMessage(session: ReservationSeanceDto): string {
        if (session.messageAnnulation && session.messageAnnulation.trim()) {
            return session.messageAnnulation;
        }

        return this.isCancelledLessThan24h(session)
            ? 'Annulée moins de 24h avant'
            : 'Cette séance a été annulée';
    }

    private isAvailableStatus(statut: string): boolean {
        const normalized = this.normalizeStatus(statut);
        return normalized === 'NON_RESERVEE' || normalized === 'DISPONIBLE' || normalized === 'ANNULEE';
    }

    private normalizeStatus(statut: string): string {
        return (statut || '')
            .toString()
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/-/g, '_')
            .replace(/É/g, 'E');
    }

    getSessionIcon(theme: string): string {
        const value = (theme || '').toLowerCase();

        if (value.includes('football')) return '⚽';
        if (value.includes('basket')) return '🏀';
        if (value.includes('tennis')) return '🎾';
        if (value.includes('natation')) return '🏊';
        if (value.includes('musculation')) return '💪';

        return '🏅';
    }

    formatDate(date: string, heure: string): string {
        return `${date} à ${heure}`;
    }

    closeCancelledAlert(): void {
        this.showCancelledAlert = false;
    }

    getToastIcon(): string {
        if (this.toastType === 'success') return '✅';
        if (this.toastType === 'error') return '⛔';
        return '🔔';
    }

    private openCancelledAlert(session: ReservationSeanceDto): void {
        const theme = (session.theme || 'Séance').trim();
        const date = (session.dateSeance || '').trim();
        const heure = (session.heureSeance || '').trim();
        const details = date && heure ? ` (${date} à ${heure})` : '';

        this.cancelledAlertMessage = `${theme}${details} a été annulée par le coach.`;
        this.showCancelledAlert = true;
        this.showToast('info', 'Une séance réservée a été annulée.');
    }

    private getSessionIdentity(session: ReservationSeanceDto): string {
        const id = Number(session.id || 0);
        const seanceId = Number(session.seanceId || 0);
        if (id > 0) {
            return `res-${id}`;
        }
        if (seanceId > 0) {
            return `seance-${seanceId}`;
        }
        return `${session.theme || ''}-${session.dateSeance || ''}-${session.heureSeance || ''}`;
    }

    private showToast(type: 'success' | 'error' | 'info', message: string): void {
        this.toastType = type;
        this.toastMessage = message;
        this.toastVisible = true;

        if (this.toastTimeoutRef) {
            clearTimeout(this.toastTimeoutRef);
        }

        this.toastTimeoutRef = setTimeout(() => {
            this.toastVisible = false;
        }, 3200);
    }
}