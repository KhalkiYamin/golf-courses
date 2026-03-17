import { Component } from '@angular/core';

@Component({
    selector: 'app-athlete-resources',
    templateUrl: './athlete-resources.component.html',
    styleUrls: ['./athlete-resources.component.css']
})
export class AthleteResourcesComponent {
    resources = [
        { title: 'Programme recuperation', type: 'PDF', updated: 'Mars 2026' },
        { title: 'Guide nutrition sportive', type: 'DOC', updated: 'Fevrier 2026' },
        { title: 'Videos techniques', type: 'Video', updated: 'Janvier 2026' }
    ];
}
