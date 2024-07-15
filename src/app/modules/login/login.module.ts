import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { LoginComponent } from './login.component';
import { SharedComponentsModule } from '../../shared/shared.module';


@NgModule({
  imports: [
    ButtonModule,
    CheckboxModule,
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ReactiveFormsModule,
    RouterModule,
    SharedComponentsModule,
    ToastModule
  ],
  declarations: [LoginComponent],
})
export class LoginModule {}
