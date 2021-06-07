import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { MeetingService } from '../../../shared/services/meeting.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-set-password-dialog',
  templateUrl: './set-password-dialog.component.html',
  styleUrls: ['./set-password-dialog.component.scss']
})
export class SetPasswordDialogComponent implements OnInit {

  password = '';
  passwordLifetimeAsMinutes;

  constructor(
    private toastr: NbToastrService,
    private dialogRef: MatDialogRef<SetPasswordDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  public onCreateRoom() {
    try {
      if (this.password.length < 6) {
        this.toastr.danger('Password is not strong enough');
        return;
      }

      if (!this.passwordLifetimeAsMinutes || isNaN(Number(this.passwordLifetimeAsMinutes))) {
        this.toastr.danger('Password lifetime must be a valid number (measured in minutes)')
        return;
      }

      return this.dialogRef.close({
        password: this.password,
        timeout: this.passwordLifetimeAsMinutes * 60
      });
    } catch (err) {
      this.toastr.danger(err.error?.message || err.message);
      console.error(err);
    }
  }
}
