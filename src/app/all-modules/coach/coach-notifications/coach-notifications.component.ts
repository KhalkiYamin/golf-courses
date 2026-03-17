import { Component } from '@angular/core';

@Component({
    selector: 'app-coach-notifications',
    templateUrl: './coach-notifications.component.html',
    styleUrls: ['./coach-notifications.component.css']
})
export class CoachNotificationsComponent {
    notifications = [
        { message: 'Nouvel athlète assigné à votre groupe.', date: 'Aujourd\'hui' },
        { message: 'Séance de jeudi confirmée.', date: 'Hier' },
        { message: 'Rappel: compléter les évaluations hebdomadaires.', date: 'Il y a 2 jours' }
    ];
}
