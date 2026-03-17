import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllModulesComponent } from './all-modules.component';

const routes: Routes = [
  {
    path: '',
    component: AllModulesComponent,
    children: [
      { path: 'golfers', loadChildren: () => import('./golfers/golfers.module').then(m => m.GolfersModule) },
      { path: 'pages', loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule) },
      { path: 'blog', loadChildren: () => import('./blog/blog.module').then(m => m.BlogModule) }
    ]
  },
  {
    path: 'golf-advisors',
    loadChildren: () => import('./golf-advisors/golf-advisors.module').then(m => m.GolfAdvisorsModule)
  },
  {
    path: 'dashboard/coach',
    loadChildren: () => import('./coach/coach.module').then(m => m.CoachModule)
  },
  {
    path: 'dashboard/athlete',
    loadChildren: () => import('./athlete/athlete.module').then(m => m.AthleteModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllModulesRoutingModule { }