import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupervisorRoutingModule } from './supervisor-routing.module';
import { SupervisorComponent } from './supervisor.component';
import { SharedModule } from '../../shared/shared.module';
import { SetPasswordDialogComponent } from './set-password-dialog/set-password-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [ SupervisorComponent, SetPasswordDialogComponent ],
  imports: [
    CommonModule,
    SupervisorRoutingModule,
    SharedModule,
    MatDialogModule,
  ]
})
export class SupervisorModule { }
