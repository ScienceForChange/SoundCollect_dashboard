import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { TableModule } from 'primeng/table';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

import { SharedComponentsModule } from '../../../shared/shared.module';
import { RoleComponent } from './page/role.component';
import { RoleListComponent } from './components/role-list/role-list.component';
import { RoleFormComponent } from './components/role-form/role-form.component';
import { RoleShowComponent } from './components/role-show/role-show.component';
import { NgxPermissionsModule } from 'ngx-permissions';


@NgModule({
  declarations: [
    RoleComponent,
    RoleListComponent,
    RoleFormComponent,
    RoleShowComponent
  ],
  imports: [
    NgxPermissionsModule,
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
  ]
})
export class RoleModule { }
