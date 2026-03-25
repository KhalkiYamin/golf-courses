import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AthleteRoutingModule } from './athlete-routing.module';
import { AthleteShellLayoutComponent } from './athlete-layout/athlete-layout.component';
import { AthleteDashboardComponent } from './athlete-dashboard/athlete-dashboard.component';
import { AthleteProfileComponent } from './athlete-profile/athlete-profile.component';
import { AthleteSessionsComponent } from './athlete-sessions/athlete-sessions.component';
import { AthleteResourcesComponent } from './athlete-resources/athlete-resources.component';
import { AthleteNotificationsComponent } from './athlete-notifications/athlete-notifications.component';

@NgModule({
    declarations: [
        AthleteShellLayoutComponent,
        AthleteDashboardComponent,
        AthleteProfileComponent,
        AthleteSessionsComponent,
        AthleteResourcesComponent,
        AthleteNotificationsComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        AthleteRoutingModule
    ]
})
export class AthleteModule { }