import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupervisorRoutingModule } from './supervisor-routing.module';
import { SupervisorComponent } from './supervisor.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [ SupervisorComponent ],
  imports: [
    CommonModule,
    SupervisorRoutingModule,
    SharedModule
  ]
})
export class SupervisorModule { }
