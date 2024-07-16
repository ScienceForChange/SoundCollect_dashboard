import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';

import { OverviewComponent } from './page/overview/overview.component';
import { CatalunyaMapComponent } from './components/catalunya-map/catalunya-map.component';
import { ObservationNumbersComponent } from './components/observation-numbers/observation-numbers.component';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { GenderPipe } from '../../pipes/gender.pipe';
import { SharedComponentsModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    BarChartComponent,
    CatalunyaMapComponent,
    GenderPipe,
    ObservationNumbersComponent,
    OverviewComponent,
  ],
  imports: [
    CalendarModule,
    CommonModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    TableModule,
  ],
})
export class OverviewModule {}
