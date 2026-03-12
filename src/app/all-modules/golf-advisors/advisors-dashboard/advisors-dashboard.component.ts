import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AdminService } from 'src/app/services/admin.service';
import { User } from '../../models/user';
import { DashboardStats } from '../../models/dashboard-stats';

@Component({
  selector: 'app-advisors-dashboard',
  templateUrl: './advisors-dashboard.component.html',
  styleUrls: ['./advisors-dashboard.component.css']
})
export class AdvisorsDashboardComponent implements OnInit {

  pendingCoaches: User[] = [];
  isLoading: boolean = false;
  isDashboardLoading: boolean = false;

  showModal: boolean = false;
  modalAction: 'accept' | 'reject' = 'accept';
  selectedCoach: User | null = null;

  stats: DashboardStats = {
    totalUsers: 0,
    totalAthletes: 0,
    totalCoaches: 0,
    pendingCoaches: 0,
    totalResources: 0,
    totalPayments: 0,
    activityRate: 0,
    activeSubscriptions: 0,
    plannedSessions: 0,
    globalSatisfaction: 0
  };
  constructor(
    private authService: AuthService,
    private router: Router,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.loadPendingCoaches();
    this.loadDashboardStats();
  }

  loadPendingCoaches(): void {
    this.isLoading = true;
    this.adminService.getPendingCoaches().subscribe({
      next: (data: User[]) => {
        this.pendingCoaches = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des coachs en attente', err);
        this.isLoading = false;
      }
    });
  }

  loadDashboardStats(): void {
    this.isDashboardLoading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats = data;
        this.isDashboardLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des statistiques dashboard', err);
        this.isDashboardLoading = false;
      }
    });
  }

  openModal(action: 'accept' | 'reject', coach: User): void {
    this.modalAction = action;
    this.selectedCoach = coach;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCoach = null;
  }

  confirmModal(): void {
    if (!this.selectedCoach) return;

    if (this.modalAction === 'accept') {
      this.adminService.approveCoach(this.selectedCoach.id).subscribe({
        next: () => {
          this.loadPendingCoaches();
          this.loadDashboardStats();
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Erreur lors de la validation', err);
          this.closeModal();
        }
      });
    } else {
      this.adminService.rejectCoach(this.selectedCoach.id).subscribe({
        next: () => {
          this.loadPendingCoaches();
          this.loadDashboardStats();
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Erreur lors du refus', err);
          this.closeModal();
        }
      });
    }
  }
}