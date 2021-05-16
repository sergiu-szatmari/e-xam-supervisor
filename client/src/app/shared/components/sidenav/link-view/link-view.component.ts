import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MenuItem } from '../sidenav.component';

@Component({
  selector: 'app-link-view',
  templateUrl: './link-view.component.html',
  styleUrls: [ './link-view.component.scss' ],
})
export class LinkViewComponent {

  @Input()
  item: MenuItem;

  @Output()
  clicked = new EventEmitter<void>();

  constructor() { }
}
