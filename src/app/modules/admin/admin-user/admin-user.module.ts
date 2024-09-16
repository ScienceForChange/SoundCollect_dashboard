import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserListComponent } from './components/admin-user-list/admin-user-list.component';
import { AdminUserComponent } from './page/admin-user.component';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { SharedComponentsModule } from '../../../shared/shared.module';
import { AdminUserFormComponent } from './components/admin-user-form/admin-user-form.component';
import { AdminUserShowComponent } from './components/admin-user-show/admin-user-show.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';




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
    CheckboxModule
  ],
  exports: [RouterModule]
})
export class AdminUserModule { }
