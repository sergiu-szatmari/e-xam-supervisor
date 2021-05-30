import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import 'webrtc-adapter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
})
export class AppComponent {
  @ViewChild('menuSidenav')
  menuDrawer: MatSidenav;

  condensed: boolean;

  constructor() { }

  async toggleSidenav() {
    this.condensed = !this.condensed;
  }
}
