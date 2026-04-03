import { Component, OnInit } from '@angular/core';
import {
    AthleteDashboardService
} from 'src/app/services/athlete-dashboard.service';
import { AthleteSeance } from '../../models/athlete-seance.model';

@Component({
    selector: 'app-athlete-sessions',
    templateUrl: './athlete-sessions.component.html',
    styleUrls: ['./athlete-sessions.component.css']
})
export class AthleteSessionsComponent implements OnInit {
    sessions: Array<{ theme: string; date: string; heure: string; coach: string; coachInitials: string }> = [];

    constructor(private athleteDashboardService: AthleteDashboardService) { }

    ngOnInit(): void {
        this.loadSessions();
    }

    get totalSessions(): number {
        return this.sessions.length;
    }

    get uniqueCoachesCount(): number {
        const coachNames = this.sessions
            .map((session) => session.coach)
            .filter((coach) => coach && coach !== 'Coach inconnu');

        return new Set(coachNames).size;
    }

    private loadSessions(): void {
        this.athleteDashboardService.getAthleteSeances().subscribe({
            next: (data: AthleteSeance[]) => {
                this.sessions = (data || []).map((item) => ({
                    coach: item.coachNomComplet || 'Coach inconnu',
                    theme: item.theme || '-',
                    date: item.dateSeance || '-',
                    heure: item.heureSeance || '-',
                    coachInitials: this.getCoachInitials(item.coachNomComplet || 'Coach inconnu')
                }));
            },
            error: (err) => {
                console.error('Erreur chargement séances athlète', err);
                this.sessions = [];
            }
        });
    }

    private getCoachInitials(fullName: string): string {
        if (!fullName || fullName === 'Coach inconnu') {
            return '--';
        }

        const words = fullName
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (!words.length) {
            return '--';
        }

        if (words.length === 1) {
            return words[0].slice(0, 2).toUpperCase();
        }

        return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
}
