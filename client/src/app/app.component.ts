import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import 'webrtc-adapter';
import { SharedEventsService } from './shared/services/shared-events.service';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
})
export class AppComponent implements OnInit {

  @ViewChild('menuSidenav')
  menuDrawer: ElementRef;

  isAppReady = false;

  constructor(public sharedEvents: SharedEventsService) { }

  public ngOnInit(): void {
    this.sharedEvents
      .wakeUpServer()
      .then((isServerUp) => this.isAppReady = isServerUp);
  }
}
