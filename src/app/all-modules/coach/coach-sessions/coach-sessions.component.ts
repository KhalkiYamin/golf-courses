import { Component } from '@angular/core';

@Component({
    selector: 'app-coach-sessions',
    templateUrl: './coach-sessions.component.html',
    styleUrls: ['./coach-sessions.component.css']
})
export class CoachSessionsComponent {
    sessions = [
        { theme: 'Putting', date: '2026-03-17', heure: '09:00', statut: 'Planifiée' },
        { theme: 'Approches', date: '2026-03-18', heure: '11:00', statut: 'Planifiée' },
        { theme: 'Mental game', date: '2026-03-19', heure: '15:00', statut: 'Confirmée' }
    ];
}
