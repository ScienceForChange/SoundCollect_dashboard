import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';

import { SoundscapeComponent } from './page/soundscape.component';
import { SharedComponentsModule } from '../../shared/shared.module';



@NgModule({
  declarations: [
    SoundscapeComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    RadioButtonModule,
    SharedComponentsModule,
  ]
})
export class SoundscapeModule { }