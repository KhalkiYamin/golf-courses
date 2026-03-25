import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CoachRoutingModule } from './coach-routing.module';
import { CoachLayoutComponent } from './coach-layout/coach-layout.component';
import { CoachDashboardComponent } from './coach-dashboard/coach-dashboard.component';
import { CoachProfileComponent } from './coach-profile/coach-profile.component';
import { CoachAthletesComponent } from './coach-athletes/coach-athletes.component';
import { CoachSessionsComponent } from './coach-sessions/coach-sessions.component';
import { CoachPresenceComponent } from './coach-presences/coach-presences.component';
import { CoachEvaluationsComponent } from './coach-evaluations/coach-evaluations.component';
import { CoachNotificationsComponent } from './coach-notifications/coach-notifications.component';
import { CoachResourcesComponent } from './coach-resources/coach-resources.component';
import { CoachReservationsComponent } from './coach-reservations/coach-reservations.component';

@NgModule({
    declarations: [
        CoachLayoutComponent,
        CoachDashboardComponent,
        CoachProfileComponent,
        CoachAthletesComponent,
        CoachSessionsComponent,
        CoachPresenceComponent,
        CoachEvaluationsComponent,
        CoachNotificationsComponent,
        CoachResourcesComponent,
        CoachReservationsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CoachRoutingModule
    ]
})
export class CoachModule { }
