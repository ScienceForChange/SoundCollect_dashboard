import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppMenuComponent } from './components/menu/app.menu.component';
import { AppLayoutComponent } from './components/layout/app.layout.component';
import { SharedComponentsModule } from '../shared/shared.module';

import { SidebarModule } from 'primeng/sidebar';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';


@NgModule({
  declarations: [
    AppLayoutComponent,
    AppMenuComponent,
  ],
  imports: [
    BrowserModule,
    ButtonModule,
    HttpClientModule,
    MenuModule,
    RippleModule,
    RouterModule,
    SharedComponentsModule,
    SidebarModule,
    ToastModule,
    DividerModule
  ],
  exports: [AppLayoutComponent],
})
export class AppLayoutModule {}
