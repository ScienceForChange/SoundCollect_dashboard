import { APP_INITIALIZER, NgModule } from '@angular/core';
import { PathLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './layout/app.layout.module';
import { AppRoutingModule } from './app-routing.module';
import { SharedComponentsModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { authInterceptorProviders } from './interceptor/auth.interceptor';
import { MapModule } from './modules/map/map.module';
import { LoginModule } from './modules/login/login.module';
import { MessageService } from 'primeng/api';
import { OverviewModule } from './modules/overview/overview.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environments';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SoundscapeModule } from './modules/soundscape/soundscape.module';
import { errorInterceptorProviders } from './interceptor/error.interceptor';
import { ErrorModule } from './modules/error/error.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    AppLayoutModule,
    AppRoutingModule,
    SharedComponentsModule,
    ErrorModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LoginModule,
    MapModule,
    SoundscapeModule,
    OverviewModule,
    TranslateModule.forRoot({
      defaultLanguage: environment.DEFAULT_LANGUAGE,
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
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
      multi: true
    },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    authInterceptorProviders,
    errorInterceptorProviders
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
