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
import { AuthService } from './services/auth/auth.service';
import { AdminUserModule } from './modules/admin/admin-user/admin-user.module';
import { RoleModule } from './modules/admin/role/role.module';

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
    BrowserModule,
    HttpClientModule,
    LoginModule,
    MapModule,
    OverviewModule,
    SharedComponentsModule,
    SoundscapeModule,
    HomeModule,
    StudyZoneModule,
    AdminUserModule,
    RoleModule,
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
        ngxPermissionsService: NgxPermissionsService,
        authService: AuthService
      ) => {
        return () =>//Problema por que esto se ejecuta en login y en login no tengo acceso a ver user
          translate
            .use(localStorage.getItem('locale') || environment.DEFAULT_LANGUAGE)
            .toPromise()
            .then(async () => {
              const user = await authService.getUserLogged();
              if (!user.data) return true;
              const permissions = user.data.attributes.permissions_list.map(
                (permission) => permission.toUpperCase()
              );
              ngxPermissionsService.loadPermissions(permissions);
              return true;
            }).catch((err) => {
              ngxPermissionsService.loadPermissions([]);
            });
      },
      deps: [TranslateService, NgxPermissionsService, AuthService],
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
