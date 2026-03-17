import { Component } from '@angular/core';

@Component({
    selector: 'app-athlete-profile',
    templateUrl: './athlete-profile.component.html',
    styleUrls: ['./athlete-profile.component.css']
})
export class AthleteProfileComponent {
    profile = {
        nom: 'Youssef Jebali',
        email: 'youssef.athlete@sportacademy.com',
        sport: 'Football',
        niveau: 'Intermediaire',
        telephone: '+216 55 000 000'
    };
}
