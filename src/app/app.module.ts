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
import { ConfirmationService } from 'primeng/api';

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
import { BrowserModule } from '@angular/platform-browser';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { User } from './models/auth';

export function HttpLoaderFactory(http: HttpClient) {
  console.log('http', http);
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function permissionsFactory(
  ngxPermissionsService: NgxPermissionsService
) {
  return () => {
    const user: User = JSON.parse(localStorage.getItem('user'));
    const permissions = user.attributes.permissions_list.map((permission) =>
      permission.toUpperCase()
    );
    ngxPermissionsService.loadPermissions(permissions);
    var perm = ngxPermissionsService.getPermissions();
    console.log('perm', perm);
    return true;
  };
}

//var perm = ngxPermissionsService.getPermissions();

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppLayoutModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ErrorModule,
    BrowserModule,
    HttpClientModule,
    LoginModule,
    MapModule,
    OverviewModule,
    SharedComponentsModule,
    SoundscapeModule,
    HomeModule,
    StudyZoneModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgxPermissionsModule.forRoot(),
  ],
  providers: [
    MessageService,
    ConfirmationService,
    {
      provide: APP_INITIALIZER,
      useFactory: (
        translate: TranslateService,
        ngxPermissionsService: NgxPermissionsService
      ) => {
        return () =>
          translate
            .use(localStorage.getItem('locale') || environment.DEFAULT_LANGUAGE)
            .toPromise()
            .then(() => {
              const user: User = JSON.parse(localStorage.getItem('user'));
              const permissions = user.attributes.permissions_list.map(
                (permission) => permission.toUpperCase()
              );
              ngxPermissionsService.loadPermissions(permissions);
              return true;
            });
      },
      deps: [TranslateService, NgxPermissionsService],
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
