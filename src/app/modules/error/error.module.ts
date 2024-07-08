import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './page/error.component';
import { SharedComponentsModule } from '../../shared/shared.module';
import { ButtonModule } from 'primeng/button';



@NgModule({
  declarations: [ErrorComponent],
  imports: [
    CommonModule,
    SharedComponentsModule,
    ButtonModule
  ]
})
export class ErrorModule { }
