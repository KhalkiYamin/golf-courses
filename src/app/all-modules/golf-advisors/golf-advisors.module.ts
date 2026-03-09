import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GolfAdvisorsRoutingModule } from './golf-advisors-routing.module';
import { GolfAdvisorsComponent } from './golf-advisors.component';
import { AdvisorsDashboardComponent } from './advisors-dashboard/advisors-dashboard.component';
import { BatchComponent } from './batch/batch.component';
import { ScheduleTimingsComponent } from './schedule-timings/schedule-timings.component';
import { MyGolfersComponent } from './my-golfers/my-golfers.component';
import { GolferProfileComponent } from './golfer-profile/golfer-profile.component';
import { ChatAdvisorComponent } from './chat-advisor/chat-advisor.component';
import { AdvisorsProfileSettingsComponent } from './advisors-profile-settings/advisors-profile-settings.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { AdvisorsRegisterComponent } from './advisors-register/advisors-register.component';
import { SocialMediaComponent } from './social-media/social-media.component';
import { AdvisorsChangePasswordComponent } from './advisors-change-password/advisors-change-password.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { CategoriesComponent } from './categories/categories.component';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { TagInputModule } from 'ngx-chips';

@NgModule({
  declarations: [
    GolfAdvisorsComponent,
    AdvisorsDashboardComponent,
    BatchComponent,
    ScheduleTimingsComponent,
    MyGolfersComponent,
    GolferProfileComponent,
    ChatAdvisorComponent,
    AdvisorsProfileSettingsComponent,
    ReviewsComponent,
    AdvisorsRegisterComponent,
    SocialMediaComponent,
    AdvisorsChangePasswordComponent,
    AdminLayoutComponent,
    CategoriesComponent
  ],
  imports: [
    CommonModule,
    GolfAdvisorsRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    TagInputModule
  ]
})
export class GolfAdvisorsModule { }