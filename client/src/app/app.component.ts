import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import 'webrtc-adapter';
import { SharedEventsService } from './shared/services/shared-events.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

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
