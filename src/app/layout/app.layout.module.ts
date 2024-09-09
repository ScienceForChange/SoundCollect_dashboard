import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppMenuComponent } from './components/menu/app.menu.component';
import { AppLayoutComponent } from './components/layout/app.layout.component';
import { SharedComponentsModule } from '../shared/shared.module';

import { NgxPermissionsModule } from 'ngx-permissions';

import { PanelMenuModule } from 'primeng/panelmenu';
import { SidebarModule } from 'primeng/sidebar';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [AppLayoutComponent, AppMenuComponent],
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
    DividerModule,
    DialogModule,
    FormsModule,
    PanelMenuModule,
    NgxPermissionsModule
  ],
  exports: [AppLayoutComponent],
})
export class AppLayoutModule {}
