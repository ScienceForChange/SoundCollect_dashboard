import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';

import { SoundscapeComponent } from './page/soundscape.component';
import { SharedComponentsModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SoundLevelsChartComponent } from './components/sound-levels-chart/sound-levels-chart.component';
import { TemporalEvolutionSoundLevelChartComponent } from './components/temporal-evolution-sound-level-chart/temporal-evolution-sound-level-chart.component';



@NgModule({
  declarations: [
    SoundscapeComponent,
    SoundLevelsChartComponent,
    TemporalEvolutionSoundLevelChartComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    RadioButtonModule,
    SharedComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule
  ]
})
export class SoundscapeModule { }
