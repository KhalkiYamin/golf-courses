import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllModulesRoutingModule } from './all-modules-routing.module';
import { AllModulesComponent } from './all-modules.component';



@NgModule({
  declarations: [
    AllModulesComponent,

  ],
  imports: [
    CommonModule,
    AllModulesRoutingModule
  ]
})
export class AllModulesModule { }
