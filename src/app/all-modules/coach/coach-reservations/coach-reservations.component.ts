import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ReservationSeanceService,
    ReservationSeanceDto
} from 'src/app/services/reservation-seance.service';

@Component({
    selector: 'app-coach-reservations',
    templateUrl: './coach-reservations.component.html',
    styleUrls: ['./coach-reservations.component.css']
})
export class CoachReservationsComponent implements OnInit {

    seanceId: number = 0;
    reservations: ReservationSeanceDto[] = [];
    loading = false;
    errorMessage = '';
    successMessage = '';

    processingId: number | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private reservationService: ReservationSeanceService
    ) { }

    ngOnInit(): void {
        this.seanceId = Number(this.route.snapshot.paramMap.get('seanceId') || 0);
        this.loadReservations();
    }

    loadReservations(): void {
        if (!this.seanceId) return;
        this.loading = true;
        this.errorMessage = '';

        this.reservationService.getReservationsBySeance(this.seanceId).subscribe({
            next: (data) => {
                this.reservations = data || [];
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'Impossible de charger les réservations.';
                this.loading = false;
            }
        });
    }

    accepter(reservation: ReservationSeanceDto): void {
        if (!reservation.id) return;
        this.processingId = reservation.id;
        this.successMessage = '';
        this.errorMessage = '';

        this.reservationService.accepterReservation(reservation.id).subscribe({
            next: () => {
                reservation.statut = 'ACCEPTEE';
                this.processingId = null;
                this.successMessage = `Réservation de ${reservation.athleteNomComplet} acceptée.`;
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: () => {
                this.errorMessage = 'Erreur lors de l\'acceptation.';
                this.processingId = null;
            }
        });
    }

    refuser(reservation: ReservationSeanceDto): void {
        if (!reservation.id) return;
        this.processingId = reservation.id;
        this.successMessage = '';
        this.errorMessage = '';

        this.reservationService.refuserReservation(reservation.id).subscribe({
            next: () => {
                reservation.statut = 'REFUSEE';
                this.processingId = null;
                this.successMessage = `Réservation de ${reservation.athleteNomComplet} refusée.`;
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: () => {
                this.errorMessage = 'Erreur lors du refus.';
                this.processingId = null;
            }
        });
    }

    get totalReservations(): number { return this.reservations.length; }
    get pendingCount(): number { return this.reservations.filter(r => r.statut === 'EN_ATTENTE').length; }
    get acceptedCount(): number { return this.reservations.filter(r => r.statut === 'ACCEPTEE').length; }
    get refusedCount(): number { return this.reservations.filter(r => r.statut === 'REFUSEE').length; }

    goBack(): void {
        this.router.navigate(['/dashboard/coach/sessions']);
    }
}
