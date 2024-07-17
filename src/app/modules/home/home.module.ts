import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';

import { HomeComponent } from './page/home.component';
import { SharedComponentsModule } from '../../shared/shared.module';



@NgModule({
  declarations: [HomeComponent],
  imports: [
    ButtonModule,
    CommonModule,
    SharedComponentsModule,
  ]
})
export class ErrorModule { }
