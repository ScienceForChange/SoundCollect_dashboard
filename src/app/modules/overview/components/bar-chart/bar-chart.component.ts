import {
  AfterViewInit,
  Component,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption } from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { ObservationsService } from '../../../../services/observations/observations.service';
import {
  Observations,
  ObservationsDataChart,
} from '../../../../models/observations';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | BarSeriesOption
>;

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnInit, AfterViewInit {
  private translate = inject(TranslateService);

  private myChart!: echarts.ECharts;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.myChart.resize();
  }
  private options: EChartsOption;
  public timesFilter = {
    DELETE: 'delete',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
  }
  private observations: ObservationsDataChart[] = [];
  private obsFiltered: ObservationsDataChart[] = [];
  public today: Date = new Date();
  public timeFilterSelected: string = this.timesFilter.DELETE;
  private lastDay30: Date = new Date(
    new Date().setDate(this.today.getDate() - 30)
  );
  private loadingOptions = {
    text: 'Carregant...',
    color: '#FF7A1F',
  };
  private observationService: ObservationsService = inject(ObservationsService);
  public filtersForm: FormGroup = new FormGroup({
    daysFilter: new FormControl([this.lastDay30, new Date()], []),
  });


  ngOnInit(): void {
    echarts.use([GridComponent, BarChart, CanvasRenderer]);
    this.filtersForm.valueChanges.subscribe(
      (values: { daysFilter: [Date, Date | null] }) => {
        const haveTwoDaysSelected = values.daysFilter[1] !== null;
        if (haveTwoDaysSelected) {
          this.obsFiltered = this.observations.filter((obs) => {
            const isBeforeToday = new Date(obs.date) <= values.daysFilter[1];
            const isAfterLastDay30 = new Date(obs.date) >= values.daysFilter[0];
            if (isBeforeToday && isAfterLastDay30) return true;
            return false;
          });
          this.updateChart(this.obsFiltered);
          this.timeFilterSelected = this.timesFilter.DELETE;
        }
      }
    );
  }

  private updateChart(observations: ObservationsDataChart[]) {
    this.options = {
      xAxis: {
        type: 'category',
        data: observations.map((obs) => obs.date),
      },
      yAxis: {
        name: this.translate.instant('overview.barChart.yAxis'),
        nameLocation: 'middle',
        nameGap: 35,
        type: 'value'
      },
      series: [
        {
          data: observations.map((obs) => obs.count),
          type: 'bar',
        },
      ],
    };
    this.options && this.myChart.setOption(this.options);
  }

  private currentWeek(date: Date) {
    let yearStart = new Date(date.getFullYear(), 0, 1);
    let today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    let dayOfYear = (today.valueOf() - yearStart.valueOf() + 1) / 86400000;
    return Math.ceil(dayOfYear / 7);
  }

  public timeFilter(filter: string) {
    //Get obs filtered by the days selected
    const values = this.filtersForm.value;
    const obsFiltered = this.observations.filter((obs) => {
      const isBeforeToday = new Date(obs.date) <= values.daysFilter[1];
      const isAfterLastDay30 = new Date(obs.date) >= values.daysFilter[0];
      if (isBeforeToday && isAfterLastDay30) return true;
      return false;
    });
    let filteredObsByTime = obsFiltered;
    if(filter !== this.timesFilter.DELETE){
      //Group obs selected by the time selected
      const groupByTime = obsFiltered.reduce(
        (acc: { [key: number]: any[] }, obs) => {
          const day = obs.completeDay;
          const time =
            filter === 'week'
              ? this.currentWeek(day)
              : filter === 'month'
              ? day.getMonth()
              : day.getFullYear();
          if (!acc[time]) {
            acc[time] = [obs];
          }
          acc[time].push(obs);
          return acc;
        },
        {}
      );
      //Create an array with the grouped obs with the structured data needed
      filteredObsByTime = Object.values(groupByTime).map((timeObs) => {
        return {
          date: timeObs[0].date,
          obs: timeObs,
          count: timeObs.length,
          completeDay: timeObs[0].completeDay,
        };
      });
    }
    this.obsFiltered = filteredObsByTime;
    this.updateChart(this.obsFiltered);
    this.timeFilterSelected = filter;
  }

  async ngAfterViewInit(): Promise<void> {
    const chartDom = document.getElementById('bar-chart-container');
    this.myChart = echarts.init(chartDom);
    this.myChart.showLoading('default', this.loadingOptions);
    this.observationService.getAllObservationsFormated().subscribe((data) => {
      this.observations = data;
      const arr30DaysBefore = data.filter((obs) => {
        const isBeforeToday = new Date(obs.date) <= this.today;
        const isAfterLastDay30 = new Date(obs.date) >= this.lastDay30;
        if (isBeforeToday && isAfterLastDay30) return true;
        return false;
      });
      this.obsFiltered = arr30DaysBefore;

      this.options = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none',
          },
          formatter: function (params: any) {
            return params[0].data + ' ';
          },
        },
        xAxis: {
          type: 'category',
          data: arr30DaysBefore.map((obs) => obs.date),
          axisLabel: {
            interval: 0, // This forces displaying all labels
            rotate: 45, // Optional: you can rotate labels to prevent overlapping
          },
        },
        yAxis:{
          name: this.translate.instant('overview.barChart.yAxis'),
          nameLocation: 'middle',
          nameGap: 35,
          type: 'value'
        },
        series: [
          {
            data: arr30DaysBefore.map((obs) => obs.count),
            type: 'bar',
          },
        ],
      };
      this.myChart.hideLoading();

      this.options && this.myChart.setOption(this.options);
    });
  }
}
