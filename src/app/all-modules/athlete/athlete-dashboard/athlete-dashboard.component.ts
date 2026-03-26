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
        {
            label: 'Séances disponibles',
            value: 0,
            icon: '📅',
            trend: ''
        },
        {
            label: 'Présence',
            value: '0%',
            icon: '✅',
            trend: ''
        },
        {
            label: 'Réservations',
            value: 0,
            icon: '📝',
            trend: ''
        },
        {
            label: 'Acceptées',
            value: 0,
            icon: '🎯',
            trend: ''
        }
    ];

    availableSeances: ReservationSeanceDto[] = [];
    myReservations: ReservationSeanceDto[] = [];

    loading = false;
    reservationsLoading = false;
    errorMessage = '';
    successMessage = '';

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
            error: (error: any) => {
                console.error('Erreur chargement profil athlete', error);
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
                console.error('Erreur chargement séances disponibles', error);
                this.errorMessage = error?.error?.message || 'Impossible de charger les séances disponibles.';
                this.loading = false;
            }
        });
    }

    loadMyReservations(): void {
        this.reservationsLoading = true;

        this.reservationSeanceService.getMesReservations().subscribe({
            next: (data: ReservationSeanceDto[]) => {
                this.myReservations = data || [];
                this.stats[2].value = this.myReservations.length;
                this.stats[3].value = this.myReservations.filter(r => this.normalizeStatus(r.statut) === 'ACCEPTEE').length;
                this.reservationsLoading = false;
            },
            error: (error: any) => {
                console.error('Erreur chargement réservations', error);
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
            error: (error: any) => {
                console.error('Erreur chargement résumé présence athlete', error);
            }
        });
    }

    reserverSeance(seanceId: number): void {
        if (!seanceId || seanceId <= 0) {
            this.errorMessage = 'Identifiant de séance invalide.';
            return;
        }

        this.successMessage = '';
        this.errorMessage = '';

        this.reservationSeanceService.reserverSeance(seanceId).subscribe({
            next: () => {
                this.successMessage = 'Réservation envoyée avec succès.';
                this.loadAvailableSeances();
                this.loadMyReservations();
            },
            error: (error: any) => {
                console.error('Erreur réservation séance', error);
                this.errorMessage = error?.error?.message || 'Impossible d’effectuer la réservation.';
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
            default:
                return statut;
        }
    }

    getSeanceId(session: ReservationSeanceDto): number {
        return Number(session.seanceId || session.id || 0);
    }

    getCoachDisplayName(session: ReservationSeanceDto): string {
        return session.coachNomComplet || session.coachNom || session.coachName || '';
    }

    private isAvailableStatus(statut: string): boolean {
        const normalized = this.normalizeStatus(statut);
        return normalized === 'NON_RESERVEE' || normalized === 'DISPONIBLE';
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
}