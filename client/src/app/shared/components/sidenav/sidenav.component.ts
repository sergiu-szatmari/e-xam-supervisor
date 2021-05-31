import { ChangeDetectionStrategy, Component, OnInit, } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

export interface MenuItem {
  title: string;
  link?: string;
  evaIcon?: string;
  expanded?: boolean;
}

@UntilDestroy()
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: [ './sidenav.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      title: 'Home',
      link: '/',
      evaIcon: 'home-outline',
    },
    {
      title: 'Room',
      link: '/room',
      evaIcon: 'monitor-outline'
    },
    {
      title: 'Supervisor',
      link: '/supervisor',
      evaIcon: 'layout-outline'
    },
    {
      title: 'Help & About',
      link: '/about',
      evaIcon: 'question-mark-circle-outline'
    }
  ];

  constructor() { }

  ngOnInit() {
  }
}
