import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { SpinnerComponent } from './components/spinner/spinner.component';
import { SliderStepComponent } from './components/slider-step/slider-step.component';
import { InfoModalComponent } from './components/info-modal/info-modal.component';

import { IconModule } from './icons/icons.module';
import { StudyZoneDialogComponent } from './components/study-zone-dialog/study-zone-dialog.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SpinnerComponent,
    SliderStepComponent,
    InfoModalComponent,
    StudyZoneDialogComponent
  ],
  exports: [
    IconModule,
    SpinnerComponent,
    SliderStepComponent,
    InfoModalComponent,
    StudyZoneDialogComponent,
    TranslateModule
  ],
  imports: [
    DialogModule,
    ButtonModule,
    CommonModule,
    HttpClientModule,
    IconModule,
    TranslateModule
  ],
})
export class SharedComponentsModule {}
