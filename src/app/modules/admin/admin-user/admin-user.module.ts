import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';

import { SharedComponentsModule } from '../../../shared/shared.module';
import { AdminUserComponent } from './page/admin-user.component';
import { AdminUserListComponent } from './components/admin-user-list/admin-user-list.component';
import { AdminUserFormComponent } from './components/admin-user-form/admin-user-form.component';
import { AdminUserShowComponent } from './components/admin-user-show/admin-user-show.component';



@NgModule({
  declarations: [
    AdminUserListComponent,
    AdminUserComponent,
    AdminUserFormComponent,
    AdminUserShowComponent
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
    ConfirmPopupModule
  ],
  exports: [RouterModule]
})
export class AdminUserModule { }
