import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import type { Observations } from '../../../../models/observations';

import * as echarts from 'echarts/core';
import {
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
  DataZoomComponent,
  DataZoomComponentOption,
  TooltipComponent,
  TooltipComponentOption,
} from 'echarts/components';
import { CandlestickChart, CandlestickSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { SeriesOption } from 'echarts';
import energeticAvg from '../../../../../utils/energeticAvg';
import { ObservationsService } from '../../../../services/observations/observations.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

type EChartsOption = echarts.ComposeOption<
  | GridComponentOption
  | CandlestickSeriesOption
  | LegendComponentOption
  | DataZoomComponentOption
  | TooltipComponentOption
>;
interface ColorOptions {
  color: string;
  color0: string;
  borderColor: string;
  borderColor0: string;
}
interface Colors {
  s1: { [key: string]: ColorOptions };
  s2: { [key: string]: ColorOptions };
}

let DAYTIME: { [key: string]: string } = {};

const colors: Colors = {
  s1: {
    day: {
      color: 'rgba(248, 118, 109, 1)',
      color0: 'rgba(248, 118, 109, 1)',
      borderColor: 'rgba(248, 118, 109, 1)',
      borderColor0: 'rgba(248, 118, 109, 1)',
    },
    afternoon: {
      color: 'rgba(0, 186, 56, 1)',
      color0: 'rgba(0, 186, 56, 1)',
      borderColor: 'rgba(0, 186, 56, 1)',
      borderColor0: 'rgba(0, 186, 56, 1)',
    },
    night: {
      color: 'rgba(255, 97, 204, 1)',
      color0: 'rgba(255, 97, 204, 1)',
      borderColor: 'rgba(255, 97, 204, 1)',
      borderColor0: 'rgba(255, 97, 204, 1)',
    },
  },
  s2: {
    day: {
      color: 'rgba(248, 118, 109, 0.2)',
      color0: 'rgba(248, 118, 109, 0.2)',
      borderColor: 'rgba(248, 118, 109, 1)',
      borderColor0: 'rgba(248, 118, 109, 1)',
    },
    afternoon: {
      color: 'rgba(0, 186, 56, 0.2)',
      color0: 'rgba(0, 186, 56, 0.2)',
      borderColor: 'rgba(0, 186, 56, 1)',
      borderColor0: 'rgba(0, 186, 56, 1)',
    },
    night: {
      color: 'rgba(255, 97, 204, 0.2)',
      color0: 'rgba(255, 97, 204, 0.2)',
      borderColor: 'rgba(255, 97, 204, 1)',
      borderColor0: 'rgba(255, 97, 204, 1)',
    },
  },
};

@Component({
  selector: 'app-temporal-evolution-sound-level-chart',
  templateUrl: './temporal-evolution-sound-level-chart.component.html',
  styleUrl: './temporal-evolution-sound-level-chart.component.scss',
})
export class TemporalEvolutionSoundLevelChartComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() observations: Observations[];
  private observationsService = inject(ObservationsService);
  private translations = inject(TranslateService);
  private subscriptions = new Subscription();
  private myChart!: echarts.ECharts;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.myChart.resize();
  }
  private options: EChartsOption;
  private initialOptions: EChartsOption;
  private loadingOptions = {
    text: this.translations.instant('app.loading'),
    color: '#FF7A1F',
  };
  public firstDay!: Date;
  public lastDay!: Date;
  public filtersForm!: FormGroup;
  public filterStates = {
    FILTER: 'filter',
    CLEAN: 'clean',
  };
  public filterState!: string;

  ngOnInit(): void {
    echarts.use([
      GridComponent,
      CandlestickChart,
      CanvasRenderer,
      LegendComponent,
      DataZoomComponent,
      TooltipComponent,
    ]);
    DAYTIME = {
      day: this.translations.instant('soundscape.temporalEvolution.morning'),
      afternoon: this.translations.instant(
        'soundscape.temporalEvolution.afternoon'
      ),
      night: this.translations.instant('soundscape.temporalEvolution.night'),
    };
    const obsSubscription = this.observationsService.observations$.subscribe(
      (observations: Observations[]) => {
        this.observations = observations;
        this.firstDay =  this.observations.length ? new Date(this.observations[0].attributes.created_at) : null
        this.lastDay = this.observations.length ?  new Date(
          this.observations[this.observations.length - 1].attributes.created_at
        ) : null
        // Define initial values or reset to default
        const initialValues: { daysFilterS1: [Date, Date]; daysFilterS2: [] } =
          {
            daysFilterS1: [this.firstDay, this.lastDay],
            daysFilterS2: [],
          };

        if (!this.filtersForm) return;
        //Update min day and max day at form
        this.filtersForm.setValue(initialValues);
        const obsS1: Observations[] = this.observations.filter((obs) => {
          const isBefore = new Date(obs.attributes.created_at) <= this.lastDay;
          const isAfter = new Date(obs.attributes.created_at) >= this.firstDay;
          if (isBefore && isAfter) return true;
          return false;
        });

        this.updateChart(obsS1, []);

      }
    );
    this.subscriptions.add(obsSubscription);

    this.filtersForm = new FormGroup({
      daysFilterS1: new FormControl([this.firstDay, this.lastDay], []),
      daysFilterS2: new FormControl(undefined, []),
    });

    // Subscribe to form value changes
    const formSubscription = this.filtersForm.valueChanges.subscribe(
      (values) => {
        // Check if all form values are true
        const allValuesTrue = Object.values(values).every((value) => {
          // Assuming the value structure is [Date, Date] for daysFilterS1 and possibly undefined for daysFilterS2
          // Adjust the condition based on your actual value structure and requirements
          if (Array.isArray(value)) {
            return value.every((date) => date instanceof Date);
          }
          return value === true;
        });

        // Update filterState based on the check
        this.filterState = allValuesTrue && this.filterStates.FILTER;
      }
    );

    this.subscriptions.add(formSubscription);
  }

  public onSubmit(): void {
    const { daysFilterS1, daysFilterS2 } = this.filtersForm.value;

    const obsS1 = this.observations.filter((obs) => {
      const isBefore = new Date(obs.attributes.created_at) <= daysFilterS1[1];
      const isAfter = new Date(obs.attributes.created_at) >= daysFilterS1[0];
      if (isBefore && isAfter) return true;
      return false;
    });

    const obsS2 = this.observations.filter((obs) => {
      const isBefore = new Date(obs.attributes.created_at) <= daysFilterS2[1];
      const isAfter = new Date(obs.attributes.created_at) >= daysFilterS2[0];
      if (isBefore && isAfter) return true;
      return false;
    });

    this.updateChart(obsS1, obsS2);
    this.filterState = this.filterStates.CLEAN;
  }

  private updateChart(s1: Observations[], s2: Observations[]) {
    const series = [];
    if (s1.length > 0) {
      const soundLevelsByTimeS1 = this.groupObsByTime(s1);
      const dayObsS1 = this.groupObsByHours(soundLevelsByTimeS1.day);
      const afternoonObsS1 = this.groupObsByHours(
        soundLevelsByTimeS1.afternoon
      );
      const nightObsS1 = this.groupObsByHours(soundLevelsByTimeS1.night);
      const dayS1 = this.createSeries(dayObsS1, 'day');
      const afternoonS1 = this.createSeries(afternoonObsS1, 'afternoon');
      const nightS1 = this.createSeries(nightObsS1, 'night');
      series.push(dayS1, afternoonS1, nightS1);
    }
    if (s2.length > 0) {
      const soundLevelsByTimeS2 = this.groupObsByTime(s2);
      const dayObsS2 = this.groupObsByHours(soundLevelsByTimeS2.day);
      const afternoonObsS2 = this.groupObsByHours(
        soundLevelsByTimeS2.afternoon
      );
      const nightObsS2 = this.groupObsByHours(soundLevelsByTimeS2.night);
      const dayS2 = this.createSeries(dayObsS2, 'day', true);
      const afternoonS2 = this.createSeries(afternoonObsS2, 'afternoon', true);
      const nightS2 = this.createSeries(nightObsS2, 'night', true);
      series.push(dayS2, afternoonS2, nightS2);
    }
    const dataLegend = series.map((serie) => serie.name) as string[];
    //Update data chart with the new one
    this.options = {
      ...this.options,
      legend: {
        data: dataLegend,
        inactiveColor: '#777',
      },
      series: series as CandlestickSeriesOption[],
    };


      this.myChart.clear();
      this.myChart.setOption(this.options,true);

  }

  public resetFormToInitialValues(): void {
    // Define initial values or reset to default
    const initialValues: { daysFilterS1: [Date, Date]; daysFilterS2: [] } = {
      daysFilterS1: [this.firstDay, this.lastDay],
      daysFilterS2: [],
    };

    
    //Update the form values
    this.filtersForm.setValue(initialValues);
    this.filterState = undefined;
    //Get the inital observation values
    const obsS1: Observations[] = this.observations.filter((obs) => {
      const isBefore = new Date(obs.attributes.created_at) <= this.lastDay;
      const isAfter = new Date(obs.attributes.created_at) >= this.firstDay;
      if (isBefore && isAfter) return true;
      return false;
    });

    this.updateChart(obsS1, []);
  }

  private groupObsByHours(
    chartObservations: (string | number)[][]
  ): number[][] {
    // Grpoup by hour
    const groupByHour = chartObservations.reduce(
      (acc: { [key: number]: number[][] }, curr) => {
        const hour = new Date(curr[5]).getHours();
        //Extract date of curr to have only array of numbers
        curr.pop();
        if (!acc[hour]) {
          acc[hour] = [curr as number[]];
        }
        acc[hour].push(curr as number[]);
        return acc;
      },
      {}
    );
    const avgByHour: {
      [key: number]: number[];
    } = [];
    //Calculate avg and update de value at groupByHour
    for (const keyOfHours in groupByHour) {
      const data = groupByHour[keyOfHours];
      // Get all values for each hour
      const L90 = data.map((chartObs) => chartObs[0]);
      const L10 = data.map((chartObs) => chartObs[1]);
      const LAmin = data.map((chartObs) => chartObs[2]);
      const LAmax = data.map((chartObs) => chartObs[3]);
      const Leq = data.map((chartObs) => chartObs[4]);
      //Calculate energetic average
      const avgL90 = energeticAvg(L90);
      const avgL10 = energeticAvg(L10);
      const avgLAmin = energeticAvg(LAmin);
      const avgLAmax = energeticAvg(LAmax);
      const avgLeq = energeticAvg(Leq);

      const avg = [avgL90, avgL10, avgLAmin, avgLAmax, avgLeq];

      avgByHour[keyOfHours] = avg;
    }

    //Adding rest of the hours with empty values
    for (let hour = 0; hour <= 24; hour++) {
      if (!avgByHour.hasOwnProperty(hour)) {
        avgByHour[hour] = [];
      }
    }

    return Object.values(avgByHour);
  }

  private groupObsByTime(observations: Observations[]): {
    day: (string | number)[][];
    afternoon: (string | number)[][];
    night: (string | number)[][];
  } {
    const soundLevelsByTime: {
      day: (string | number)[][];
      afternoon: (string | number)[][];
      night: (string | number)[][];
    } = {
      day: [],
      afternoon: [],
      night: [],
    };
    //Order and group by hour of a day.
    observations
      .sort(
        (a, b) =>
          new Date(a.attributes.created_at).getHours() -
          new Date(b.attributes.created_at).getHours()
      )
      .forEach((observation) => {
        const hour = new Date(observation.attributes.created_at).getHours();
        //The order of the first 4 numbers are important
        if (hour >= 7 && hour <= 19) {
          soundLevelsByTime.day.push([
            +observation.attributes.L90,
            +observation.attributes.L10,
            +observation.attributes.LAmin,
            +observation.attributes.LAmax,
            +observation.attributes.Leq,
            observation.attributes.created_at,
          ]);
          return;
        }
        if (hour >= 20 && hour <= 23) {
          soundLevelsByTime.afternoon.push([
            +observation.attributes.L90,
            +observation.attributes.L10,
            +observation.attributes.LAmin,
            +observation.attributes.LAmax,
            +observation.attributes.Leq,
            observation.attributes.created_at,
          ]);
          return;
        }
        if (hour >= 0 && hour <= 6) {
          soundLevelsByTime.night.push([
            +observation.attributes.L90,
            +observation.attributes.L10,
            +observation.attributes.LAmin,
            +observation.attributes.LAmax,
            +observation.attributes.Leq,
            observation.attributes.created_at,
          ]);
          return;
        }
      });
    return soundLevelsByTime;
  }

  private createSeries(
    obs: number[][],
    type: string,
    isS2?: boolean
  ): SeriesOption {
    const color = isS2 ? colors.s2[type] : colors.s1[type];
    const name = DAYTIME[type];
    const serieName = isS2
      ? this.translations.instant('soundscape.temporalEvolution.serie2')
      : this.translations.instant('soundscape.temporalEvolution.serie1');
    const serie = {
      name: name + ' ' + serieName,
      itemStyle: color,
      type: 'candlestick',
      data: obs,
    };
    return serie as SeriesOption;
  }

  ngAfterViewInit(): void {
    const chartDom = document.getElementById('candelstick-chart-container');
    this.myChart = echarts.init(chartDom);
    this.myChart.showLoading('default', this.loadingOptions);

    //Podría probar aquí el actualizar y suscribir a las observaciones. Lo que estoy haciendo en el ngOnInit.
    //Filter falsy values
    const filteredObs = this.observations.filter((observation) => {
      return (
        +observation.attributes.Leq &&
        +observation.attributes.LAmax &&
        +observation.attributes.L10 &&
        +observation.attributes.L90 &&
        +observation.attributes.LAmin
      );
    });
    this.observations = filteredObs;

    const hours = Array.from({ length: 24 }, (_, i) =>
      i.toString().padStart(2, '0')
    );

    //Order and group by hour of a day.
    const soundLevelsByTime = this.groupObsByTime(filteredObs);
    const dayObs = this.groupObsByHours(soundLevelsByTime.day);
    const afternoonObs = this.groupObsByHours(soundLevelsByTime.afternoon);
    const nightObs = this.groupObsByHours(soundLevelsByTime.night);

    this.options = {
      legend: {
        data: [
          this.translations.instant(
            'soundscape.temporalEvolution.morningSerie1'
          ),
          this.translations.instant(
            'soundscape.temporalEvolution.afternoonSerie1'
          ),
          this.translations.instant('soundscape.temporalEvolution.nightSerie1'),
        ],
        inactiveColor: '#777',
        orient: 'horizontal', // Lay out the legend items horizontally
        left: 'center', // Center align the legend
        top: '0', // Position the legend at the bottom of the chart
        width: '350px', // Adjust the width to control when items wrap to the next line
        itemGap: 20, // Adjust the gap between legend items
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          let p = params as CallbackDataParams;
          let values: string[] = [];
          const data = p.data as number[];
          const date = p.name+':00';
          const L90 = data[1];
          const L10 = data[2];
          const LAmin = data[3];
          const LAmax = data[4];
          const Leq = data[5];
          const html = `
            <b>${p.seriesName}</b> <br>
            Hora: ${date} <br>
            LAeq: ${Leq} <br>
            L10: ${L10} <br>
            L90: ${L90} <br>
            LAmin: ${LAmin} <br>
            LAmax: ${LAmax} <br>
            `;
          values.push(html);
          return values.join('<br>');
        },
        axisPointer: {
          animation: false,
          type: 'cross',
          lineStyle: {
            color: '#376df4',
            width: 2,
            opacity: 1,
          },
        },
      },
      xAxis: {
        data: hours,
        name: this.translations.instant('soundscape.temporalEvolution.hours'),
        nameGap: 35,
        nameLocation: 'middle',
      },
      yAxis: {
        name: this.translations.instant(
          'soundscape.temporalEvolution.pressureLevel'
        ),
        nameLocation: 'middle',
        nameGap: 35,
      },
      series: [
        {
          name: this.translations.instant(
            'soundscape.temporalEvolution.morningSerie1'
          ),
          itemStyle: colors.s1['day'],
          type: 'candlestick',
          data: dayObs,
        },
        {
          name: this.translations.instant(
            'soundscape.temporalEvolution.afternoonSerie1'
          ),
          itemStyle: colors.s1['afternoon'],
          type: 'candlestick',
          data: afternoonObs,
        },
        {
          name: this.translations.instant(
            'soundscape.temporalEvolution.nightSerie1'
          ),
          itemStyle: colors.s1['night'],
          type: 'candlestick',
          data: nightObs,
        },
      ],
    };
    this.myChart.hideLoading();
    this.initialOptions = this.options;
    this.options && this.myChart.setOption(this.options);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
