import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';

import { ErrorComponent } from './page/error.component';
import { SharedComponentsModule } from '../../shared/shared.module';



@NgModule({
  declarations: [ErrorComponent],
  imports: [
    ButtonModule,
    CommonModule,
    SharedComponentsModule,
  ]
})
export class ErrorModule { }
