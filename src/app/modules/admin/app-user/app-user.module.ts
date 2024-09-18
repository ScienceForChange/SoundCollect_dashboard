import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { TableModule } from 'primeng/table';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { NgxPermissionsModule } from 'ngx-permissions';

import { SharedComponentsModule } from '../../../shared/shared.module';
import { AppUserComponent } from './page/app-user.component';
import { AppUserFormComponent } from './components/app-user-form/app-user-form.component';
import { AppUserListComponent } from './components/app-user-list/app-user-list.component';
import { AppUserShowComponent } from './components/app-user-show/app-user-show.component';



@NgModule({
  declarations: [
    AppUserComponent,
    AppUserFormComponent,
    AppUserListComponent,
    AppUserShowComponent
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
    NgxPermissionsModule
  ]
})
export class AppUserModule { }
