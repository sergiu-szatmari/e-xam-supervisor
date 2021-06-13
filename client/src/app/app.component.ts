import { Component, ElementRef, ViewChild } from '@angular/core';
import 'webrtc-adapter';
import { SharedEventsService } from './shared/services/shared-events.service';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
})
export class AppComponent {

  @ViewChild('menuSidenav')
  menuDrawer: ElementRef;

  constructor(public sharedEvents: SharedEventsService) { }
}
