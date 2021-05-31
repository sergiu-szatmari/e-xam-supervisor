import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import 'webrtc-adapter';
import { SharedEventsService } from './shared/services/shared-events.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
})
export class AppComponent {
  @ViewChild('menuSidenav')
  menuDrawer: MatSidenav;

  condensed: boolean;

  constructor(public sharedEvents: SharedEventsService) { }

  async toggleSidenav() {
    this.condensed = !this.condensed;
  }
}
