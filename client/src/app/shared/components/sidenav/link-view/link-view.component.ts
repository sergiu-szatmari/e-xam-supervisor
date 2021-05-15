import { Component, Input } from '@angular/core';

import { MenuItem } from '../sidenav.component';

@Component({
  selector: 'app-link-view',
  templateUrl: './link-view.component.html',
  styleUrls: [ './link-view.component.scss' ],
})
export class LinkViewComponent {
  @Input() item: MenuItem;

  constructor() {
  }
}
