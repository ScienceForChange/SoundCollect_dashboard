import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { PathLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';

import { MessageService } from 'primeng/api';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { SharedComponentsModule } from './shared/shared.module';

import { authInterceptorProviders } from './interceptor/auth.interceptor';
import { errorInterceptorProviders } from './interceptor/error.interceptor';

import { GlobalErrorHandler } from './handler/global-error-handler';

import { environment } from '../environments/environment';

import { LoginModule } from './modules/login/login.module';
import { OverviewModule } from './modules/overview/overview.module';
import { SoundscapeModule } from './modules/soundscape/soundscape.module';
import { MapModule } from './modules/map/map.module';
import { ErrorModule } from './modules/error/error.module';
import { HomeModule } from './modules/home/home.module';
import { StudyZoneModule } from './modules/admin/study-zone/study-zone.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    AppLayoutModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ErrorModule,
    HttpClientModule,
    LoginModule,
    MapModule,
    OverviewModule,
    SharedComponentsModule,
    SoundscapeModule,
    HomeModule,
    StudyZoneModule,
    TranslateModule.forRoot({
      defaultLanguage: environment.DEFAULT_LANGUAGE,
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    MessageService,
    {
      provide: APP_INITIALIZER,
      useFactory: (translate: TranslateService) => {
        return () => translate.use(environment.DEFAULT_LANGUAGE).toPromise();
      },
      deps: [TranslateService],
      multi: true,
    },
    {
      // processes all errors
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    authInterceptorProviders,
    errorInterceptorProviders,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
