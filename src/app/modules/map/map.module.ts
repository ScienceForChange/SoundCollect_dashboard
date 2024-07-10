import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './page/map.component';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
import { MapToolBarComponent } from './components/tool-bar/tool-bar.component';
import { MapFiltersComponent } from './components/filters/filters.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SidebarModule } from 'primeng/sidebar';
import { ToolbarModule } from 'primeng/toolbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { CalendarModule } from 'primeng/calendar';
import { MapLayersComponent } from './components/map-layers/map-layers.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ObservationInfoModalComponent } from './components/observation-info-modal/observation-info-modal.component';
import { SharedComponentsModule } from '../../shared/shared.module';
import { LAeqTChartComponent } from './components/laeq-tchart/laeq-tchart.component';
import { OneThirdOctaveChartComponent } from './components/one-third-octave-chart/one-third-octave-chart.component';
import { SoundPressureDisplayPipe } from '../../pipes/sound-pressure-display.pipe';


@NgModule({
  declarations: [
    MapComponent,
    MapToolBarComponent,
    MapFiltersComponent,
    MapLayersComponent,
    ObservationInfoModalComponent,
    LAeqTChartComponent,
    SoundPressureDisplayPipe,
    OneThirdOctaveChartComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CheckboxModule,
    SliderModule,
    CalendarModule,
    CommonModule,
    ChartModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    SidebarModule,
    ToolbarModule,
    ProgressBarModule,
    ToastModule,
    DropdownModule,
    SkeletonModule,
    PaginatorModule,
    RadioButtonModule,
    SharedComponentsModule
  ],
})
export class MapModule {}
