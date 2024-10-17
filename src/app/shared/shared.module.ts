import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';

import { IconModule } from './icons/icons.module';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SliderStepComponent } from './components/slider-step/slider-step.component';
import { InfoModalComponent } from './components/info-modal/info-modal.component';
import { StudyZoneDialogComponent } from './components/study-zone-dialog/study-zone-dialog.component';
import { ObservationInfoModalComponent } from './components/observation-info-modal/observation-info-modal.component';
import { LAeqTChartComponent } from './components/laeq-tchart/laeq-tchart.component';
import { OneThirdOctaveChartComponent } from './components/one-third-octave-chart/one-third-octave-chart.component';
import { ObservationMapModalComponent } from './components/observation-map-modal/observation-map-modal.component';
import { GalleriaModule } from 'primeng/galleria';

@NgModule({
  declarations: [
    OneThirdOctaveChartComponent,
    LAeqTChartComponent,
    SpinnerComponent,
    SliderStepComponent,
    InfoModalComponent,
    ObservationInfoModalComponent,
    StudyZoneDialogComponent,
    ObservationMapModalComponent
  ],
  exports: [
    IconModule,
    SpinnerComponent,
    SliderStepComponent,
    InfoModalComponent,
    StudyZoneDialogComponent,
    TranslateModule,
    ObservationInfoModalComponent,
    ObservationMapModalComponent
  ],
  imports: [
    DialogModule,
    ButtonModule,
    CommonModule,
    HttpClientModule,
    IconModule,
    TranslateModule,
    SidebarModule,
    GalleriaModule,
  ],
})
export class SharedComponentsModule {}
