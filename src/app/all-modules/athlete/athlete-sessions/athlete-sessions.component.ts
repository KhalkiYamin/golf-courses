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
    sessions: Array<{ theme: string; date: string; heure: string; coach: string }> = [];

    constructor(private athleteDashboardService: AthleteDashboardService) { }

    ngOnInit(): void {
        this.loadSessions();
    }

    private loadSessions(): void {
        this.athleteDashboardService.getAthleteSeances().subscribe({
            next: (data: AthleteSeance[]) => {
                this.sessions = (data || []).map((item) => ({
                    theme: item.theme || '-',
                    date: item.dateSeance || '-',
                    heure: item.heureSeance || '-',
                    coach: item.coachNomComplet || 'Coach inconnu'
                }));
            },
            error: (err) => {
                console.error('Erreur chargement séances athlète', err);
                this.sessions = [];
            }
        });
    }
}
