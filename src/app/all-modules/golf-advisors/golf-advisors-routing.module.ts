import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdvisorsChangePasswordComponent } from './advisors-change-password/advisors-change-password.component';
import { AdvisorsDashboardComponent } from './advisors-dashboard/advisors-dashboard.component';
import { AdvisorsProfileSettingsComponent } from './advisors-profile-settings/advisors-profile-settings.component';
import { AdvisorsRegisterComponent } from './advisors-register/advisors-register.component';
import { BatchComponent } from './batch/batch.component';
import { ChatAdvisorComponent } from './chat-advisor/chat-advisor.component';
import { GolferProfileComponent } from './golfer-profile/golfer-profile.component';
import { MyGolfersComponent } from './my-golfers/my-golfers.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ScheduleTimingsComponent } from './schedule-timings/schedule-timings.component';
import { SocialMediaComponent } from './social-media/social-media.component';
import { AuthGuard } from 'src/app/guards/auth.guards';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { CategoriesComponent } from './categories/categories.component';
import { UsersComponent } from './users/users.component';
import { ParametresComponent } from './parametres/parametres.component';
import { RessourcesSportivesComponent } from './ressources-sportives/ressources-sportives.component';
const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'advisors-dashboard', component: AdvisorsDashboardComponent },
      { path: 'batch', component: BatchComponent },
      { path: 'schedule-timings', component: ScheduleTimingsComponent },
      { path: 'my-golfers', component: MyGolfersComponent },
      { path: 'golfer-profile', component: GolferProfileComponent },
      { path: 'chat-advisor', component: ChatAdvisorComponent },
      { path: 'advisors-profile-settings', component: AdvisorsProfileSettingsComponent },
      { path: 'reviews', component: ReviewsComponent },
      { path: 'advisors-register', component: AdvisorsRegisterComponent },
      { path: 'social-media', component: SocialMediaComponent },
      { path: 'advisors-change-password', component: AdvisorsChangePasswordComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'users', component: UsersComponent },
      { path: 'parametres', component: ParametresComponent },
      { path: 'ressources-sportives', component: RessourcesSportivesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GolfAdvisorsRoutingModule { }