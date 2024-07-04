import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './page/overview/overview.component';
import { CatalunyaMapComponent } from './components/catalunya-map/catalunya-map.component';
import { ObservationNumbersComponent } from './components/observation-numbers/observation-numbers.component';
import { TableModule } from 'primeng/table';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { CalendarModule } from 'primeng/calendar';
import { ReactiveFormsModule } from '@angular/forms';
import { GenderPipe } from '../../pipes/gender.pipe';
import { SharedComponentsModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    OverviewComponent,
    CatalunyaMapComponent,
    ObservationNumbersComponent,
    BarChartComponent,
    GenderPipe,
  ],
  imports: [
    CommonModule,
    TableModule,
    CalendarModule,
    ReactiveFormsModule,
    SharedComponentsModule,
  ],
})
export class OverviewModule {}
