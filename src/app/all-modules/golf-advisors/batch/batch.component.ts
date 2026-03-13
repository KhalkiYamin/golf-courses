import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { User } from '../../models/user';


@Component({
  selector: 'app-batch',
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.css']
})
export class BatchComponent implements OnInit {

  allCoaches: User[] = [];
  filteredCoaches: User[] = [];
  isLoading: boolean = false;
  currentFilter: string = 'PENDING';

  constructor(
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {
    this.loadAllCoaches();
  }

  loadAllCoaches() {
    this.isLoading = true;
    this.adminService.getAllCoaches().subscribe({
      next: (data) => {
        this.allCoaches = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement coachs', err);
        this.isLoading = false;
      }
    });
  }
  applyFilter() {
  if (this.currentFilter === 'ALL') {
    this.filteredCoaches = this.allCoaches;
  } else {
    this.filteredCoaches = this.allCoaches.filter(c => this.getCoachStatus(c) === this.currentFilter);
  }
}

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.applyFilter();
  }

get pendingCount(): number {
  return this.allCoaches.filter(c => this.getCoachStatus(c) === 'PENDING').length;
}

get approvedCount(): number {
  return this.allCoaches.filter(c => this.getCoachStatus(c) === 'APPROVED').length;
}

get rejectedCount(): number {
  return 0;
}

  getSpecialiteTitle(specialite: any): string {
    if (!specialite) return '';
    if (typeof specialite === 'string') return specialite;
    return specialite.title || '';
  }

  // Modal logic
  showModal: boolean = false;
  modalAction: 'accept' | 'reject' = 'accept';
  selectedCoach: User | null = null;

  openModal(action: 'accept' | 'reject', coach: User) {
    this.modalAction = action;
    this.selectedCoach = coach;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedCoach = null;
  }

  confirmModal() {
    if (!this.selectedCoach) return;
    if (this.modalAction === 'accept') {
      this.adminService.approveCoach(this.selectedCoach.id).subscribe({
        next: (res) => {
          this.loadAllCoaches();
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          this.closeModal();
        }
      });
    } else {
      this.adminService.rejectCoach(this.selectedCoach.id).subscribe({
        next: (res) => {
          this.loadAllCoaches();
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          this.closeModal();
        }
      });
    }
  }
  // Helper: dériver le statut depuis les champs boolean du backend
getCoachStatus(coach: User): string {
  if (coach.enabled === false) return 'PENDING';
  if (coach.enabled === true) return 'APPROVED';
  return 'UNKNOWN';
}
}