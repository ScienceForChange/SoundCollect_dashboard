import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption } from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { CallbackDataParams } from 'echarts/types/dist/shared';

import { ObservationsService } from '../../../../services/observations/observations.service';
import { ObservationsDataChart } from '../../../../models/observations';
import { Subscription } from 'rxjs';

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | BarSeriesOption
>;

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnInit, AfterViewInit, OnDestroy {
  private translate = inject(TranslateService);
  private observationService: ObservationsService = inject(ObservationsService);
  private subscriptions = new Subscription();

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
  };
  private daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const today = new Date();
    const firstDayOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + 1 + i)
    );
    return firstDayOfWeek.toLocaleDateString(this.translate.currentLang, {
      weekday: 'long',
    });
  });
  private observations: ObservationsDataChart[] = [];
  public obsFiltered: ObservationsDataChart[] = [];
  public today: Date = new Date();
  public timeFilterSelected: string = this.timesFilter.DELETE;
  public minDate!: Date;
  private lastDay30: Date = new Date(
    new Date().setDate(new Date().getDate() - 30)
  );
  private loadingOptions = {
    text: this.translate.instant('app.loading'),
    color: '#FF7A1F',
  };
  public filtersForm!: FormGroup

  ngOnInit(): void {
    echarts.use([GridComponent, BarChart, CanvasRenderer]);

    this.filtersForm = new FormGroup({
      daysFilter: new FormControl([this.lastDay30, this.today], []),
    });
    //To be able to compare days without hours
    this.today.setHours(0, 0, 0, 0);
    this.lastDay30.setHours(0, 0, 0, 0);

      this.filtersForm.valueChanges.subscribe(
        (values: { daysFilter: [Date, Date | null] }) => {
          const haveTwoDaysSelected = values.daysFilter[1] !== null;
          if (haveTwoDaysSelected) {
            this.obsFiltered = this.observations.filter((obs) => {
              const isBeforeToday = obs.completeDay <= values.daysFilter[1];
              const isAfterLastDay30 = obs.completeDay >= values.daysFilter[0];
              if (isBeforeToday && isAfterLastDay30) return true;
              return false;
            });
            const dataXaxis = this.getFirstDayOfEachMonth(this.obsFiltered);
            const dataSerie = this.obsFiltered.map((obs) => obs.count);

            this.updateChart(dataXaxis, dataSerie);
            this.timeFilterSelected = this.timesFilter.DELETE;
          }
        }
      )

      this.observationService.getAllObservationsFormated().subscribe((data) => {
        this.minDate = data[0].completeDay;
      })
  }

  private updateChart(xAxis: string[], serieData: number[]) {
    this.options = {
      xAxis: {
        type: 'category',
        data: xAxis,
      },
      series: [
        {
          data: serieData,
          type: 'bar',
        },
      ],
    };
    this.myChart.setOption(this.options);
  }

  private currentWeek(date: Date) {
    const day = new Intl.DateTimeFormat('ca', { weekday: 'long' }).format(date);
    return day;
  }

  public timeFilter(filter: string) {
    try {
      //Get obs filtered by the days selected
      const values = this.filtersForm.value;
      const obsFiltered = this.observations.filter((obs) => {
        const isBeforeToday = obs.completeDay <= values.daysFilter[1];
        const isAfterLastDay30 = obs.completeDay >= values.daysFilter[0];
        if (isBeforeToday && isAfterLastDay30) return true;
        return false;
      });
      let filteredObsByTime = obsFiltered;
      let dataXaxis: string[] = [];
      let dataSerie: number[] = [];
      if (filter !== this.timesFilter.DELETE) {
        if (filter === this.timesFilter.WEEK) {
          const daysOfWeekSelected = obsFiltered.reduce((acc, curr) => {
            if (acc.includes(this.currentWeek(curr.completeDay))) return acc;
            return [...acc, this.currentWeek(curr.completeDay)];
          }, []);
          const series = daysOfWeekSelected.map((day) => {
            const groupOfDaySelected = obsFiltered.filter(
              (obs) => this.currentWeek(obs.completeDay) === day
            );
            return groupOfDaySelected.reduce(
              (acc, curr) => acc + curr.count,
              0
            );
          });
          dataXaxis = this.daysOfWeek;
          dataSerie = this.daysOfWeek.map((count) => {
            const index = daysOfWeekSelected.indexOf(count);
            return series[index];
          });
        }
        if (filter === this.timesFilter.MONTH) {
          const months: number[] = obsFiltered.reduce((acc, curr) => {
            const month = curr.completeDay.getMonth();
            if (acc.includes(month)) return acc;
            return [...acc, month];
          }, []);
          dataXaxis = months.map((month) =>
            new Intl.DateTimeFormat('ca-ES', { month: 'long' }).format(
              new Date(0, month)
            )
          );
          dataSerie = months.map((month) => {
            const groupOfMonthsSelected = obsFiltered.filter((obs) => {
              const obsMonth = obs.completeDay.getMonth();
              return obsMonth === month;
            });
            return groupOfMonthsSelected.reduce(
              (acc, curr) => acc + curr.count,
              0
            );
          });
        }
        if (filter === this.timesFilter.YEAR) {
          dataXaxis = obsFiltered.reduce((acc, curr) => {
            const year = curr.completeDay.getFullYear();
            if (acc.includes(year)) return acc;
            return [...acc, year];
          }, []);
          dataSerie = dataXaxis.map((year) => {
            const groupOfYearsSelected = obsFiltered.filter((obs) => {
              const obsMonth = obs.completeDay.getFullYear();
              return obsMonth === +year;
            });
            return groupOfYearsSelected.reduce(
              (acc, curr) => acc + curr.count,
              0
            );
          });
        }
      } else {
        dataXaxis = this.getFirstDayOfEachMonth(filteredObsByTime);
        dataSerie = filteredObsByTime.map((obs) => obs.count);
      }
      this.obsFiltered = filteredObsByTime;
      this.updateChart(dataXaxis, dataSerie);
      this.timeFilterSelected = filter;
    } catch (error) {
      console.error('timeFilter',error)
      throw Error('Error time Filtering', error);
    }
  }

  private getFirstDayOfEachMonth(arr: ObservationsDataChart[]) {
    try {
      const arrOfFirstDays = arr
        .reduce((acc, curr) => {
          const month = curr.completeDay.getMonth();
          const isNextMonth = acc.some(
            (obs) => new Date(obs.completeDay).getMonth() === month
          );
          if (isNextMonth) return [...acc, ''];
          return [...acc, curr];
        }, [])
        .map((obs) => {
          if (obs === '') return '';
          return obs.date;
        });
      return arrOfFirstDays;
    } catch (error) {
      console.error('getFirst',error)
      throw Error('Error getting first day of each month', error);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    const chartDom = document.getElementById('bar-chart-container');
    this.myChart = echarts.init(chartDom);
    this.myChart.showLoading('default', this.loadingOptions);

    this.subscriptions.add(
      this.observationService.getAllObservationsFormated().subscribe((data) => {
        try {
          this.observations = data;
          this.minDate = data[0].completeDay;
          const arr30DaysBefore = data.filter((obs) => {
            const isBeforeToday = obs.completeDay <= this.today;
            const isAfterLastDay30 = obs.completeDay >= this.lastDay30;
            if (isBeforeToday && isAfterLastDay30) return true;
            return false;
          });

          this.obsFiltered = arr30DaysBefore;
          console.log('this.obsFiltered', this.obsFiltered, !this.obsFiltered.length)


          const getFirstDayOfEachMonth =
            this.getFirstDayOfEachMonth(arr30DaysBefore);

          this.options = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'none',
              },
              formatter: (params: CallbackDataParams[]) => {
                if (this.timeFilterSelected === this.timesFilter.DELETE) {
                  return `
                <b>${this.translate.instant(
                  'overview.barChart.tooltip.date'
                )}:</b>${this.obsFiltered[params[0].dataIndex].date} <br>
                <b>${this.translate.instant(
                  'overview.barChart.tooltip.numObs'
                )}:</b> ${params[0].data}
                `;
                }
                return `
                <b>${this.translate.instant(
                  'overview.barChart.tooltip.numObs'
                )}:</b> ${params[0].data}
                `;
              },
            },
            xAxis: [
              {
                type: 'category',
                data: getFirstDayOfEachMonth,
                axisLabel: {
                  interval: 0, // This forces displaying all labels
                  rotate: 45, // Optional: you can rotate labels to prevent overlapping
                },
                position: 'bottom',
              },
            ],
            yAxis: {
              name: this.translate.instant('overview.barChart.yAxis'),
              nameLocation: 'middle',
              nameGap: 35,
              type: 'value',
              nameTextStyle: {
                fontSize: 15,
                fontWeight: 600,
              },
            },
            series: [
              {
                data: arr30DaysBefore.map((obs) => obs.count),
                type: 'bar',
              },
            ],
          };
          this.myChart.hideLoading();

          this.myChart.setOption(this.options);
        } catch (error) {
          console.error('after',error)
          throw Error('Error getting all observations', error);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
