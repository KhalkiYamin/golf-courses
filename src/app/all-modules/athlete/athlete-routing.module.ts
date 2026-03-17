import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AthleteShellLayoutComponent } from './athlete-layout/athlete-layout.component';
import { AthleteDashboardComponent } from './athlete-dashboard/athlete-dashboard.component';
import { AthleteProfileComponent } from './athlete-profile/athlete-profile.component';
import { AthleteSessionsComponent } from './athlete-sessions/athlete-sessions.component';
import { AthleteResourcesComponent } from './athlete-resources/athlete-resources.component';
import { AthleteNotificationsComponent } from './athlete-notifications/athlete-notifications.component';

const routes: Routes = [
    {
        path: '',
        component: AthleteShellLayoutComponent,
        children: [
            { path: 'dashboard', component: AthleteDashboardComponent },
            { path: 'profile', component: AthleteProfileComponent },
            { path: 'sessions', component: AthleteSessionsComponent },
            { path: 'resources', component: AthleteResourcesComponent },
            { path: 'notifications', component: AthleteNotificationsComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AthleteRoutingModule { }
