import { Component } from '@angular/core';

@Component({
    selector: 'app-athlete-sessions',
    templateUrl: './athlete-sessions.component.html',
    styleUrls: ['./athlete-sessions.component.css']
})
export class AthleteSessionsComponent {
    sessions = [
        { theme: 'Condition physique', date: '2026-03-17', heure: '08:00', coach: 'Coach Nour' },
        { theme: 'Technique individuelle', date: '2026-03-19', heure: '17:00', coach: 'Coach Sami' },
        { theme: 'Analyse video', date: '2026-03-21', heure: '15:30', coach: 'Coach Nour' }
    ];
}
