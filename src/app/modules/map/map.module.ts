import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonModule } from 'primeng/skeleton';
import { SliderModule } from 'primeng/slider';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

import { MapComponent } from './page/map.component';

import { MapToolBarComponent } from './components/tool-bar/tool-bar.component';
import { MapFiltersComponent } from './components/filters/filters.component';
import { MapLayersComponent } from './components/map-layers/map-layers.component';
import { ObservationInfoModalComponent } from './components/observation-info-modal/observation-info-modal.component';
import { LAeqTChartComponent } from './components/laeq-tchart/laeq-tchart.component';
import { OneThirdOctaveChartComponent } from './components/one-third-octave-chart/one-third-octave-chart.component';

import { SharedComponentsModule } from '../../shared/shared.module';
import { SoundPressureDisplayPipe } from '../../pipes/sound-pressure-display.pipe';


@NgModule({
  declarations: [
    LAeqTChartComponent,
    MapComponent,
    MapFiltersComponent,
    MapLayersComponent,
    MapToolBarComponent,
    ObservationInfoModalComponent,
    OneThirdOctaveChartComponent,
    SoundPressureDisplayPipe,
  ],
  imports: [
    ButtonModule,
    CalendarModule,
    ChartModule,
    CheckboxModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    PaginatorModule,
    ProgressBarModule,
    RadioButtonModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    SidebarModule,
    SkeletonModule,
    SliderModule,
    ToastModule,
    ToolbarModule,
    TooltipModule,
  ],
})
export class MapModule {}
