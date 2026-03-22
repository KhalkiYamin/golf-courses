import { Component } from '@angular/core';

@Component({
    selector: 'app-coach-resources',
    templateUrl: './coach-resources.component.html',
    styleUrls: ['./coach-resources.component.css']
})
export class CoachResourcesComponent {
    resources = [
        {
            title: 'Guide technique putting',
            description: 'Document complet pour améliorer la précision, la posture et la lecture des trajectoires.',
            type: 'PDF',
            updatedAt: 'Mars 2026',
            icon: '📄',
            typeClass: 'pdf'
        },
        {
            title: 'Plan de préparation physique',
            description: 'Programme structuré pour renforcer la mobilité, l’endurance et la puissance des athlètes.',
            type: 'DOC',
            updatedAt: 'Février 2026',
            icon: '📝',
            typeClass: 'doc'
        },
        {
            title: 'Vidéos d’analyse swing',
            description: 'Collection vidéo avec démonstrations, corrections techniques et conseils de progression.',
            type: 'Vidéo',
            updatedAt: 'Janvier 2026',
            icon: '🎥',
            typeClass: 'video'
        }
    ];
}