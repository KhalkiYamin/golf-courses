import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface AthleteMenuItem {
    label: string;
    path: string;
    icon: string;
}

interface AthleteMenuSection {
    id: string;
    label: string;
    icon: string;
    children: Array<{ label: string; path: string }>;
}

@Component({
    selector: 'app-athlete-layout-shell',
    templateUrl: './athlete-layout.component.html',
    styleUrls: ['./athlete-layout.component.css']
})
export class AthleteShellLayoutComponent {
    menuItems: AthleteMenuItem[] = [
        { label: 'Dashboard', path: '/dashboard/athlete/dashboard', icon: '▦' }
    ];

    menuSections: AthleteMenuSection[] = [
        {
            id: 'athlete',
            label: 'Athlete',
            icon: '◍',
            children: [
                { label: 'Mon profil', path: '/dashboard/athlete/profile' },
                { label: 'Mes seances', path: '/dashboard/athlete/sessions' },
                { label: 'Mon planning', path: '/dashboard/athlete/planning' }
            ]
        },
        {
            id: 'performance',
            label: 'Performance',
            icon: '▣',
            children: [
                { label: 'Ressources', path: '/dashboard/athlete/resources' },
                { label: 'Notifications', path: '/dashboard/athlete/notifications' }
            ]
        }
    ];

    sectionState: Record<string, boolean> = {
        athlete: true,
        performance: true
    };

    constructor(private router: Router) { }

    isSectionOpen(sectionId: string): boolean {
        return !!this.sectionState[sectionId];
    }

    toggleSection(sectionId: string): void {
        this.sectionState[sectionId] = !this.sectionState[sectionId];
    }

    isSectionActive(section: AthleteMenuSection): boolean {
        return section.children.some((child) => this.isPathActive(child.path));
    }

    isPathActive(path: string): boolean {
        return this.router.url === path || this.router.url.startsWith(`${path}/`);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        this.router.navigate(['/pages/login']);
    }
}
