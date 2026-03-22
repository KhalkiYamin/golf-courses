import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllModulesComponent } from './all-modules.component';
import { AuthGuard } from '../guards/auth.guards';

const routes: Routes = [
  {
    path: 'dashboard/coach',
    canActivate: [AuthGuard],
    data: { role: 'COACH' },
    loadChildren: () => import('./coach/coach.module').then(m => m.CoachModule)
  },
  {
    path: 'dashboard/athlete',
    canActivate: [AuthGuard],
    data: { role: 'ATHLETE' },
    loadChildren: () => import('./athlete/athlete.module').then(m => m.AthleteModule)
  },
  {
    path: 'golf-advisors',
    loadChildren: () => import('./golf-advisors/golf-advisors.module').then(m => m.GolfAdvisorsModule)
  },
  {
    path: '',
    component: AllModulesComponent,
    children: [
      { path: 'golfers', loadChildren: () => import('./golfers/golfers.module').then(m => m.GolfersModule) },
      { path: 'pages', loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule) },
      { path: 'blog', loadChildren: () => import('./blog/blog.module').then(m => m.BlogModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllModulesRoutingModule { }