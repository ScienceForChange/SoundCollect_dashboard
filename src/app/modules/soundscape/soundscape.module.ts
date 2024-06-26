import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';

import { SoundscapeComponent } from './page/soundscape.component';
import { SharedComponentsModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SoundLevelsChartComponent } from './components/sound-levels-chart/sound-levels-chart.component';



@NgModule({
  declarations: [
    SoundscapeComponent,
    SoundLevelsChartComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    RadioButtonModule,
    SharedComponentsModule,
    FormsModule
  ]
})
export class SoundscapeModule { }
