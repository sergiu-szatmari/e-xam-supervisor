import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbDatepickerModule, NbGlobalPhysicalPosition, NbThemeModule, NbToastrModule } from '@nebular/theme';
import { SharedModule } from './shared/shared.module';
import { LayoutModule } from '@angular/cdk/layout';
import { NgxPicaModule } from '@digitalascetic/ngx-pica';
import { AboutComponent } from './pages/about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    SharedModule,
    LayoutModule,
    NbToastrModule.forRoot({
      duration: 4000,
      position: NbGlobalPhysicalPosition.BOTTOM_LEFT,
      destroyByClick: true,
      icon: ''
    }),
    NbDatepickerModule.forRoot(),
    NgxPicaModule,
  ],
  providers: [
    //   {
    //     provide: HTTP_INTERCEPTORS,
    //     useClass: UrlInterceptor,
    //     multi: true
    //   },
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
