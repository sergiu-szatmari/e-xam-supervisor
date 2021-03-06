import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  NbButtonModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbSpinnerModule,
} from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import localeEnGb from '@angular/common/locales/en-GB';
import { LogoComponent } from './components/logo/logo.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { LinkViewComponent } from './components/sidenav/link-view/link-view.component';
import { VideoContainerComponent } from './components/video-container/video-container.component';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

registerLocaleData(localeEnGb);

const nebularModules = [
  NbButtonModule,
  NbEvaIconsModule,
  NbIconModule,
  NbLayoutModule,
  NbSpinnerModule,
  NbInputModule,
];

const materialModules = [
  MatInputModule,
  MatSidenavModule,
  MatButtonModule,
  MatTooltipModule,
];

const usedModules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  HttpClientModule,
  ...nebularModules,
  ...materialModules,
];

@NgModule({
  declarations: [
    LogoComponent,
    SidenavComponent,
    LinkViewComponent,
    VideoContainerComponent
  ],
  imports: [ ...usedModules, MatRippleModule, MatTooltipModule ],
  exports: [
    ...usedModules,
    LogoComponent,
    SidenavComponent,
    VideoContainerComponent
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'en-GB',
    },
  ],
})
export class SharedModule {
}
