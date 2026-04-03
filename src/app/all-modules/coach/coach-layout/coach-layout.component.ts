import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-coach-layout',
    templateUrl: './coach-layout.component.html',
    styleUrls: ['./coach-layout.component.css']
})
export class CoachLayoutComponent {
    searchTerm: string = '';
    showLogoutModal: boolean = false;
    expandedSections: { [key: string]: boolean } = {
        users: true,
        enterprises: false,
        settings: false
    };

    coachProfile = {
        initials: 'SN',
        name: 'Coach Nour',
        specialty: 'Football Coach'
    };

    usersMenuItems = [
        { label: 'Coach Profile', path: '/dashboard/coach/profile' },
        { label: 'Athletes', path: '/dashboard/coach/athletes' }
    ];

    enterprisesMenuItems = [
        { label: 'Sessions', path: '/dashboard/coach/sessions' },
        { label: 'Planning', path: '/dashboard/coach/planning' },
        { label: 'Resources', path: '/dashboard/coach/resources' }
    ];

    settingsMenuItems = [
        { label: 'Presences', path: '/dashboard/coach/presences' },
        { label: 'Evaluations', path: '/dashboard/coach/evaluations' },
        { label: 'Notifications', path: '/dashboard/coach/notifications' }
    ];

    usersMenuPaths = this.usersMenuItems.map((item) => item.path);
    enterprisesMenuPaths = this.enterprisesMenuItems.map((item) => item.path);
    settingsMenuPaths = this.settingsMenuItems.map((item) => item.path);

    constructor(private router: Router) { }

    toggleSection(sectionKey: string): void {
        this.expandedSections[sectionKey] = !this.expandedSections[sectionKey];
    }

    isExpanded(sectionKey: string): boolean {
        return !!this.expandedSections[sectionKey];
    }

    hasActiveRoute(paths: string[]): boolean {
        return paths.some((path) => this.router.isActive(path, {
            paths: 'exact',
            queryParams: 'ignored',
            fragment: 'ignored',
            matrixParams: 'ignored'
        }));
    }

    logout(): void {
        this.showLogoutModal = true;
    }

    cancelLogout(): void {
        this.showLogoutModal = false;
    }

    confirmLogout(): void {
        this.showLogoutModal = false;
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        this.router.navigate(['/pages/login']);
    }
}