import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-coach-layout',
    templateUrl: './coach-layout.component.html',
    styleUrls: ['./coach-layout.component.css']
})
export class CoachLayoutComponent {
    searchTerm: string = '';

    coachProfile = {
        initials: 'SN',
        name: 'Coach Nour',
        specialty: 'Football Coach'
    };

    menuItems = [
        { label: 'Dashboard', icon: '🏠', path: '/dashboard/coach/dashboard' },
        { label: 'Profil', icon: '👤', path: '/dashboard/coach/profile' },
        { label: 'Athlètes', icon: '🏃', path: '/dashboard/coach/athletes' },
        { label: 'Séances', icon: '📅', path: '/dashboard/coach/sessions' },
        { label: 'Présences', icon: '✅', path: '/dashboard/coach/presences' },
        { label: 'Évaluations', icon: '📊', path: '/dashboard/coach/evaluations' },
        { label: 'Notifications', icon: '🔔', path: '/dashboard/coach/notifications' },
        { label: 'Ressources', icon: '🎯', path: '/dashboard/coach/resources' }
    ];

    constructor(private router: Router) { }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        this.router.navigate(['/pages/login']);
    }
}