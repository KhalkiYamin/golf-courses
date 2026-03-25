import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { Seance } from '../../models/seance.model';
import { CoachPresenceService, PresenceResponse } from 'src/app/services/coach-presence.service';
import { CoachSeancesService } from 'src/app/services/coach-seances.service';
import { ReservationSeanceService } from 'src/app/services/reservation-seance.service';

interface AthletePresence extends PresenceResponse {
    isSaving?: boolean;
}

@Component({
    selector: 'app-coach-presence',
    templateUrl: './coach-presences.component.html',
    styleUrls: ['./coach-presences.component.css']
})
export class CoachPresenceComponent implements OnInit {

    seanceId!: number;
    seances: Seance[] = [];
    selectedSeanceId: number | null = null;
    athletes: AthletePresence[] = [];

    presentsCount = 0;
    absentsCount = 0;
    retardsCount = 0;
    attenteCount = 0;

    isLoading = false;
    errorMessage = '';
    successMessage = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private coachPresenceService: CoachPresenceService,
        private coachSeancesService: CoachSeancesService,
        private reservationSeanceService: ReservationSeanceService
    ) { }

    ngOnInit(): void {
        this.loadSeances();

        combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([paramMap, queryParamMap]) => {
            const routeSeanceId = Number(paramMap.get('seanceId'));
            const querySeanceId = Number(queryParamMap.get('seanceId'));
            const nextSeanceId = routeSeanceId || querySeanceId || 0;

            this.seanceId = nextSeanceId;
            this.selectedSeanceId = nextSeanceId || null;
            this.successMessage = '';

            if (this.seanceId) {
                this.loadPresences();
                return;
            }

            this.athletes = [];
            this.updateStats();
            this.errorMessage = this.seances.length ? '' : 'Aucune séance disponible pour le moment.';
        });
    }

    loadSeances(): void {
        this.coachSeancesService.getMySeances().subscribe({
            next: (data) => {
                this.seances = data;

                if (!this.seanceId && this.seances.length) {
                    const firstSeanceId = this.seances[0].id;

                    if (firstSeanceId) {
                        this.goToSeance(firstSeanceId);
                    }
                    return;
                }

                if (!this.seances.length && !this.seanceId) {
                    this.errorMessage = 'Aucune séance disponible pour le moment.';
                }
            },
            error: (error) => {
                console.error('Erreur chargement séances:', error);
                this.errorMessage = 'Impossible de charger les séances.';
            }
        });
    }

    onSeanceChange(seanceId: number | null): void {
        if (!seanceId) {
            return;
        }

        this.goToSeance(seanceId);
    }

    private goToSeance(seanceId: number): void {
        this.router.navigate(['/dashboard/coach/presences', seanceId]);
    }

    loadPresences(): void {
        if (!this.seanceId) {
            this.errorMessage = 'Veuillez choisir une séance pour afficher les présences.';
            this.successMessage = '';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.coachPresenceService.getPresencesBySeance(this.seanceId).subscribe({
            next: (data) => {
                this.athletes = (data || []).map(a => ({
                    ...a,
                    isSaving: false
                }));

                if (!this.athletes.length) {
                    this.loadAthletesFromReservations();
                    return;
                }

                this.updateStats();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Erreur chargement présences:', error);
                this.errorMessage = 'Impossible de charger les présences.';
                this.isLoading = false;
            }
        });
    }

    private loadAthletesFromReservations(): void {
        this.reservationSeanceService.getReservationsBySeance(this.seanceId).subscribe({
            next: (reservations) => {
                const activeReservations = (reservations || []).filter(r => r.statut !== 'REFUSEE');
                const athleteMap = new Map<number, AthletePresence>();

                activeReservations.forEach((reservation) => {
                    if (!athleteMap.has(reservation.athleteId)) {
                        athleteMap.set(reservation.athleteId, {
                            athleteId: reservation.athleteId,
                            nomComplet: reservation.athleteNomComplet,
                            statut: 'EN_ATTENTE',
                            isSaving: false
                        });
                    }
                });

                this.athletes = Array.from(athleteMap.values());
                this.updateStats();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Erreur chargement réservations:', error);
                this.athletes = [];
                this.updateStats();
                this.isLoading = false;
            }
        });
    }

    setPresenceStatus(athlete: AthletePresence, statut: 'PRESENT' | 'ABSENT' | 'RETARD'): void {
        if (athlete.isSaving) {
            return;
        }

        const oldStatut = athlete.statut;

        athlete.statut = statut;
        athlete.isSaving = true;
        this.updateStats();
        this.successMessage = '';
        this.errorMessage = '';

        this.coachPresenceService.updatePresence(this.seanceId, athlete.athleteId, statut).subscribe({
            next: (response) => {
                athlete.statut = response.statut;
                athlete.isSaving = false;
                this.updateStats();
                this.successMessage = 'Présence mise à jour avec succès.';
            },
            error: (error) => {
                console.error('Erreur mise à jour présence:', error);
                athlete.statut = oldStatut;
                athlete.isSaving = false;
                this.updateStats();
                this.errorMessage = 'Échec de mise à jour de la présence.';
            }
        });
    }

    updateStats(): void {
        this.presentsCount = this.athletes.filter(a => a.statut === 'PRESENT').length;
        this.absentsCount = this.athletes.filter(a => a.statut === 'ABSENT').length;
        this.retardsCount = this.athletes.filter(a => a.statut === 'RETARD').length;
        this.attenteCount = this.athletes.filter(a => a.statut === 'EN_ATTENTE').length;
    }

    getStatusLabel(statut: string): string {
        switch (statut) {
            case 'PRESENT':
                return 'Présent';
            case 'ABSENT':
                return 'Absent';
            case 'RETARD':
                return 'Retard';
            default:
                return 'En attente';
        }
    }

    getInitials(fullName: string): string {
        if (!fullName) {
            return 'AT';
        }

        const parts = fullName.trim().split(' ').filter(Boolean);
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }

        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
}