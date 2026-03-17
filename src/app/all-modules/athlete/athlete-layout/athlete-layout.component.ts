import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface AthleteMenuItem {
    label: string;
    path: string;
    icon: string;
}

@Component({
    selector: 'app-athlete-layout-shell',
    templateUrl: './athlete-layout.component.html',
    styleUrls: ['./athlete-layout.component.css']
})
export class AthleteShellLayoutComponent {
    athleteProfile = {
        initials: 'YJ',
        name: 'Youssef Jebali',
        level: 'Intermediaire'
    };

    menuItems: AthleteMenuItem[] = [
        { label: 'Dashboard', path: '/dashboard/athlete/dashboard', icon: '🏠' },
        { label: 'Mon Profil', path: '/dashboard/athlete/profile', icon: '👤' },
        { label: 'Mes Seances', path: '/dashboard/athlete/sessions', icon: '📅' },
        { label: 'Ressources', path: '/dashboard/athlete/resources', icon: '🎯' },
        { label: 'Notifications', path: '/dashboard/athlete/notifications', icon: '🔔' }
    ];

    constructor(private router: Router) { }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        this.router.navigate(['/pages/login']);
    }
}
