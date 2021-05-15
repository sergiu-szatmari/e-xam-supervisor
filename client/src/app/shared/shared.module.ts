import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  NbAccordionModule,
  NbAlertModule, NbButtonModule,
  NbCardModule,
  NbDatepickerModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbPopoverModule,
  NbSpinnerModule,
} from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ImagePreloaderDirective } from './directives/image-preloader.directive';
import { NgSelectModule } from '@ng-select/ng-select';
import { BackButtonDirective } from './directives/back-button.directive';
import { ButtonSpinnerDirective } from './directives/button-spinner.directive';

import localeEnGb from '@angular/common/locales/en-GB';
import { LogoComponent } from './components/logo/logo.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { LinkViewComponent } from './components/sidenav/link-view/link-view.component';

registerLocaleData(localeEnGb);

const nebularModules = [
  NbButtonModule,
  NbEvaIconsModule,
  NbIconModule,
  NbCardModule,
  NbLayoutModule,
  NbPopoverModule,
  NbDatepickerModule,
  NbSpinnerModule,
  NbAlertModule,
  NbInputModule,
  NbAccordionModule,
];

const materialModules = [
  MatButtonModule,
  MatRippleModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatInputModule,
  MatCardModule,
  MatIconModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatSidenavModule,
  MatToolbarModule,
  MatMenuModule,
  MatDialogModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatRadioModule,
  MatCheckboxModule,
];

const usedModules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  HttpClientModule,
  FlexLayoutModule,
  NgSelectModule,
  ...nebularModules,
  ...materialModules,
];

const componentsList = [
  ImagePreloaderDirective,
  BackButtonDirective,
  ButtonSpinnerDirective,
  LogoComponent,
  SidenavComponent,
];

const appearance: MatFormFieldDefaultOptions = {
  appearance: 'legacy',
};

@NgModule({
  declarations: [ ...componentsList, LinkViewComponent ],
  imports: [ ...usedModules ],
  exports: [ ...usedModules, ...componentsList ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance,
    },
    {
      provide: LOCALE_ID,
      useValue: 'en-GB',
    },
  ],
})
export class SharedModule {
}
