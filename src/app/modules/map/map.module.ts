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
import { ToggleButtonModule } from 'primeng/togglebutton';

import { MapComponent } from './page/map.component';

import { MapToolBarComponent } from './components/tool-bar/tool-bar.component';
import { MapFiltersComponent } from './components/filters/filters.component';
import { MapLayersComponent } from './components/map-layers/map-layers.component';

import { SoundPressureDisplayPipe } from '../../pipes/sound-pressure-display.pipe';
import { MapZoneStudyLayersComponent } from './components/map-study-zone-layers/map-study-zone-layers.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentsModule } from "../../shared/shared.module";


@NgModule({
  declarations: [
    MapComponent,
    MapFiltersComponent,
    MapLayersComponent,
    MapZoneStudyLayersComponent,
    MapToolBarComponent,
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
    SidebarModule,
    SkeletonModule,
    SliderModule,
    ToastModule,
    ToolbarModule,
    TooltipModule,
    ToggleButtonModule,
    TranslateModule,
    SharedComponentsModule
],
})
export class MapModule {}
