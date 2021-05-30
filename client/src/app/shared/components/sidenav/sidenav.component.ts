import { ChangeDetectionStrategy, Component, OnInit, } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SharedEventsService } from '../../services/shared-events.service';

export interface MenuItem {
  title: string;
  link?: string;
  evaIcon?: string;
  materialIcon?: string;
  submenu?: { title: string; link: string }[];
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
  activeLink: string;

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

  constructor(
    private router: Router,
    public sharedEvents: SharedEventsService,
  ) { }

  ngOnInit() {
    this.activeLink = this.router.url.split('?')[ 0 ];
    this.menuItems
      .filter((item) => item.submenu != null)
      .forEach((item) => {
        item.expanded = item.submenu
          .map((i) => i.link)
          .includes(this.activeLink);
      });
  }
}
