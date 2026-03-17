import { Component } from '@angular/core';

@Component({
    selector: 'app-coach-resources',
    templateUrl: './coach-resources.component.html',
    styleUrls: ['./coach-resources.component.css']
})
export class CoachResourcesComponent {
    resources = [
        { title: 'Guide technique putting', type: 'PDF', updated: 'Mars 2026' },
        { title: 'Plan de préparation physique', type: 'DOC', updated: 'Février 2026' },
        { title: 'Vidéos d\'analyse swing', type: 'Vidéo', updated: 'Janvier 2026' }
    ];
}
