import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationComponent } from './page/observation.component';
import { ObservationListComponent } from './components/observation-list/observation-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { NgxPermissionsModule } from 'ngx-permissions';
import { TableModule } from 'primeng/table';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { SharedComponentsModule } from '../../../shared/shared.module';



@NgModule({
  declarations: [
    ObservationComponent,
    ObservationListComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    CommonModule,
    TableModule,
    MenubarModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ConfirmPopupModule,
    NgxPermissionsModule,
    IconFieldModule,
    InputIconModule
  ]
})
export class ObservationModule { }
