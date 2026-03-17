import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CoachLayoutComponent } from './coach-layout/coach-layout.component';
import { CoachDashboardComponent } from './coach-dashboard/coach-dashboard.component';
import { CoachProfileComponent } from './coach-profile/coach-profile.component';
import { CoachAthletesComponent } from './coach-athletes/coach-athletes.component';
import { CoachSessionsComponent } from './coach-sessions/coach-sessions.component';
import { CoachPresencesComponent } from './coach-presences/coach-presences.component';
import { CoachEvaluationsComponent } from './coach-evaluations/coach-evaluations.component';
import { CoachNotificationsComponent } from './coach-notifications/coach-notifications.component';
import { CoachResourcesComponent } from './coach-resources/coach-resources.component';

const routes: Routes = [
    {
        path: '',
        component: CoachLayoutComponent,
        children: [
            { path: 'dashboard', component: CoachDashboardComponent },
            { path: 'profile', component: CoachProfileComponent },
            { path: 'athletes', component: CoachAthletesComponent },
            { path: 'sessions', component: CoachSessionsComponent },
            { path: 'presences', component: CoachPresencesComponent },
            { path: 'evaluations', component: CoachEvaluationsComponent },
            { path: 'notifications', component: CoachNotificationsComponent },
            { path: 'resources', component: CoachResourcesComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CoachRoutingModule { }
