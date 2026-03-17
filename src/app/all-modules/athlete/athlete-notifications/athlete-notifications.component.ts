import { Component } from '@angular/core';

@Component({
    selector: 'app-athlete-notifications',
    templateUrl: './athlete-notifications.component.html',
    styleUrls: ['./athlete-notifications.component.css']
})
export class AthleteNotificationsComponent {
    notifications = [
        { message: 'Votre seance de mercredi a ete confirmee.', date: 'Aujourd hui' },
        { message: 'Nouvelle ressource ajoutee par votre coach.', date: 'Hier' },
        { message: 'Mise a jour de votre programme de travail.', date: 'Il y a 2 jours' }
    ];
}
