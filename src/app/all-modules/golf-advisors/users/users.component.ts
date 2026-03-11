import { Component, OnInit } from '@angular/core';
import { AdminUser } from '../../models/admin-user';
import { AdminUserService } from 'src/app/services/admin-user.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

    users: AdminUser[] = [];
    athletes: AdminUser[] = [];
    coaches: AdminUser[] = [];

    selectedUser: AdminUser | null = null;
    selectedTab: 'ATHLETE' | 'COACH' = 'ATHLETE';

    searchTerm = '';
    coachFilter: 'TOUS' | 'VALIDÉ' | 'EN ATTENTE' = 'TOUS';

    currentPage = 1;
    pageSize = 4;

    showAddModal = false;
    successMessage = '';

    newUser: AdminUser = this.createEmptyUser();

    constructor(private adminUserService: AdminUserService) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    createEmptyUser(): AdminUser {
        return {
            id: 0,
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            role: 'ATHLETE',
            specialite: '',
            sport: '',
            statut: 'VALIDÉ',
            enabled: true
        };
    }

    loadUsers(): void {
        this.adminUserService.getAllUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.refreshLists();
            },
            error: (err) => {
                console.error('Erreur chargement utilisateurs', err);
            }
        });
    }

    refreshLists(): void {
        this.athletes = this.users.filter(u => u.role === 'ATHLETE');
        this.coaches = this.users.filter(u => u.role === 'COACH');
    }

    get pendingCoachesCount(): number {
        return this.coaches.filter(c => this.getUserStatus(c) === 'EN ATTENTE').length;
    }

    get filteredAthletes(): AdminUser[] {
        return this.athletes.filter(user =>
            (`${user.nom} ${user.prenom} ${user.email} ${user.telephone || ''}`)
                .toLowerCase()
                .includes(this.searchTerm.toLowerCase())
        );
    }

    get filteredCoaches(): AdminUser[] {
        return this.coaches.filter(user => {
            const specialiteLabel = this.getSpecialiteLabel(user);

            const searchMatch =
                (`${user.nom} ${user.prenom} ${user.email} ${specialiteLabel} ${user.telephone || ''}`)
                    .toLowerCase()
                    .includes(this.searchTerm.toLowerCase());

            const filterMatch =
                this.coachFilter === 'TOUS' || this.getUserStatus(user) === this.coachFilter;

            return searchMatch && filterMatch;
        });
    }

    get displayedUsers(): AdminUser[] {
        const source =
            this.selectedTab === 'ATHLETE'
                ? this.filteredAthletes
                : this.filteredCoaches;

        const start = (this.currentPage - 1) * this.pageSize;
        return source.slice(start, start + this.pageSize);
    }

    get totalPages(): number {
        const source =
            this.selectedTab === 'ATHLETE'
                ? this.filteredAthletes
                : this.filteredCoaches;

        return Math.ceil(source.length / this.pageSize) || 1;
    }

    selectUser(user: AdminUser): void {
        this.selectedUser = user;
    }

    switchTab(tab: 'ATHLETE' | 'COACH'): void {
        this.selectedTab = tab;
        this.currentPage = 1;
        this.selectedUser = null;
    }

    setCoachFilter(filter: 'TOUS' | 'VALIDÉ' | 'EN ATTENTE'): void {
        this.coachFilter = filter;
        this.currentPage = 1;
    }

    addUser(): void {
        this.newUser = this.createEmptyUser();
        this.showAddModal = true;
    }

    closeModal(): void {
        this.showAddModal = false;
    }

    saveUser(): void {
        const newId =
            this.users.length > 0
                ? Math.max(...this.users.map(u => u.id)) + 1
                : 1;

        const userToAdd: AdminUser = {
            ...this.newUser,
            id: newId,
            statut: this.newUser.role === 'COACH' ? 'EN ATTENTE' : 'VALIDÉ',
            enabled: true,
            specialite: this.newUser.role === 'COACH' ? this.newUser.specialite : null,
            sport: this.newUser.role === 'ATHLETE' ? this.newUser.sport : null
        };

        this.users.unshift(userToAdd);
        this.refreshLists();
        this.showAddModal = false;
        this.successMessage = 'Utilisateur ajouté avec succès';

        setTimeout(() => {
            this.successMessage = '';
        }, 3000);
    }

    confirmDelete(user: AdminUser): void {
        const confirmation = confirm(`هل أنت متأكد من حذف ${user.prenom} ${user.nom} ؟`);
        if (!confirmation) return;

        this.adminUserService.deleteUser(user.id).subscribe({
            next: () => {
                this.successMessage = 'Utilisateur supprimé avec succès';
                this.selectedUser = null;
                this.loadUsers();

                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            },
            error: (err) => {
                console.error('Erreur suppression utilisateur', err);
            }
        });
    }

    validateCoach(user: AdminUser): void {
        this.adminUserService.approveCoach(user.id).subscribe({
            next: () => {
                this.successMessage = `Coach ${user.prenom} validé avec succès`;
                this.loadUsers();

                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            },
            error: (err) => {
                console.error('Erreur validation coach', err);
            }
        });
    }

    getUserStatus(user: AdminUser): string {
        return user.statut || (user.enabled ? 'VALIDÉ' : 'EN ATTENTE');
    }

    getSpecialiteLabel(user: AdminUser): string {
        const specialite: any = user.specialite;

        if (!specialite) return '-';
        if (typeof specialite === 'string') return specialite;

        return specialite?.title || '-';
    }

    goToPage(page: number): void {
        this.currentPage = page;
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }
}