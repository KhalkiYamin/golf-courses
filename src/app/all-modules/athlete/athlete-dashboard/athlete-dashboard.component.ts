import { Component, OnInit } from '@angular/core';
import { AthleteDashboardService } from '../../../services/athlete-dashboard.service';
import { AthleteSeance } from '../../models/athlete-seance.model';

@Component({
    selector: 'app-athlete-dashboard',
    templateUrl: './athlete-dashboard.component.html',
    styleUrls: ['./athlete-dashboard.component.css']
})
export class AthleteDashboardComponent implements OnInit {

    stats = [
        {
            label: 'Séances cette semaine',
            value: 4,
            icon: '📅',
            trend: '+1'
        },
        {
            label: 'Présence',
            value: '95%',
            icon: '✅',
            trend: '+5%'
        },
        {
            label: 'Objectifs atteints',
            value: 7,
            icon: '🎯',
            trend: '+2'
        },
        {
            label: 'Ressources nouvelles',
            value: 3,
            icon: '📘',
            trend: 'Nouveau'
        }
    ];

    nextSessions: AthleteSeance[] = [];
    loading = false;
    errorMessage = '';

    constructor(private athleteDashboardService: AthleteDashboardService) { }

    ngOnInit(): void {
        this.loadAthleteSeances();
    }

    loadAthleteSeances(): void {
        this.loading = true;
        this.errorMessage = '';

        this.athleteDashboardService.getAthleteSeances().subscribe({
            next: (data: AthleteSeance[]) => {
                console.log('Séances athlete:', data);
                this.nextSessions = data;
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Erreur chargement séances athlete', error);
                this.errorMessage = 'Impossible de charger les séances.';
                this.loading = false;
            }
        });
    }

    formatDate(date: string, heure: string): string {
        return `${date} à ${heure}`;
    }

    getSessionIcon(specialite: string): string {
        const s = (specialite || '').toLowerCase();

        if (s.includes('football')) return '⚽';
        if (s.includes('basket')) return '🏀';
        if (s.includes('tennis')) return '🎾';
        if (s.includes('natation')) return '🏊';
        if (s.includes('musculation')) return '💪';
        if (s.includes('préparation physique')) return '🏋️';

        return '🏅';
    }
}