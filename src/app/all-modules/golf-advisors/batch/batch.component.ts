import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { User } from '../../models/user';


@Component({
  selector: 'app-batch', 
    templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.css']
})
export class BatchComponent implements OnInit {

  pendingCoaches: User[] = [];
  isLoading: boolean = false;

  constructor(
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {
    this.loadPendingCoaches();
  }

  loadPendingCoaches() {
    this.isLoading = true;
    this.adminService.getPendingCoaches().subscribe({
      next: (data) => {
        this.pendingCoaches = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement coachs', err);
        this.isLoading = false;
      }
    });
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
          this.loadPendingCoaches();
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
          this.loadPendingCoaches();
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          this.closeModal();
        }
      });
    }
  }
}