import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AthleteRoutingModule } from './athlete-routing.module';
import { AthleteShellLayoutComponent as AthleteLayoutComponent } from './athlete-layout/athlete-layout.component';
import { AthleteDashboardComponent } from './athlete-dashboard/athlete-dashboard.component';
import { AthleteProfileComponent } from './athlete-profile/athlete-profile.component';
import { AthleteSessionsComponent } from './athlete-sessions/athlete-sessions.component';
import { AthleteResourcesComponent } from './athlete-resources/athlete-resources.component';
import { AthleteNotificationsComponent } from './athlete-notifications/athlete-notifications.component';
import { AthletePlanningComponent } from './athlete-planning/athlete-planning.component';

@NgModule({
    declarations: [
        AthleteLayoutComponent,
        AthleteDashboardComponent,
        AthleteProfileComponent,
        AthleteSessionsComponent,
        AthleteResourcesComponent,
        AthleteNotificationsComponent,
        AthletePlanningComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        AthleteRoutingModule
    ]
})
export class AthleteModule { }
