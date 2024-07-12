import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IconModule } from './icons/icons.module';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { TranslateModule } from '@ngx-translate/core';
import { SliderStepComponent } from './components/slider-step/slider-step.component';

@NgModule({
  declarations: [ SpinnerComponent, SliderStepComponent],
  exports: [
    IconModule,
    SpinnerComponent,
    TranslateModule,
    SliderStepComponent
  ],
  imports: [
    DialogModule,
    ButtonModule,
    CommonModule,
    HttpClientModule,
    IconModule,
  ],
})
export class SharedComponentsModule {}
