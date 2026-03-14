import { Component, OnInit } from '@angular/core';
import { AdminService, CoachFilter } from 'src/app/services/admin.service';
import { User } from '../../models/user';

type CoachAction = 'accept' | 'reject';
type CoachStatus = 'PENDING' | 'APPROVED' | 'REJECTED';


@Component({
  selector: 'app-batch',
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.css']
})
export class BatchComponent implements OnInit {

  allCoaches: User[] = [];
  filteredCoaches: User[] = [];
  isLoading = false;
  isSubmitting = false;
  currentFilter: CoachFilter = 'PENDING';
  errorMessage = '';

  constructor(
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {
    this.loadCoaches();
  }

  loadCoaches(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getCoachesByFilter(this.currentFilter).subscribe({
      next: (data) => {
        this.filteredCoaches = data;
        this.refreshCounts(data);
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement coachs', err);
        this.errorMessage = 'Impossible de charger la liste des coachs pour le moment.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredCoaches = [...this.filteredCoaches];
  }

  setFilter(filter: CoachFilter): void {
    if (this.currentFilter === filter && this.filteredCoaches.length > 0) {
      return;
    }

    this.currentFilter = filter;
    this.loadCoaches();
  }

  get pendingCount(): number {
    return this.allCoaches.filter(c => this.getCoachStatus(c) === 'PENDING').length;
  }

  get approvedCount(): number {
    return this.allCoaches.filter(c => this.getCoachStatus(c) === 'APPROVED').length;
  }

  get rejectedCount(): number {
    return this.allCoaches.filter(c => this.getCoachStatus(c) === 'REJECTED').length;
  }

  get emptyStateMessage(): string {
    if (this.currentFilter === 'PENDING') {
      return 'Aucune demande de validation en attente.';
    }

    if (this.currentFilter === 'APPROVED') {
      return 'Aucun coach validé trouvé.';
    }

    if (this.currentFilter === 'REJECTED') {
      return 'Aucun coach refusé trouvé.';
    }

    return 'Aucun coach trouvé.';
  }

  getSpecialiteTitle(specialite: any): string {
    if (!specialite) return '';
    if (typeof specialite === 'string') return specialite;
    return specialite.title || '';
  }

  getStatusLabel(coach: User): string {
    const status = this.getCoachStatus(coach);

    if (status === 'APPROVED') {
      return 'Validé';
    }

    if (status === 'REJECTED') {
      return 'Refusé';
    }

    return 'En attente';
  }

  getStatusBadgeClass(coach: User): string {
    const status = this.getCoachStatus(coach);

    if (status === 'APPROVED') {
      return 'badge-success';
    }

    if (status === 'REJECTED') {
      return 'badge-danger';
    }

    return 'badge-warning';
  }

  showModal = false;
  modalAction: CoachAction = 'accept';
  selectedCoach: User | null = null;

  openModal(action: CoachAction, coach: User): void {
    this.modalAction = action;
    this.selectedCoach = coach;
    this.showModal = true;
  }

  closeModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.showModal = false;
    this.selectedCoach = null;
  }

  confirmModal(): void {
    if (!this.selectedCoach || this.selectedCoach.id == null || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    if (this.modalAction === 'accept') {
      this.adminService.approveCoach(this.selectedCoach.id).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadCoaches();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          this.closeModal();
        }
      });
    } else {
      this.adminService.rejectCoach(this.selectedCoach.id).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadCoaches();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          this.closeModal();
        }
      });
    }
  }

  getCoachStatus(coach: User): CoachStatus {
    if (coach.enabled === true && coach.adminApproved === true) {
      return 'APPROVED';
    }

    if (coach.enabled === false && coach.adminApproved === true) {
      return 'REJECTED';
    }

    return 'PENDING';
  }

  private refreshCounts(currentData: User[]): void {
    if (this.currentFilter === 'ALL') {
      this.allCoaches = currentData;
      return;
    }

    this.adminService.getAllCoaches().subscribe({
      next: (data) => {
        this.allCoaches = data;
      },
      error: () => {
        this.allCoaches = currentData;
      }
    });
  }
}