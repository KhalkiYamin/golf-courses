import { Component } from '@angular/core';

@Component({
    selector: 'app-athlete-dashboard',
    templateUrl: './athlete-dashboard.component.html',
    styleUrls: ['./athlete-dashboard.component.css']
})
export class AthleteDashboardComponent {
    stats = [
        { label: 'Seances cette semaine', value: 4 },
        { label: 'Presence', value: '95%' },
        { label: 'Objectifs atteints', value: 7 },
        { label: 'Ressources nouvelles', value: 3 }
    ];

    nextSessions = [
        { title: 'Condition physique', date: 'Lundi 08:00', coach: 'Coach Nour' },
        { title: 'Technique individuelle', date: 'Mercredi 17:00', coach: 'Coach Sami' },
        { title: 'Analyse video', date: 'Vendredi 15:30', coach: 'Coach Nour' }
    ];
}
