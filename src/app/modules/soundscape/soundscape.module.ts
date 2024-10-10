import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SidebarModule } from 'primeng/sidebar';

import { SoundscapeComponent } from './page/soundscape.component';
import { SharedComponentsModule } from '../../shared/shared.module';
import { SoundLevelsChartComponent } from './components/sound-levels-chart/sound-levels-chart.component';
import { TemporalEvolutionSoundLevelChartComponent } from './components/temporal-evolution-sound-level-chart/temporal-evolution-sound-level-chart.component';
import { SoundTypesChartComponent } from './components/sound-types-chart/sound-types-chart.component';
import { QuasChartComponent } from './components/quas-chart/quas-chart.component';
import { PerceptionChartComponent } from './components/perception-chart/perception-chart.component';
import { PressureChartComponent } from './components/pressure-chart/pressure-chart.component';
import { QualitativeDataChartComponent } from './components/qualitative-data-chart/qualitative-data-chart.component';
import { TagCloudComponent } from './components/tag-cloud/tag-cloud.component';
import { TonalFrequencyChartComponent } from './components/tonal-frequency-chart/tonal-frequency-chart.component';
import { PhychoacusticsComponent } from './components/phychoacustics/phychoacustics.component';
import { SurveyChartComponent } from './components/survey-chart/survey-chart.component';



@NgModule({
  declarations: [
    PerceptionChartComponent,
    PressureChartComponent,
    QualitativeDataChartComponent,
    QuasChartComponent,
    SoundLevelsChartComponent,
    SoundscapeComponent,
    SoundTypesChartComponent,
    TagCloudComponent,
    TemporalEvolutionSoundLevelChartComponent,
    TonalFrequencyChartComponent,
    PhychoacusticsComponent,
    SurveyChartComponent,
  ],
  imports: [
    ButtonModule,
    CalendarModule,
    CheckboxModule,
    CommonModule,
    FormsModule,
    RadioButtonModule,
    ReactiveFormsModule,
    SelectButtonModule,
    SharedComponentsModule,
    SidebarModule,
    SplitButtonModule,
  ]
})
export class SoundscapeModule { }
