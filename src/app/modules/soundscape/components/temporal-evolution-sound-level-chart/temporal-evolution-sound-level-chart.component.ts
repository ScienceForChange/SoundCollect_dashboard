import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnInit,
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

const DAYTIME: { [key: string]: string } = {
  day: 'Dia',
  afternoon: 'Tarda',
  night: 'Nit',
};

@Component({
  selector: 'app-temporal-evolution-sound-level-chart',
  templateUrl: './temporal-evolution-sound-level-chart.component.html',
  styleUrl: './temporal-evolution-sound-level-chart.component.scss',
})
export class TemporalEvolutionSoundLevelChartComponent
  implements OnInit, AfterViewInit
{
  @Input() observations: Observations[];

  private myChart!: echarts.ECharts;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.myChart.resize();
  }
  private options: EChartsOption;
  private initialOptions:EChartsOption;
  private loadingOptions = {
    text: 'Carregant...',
    color: '#FF7A1F',
  };
  public firstDay!: Date;
  public lastDay!: Date;
  public filtersForm!: FormGroup;
  public filterStates = {
    FILTER: 'filter',
    CLEAN: 'clean'
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
    this.firstDay = new Date(this.observations[0].attributes.created_at);
    this.lastDay = new Date(
      this.observations[this.observations.length - 1].attributes.created_at
    );
    this.filtersForm = new FormGroup({
      daysFilterS1: new FormControl([this.firstDay, this.lastDay], []),
      daysFilterS2: new FormControl(undefined, []),
    });

    // Subscribe to form value changes
    this.filtersForm.valueChanges.subscribe((values) => {

        // Check if all form values are true
        const allValuesTrue = Object.values(values).every((value) => {
          // Assuming the value structure is [Date, Date] for daysFilterS1 and possibly undefined for daysFilterS2
          // Adjust the condition based on your actual value structure and requirements
          if (Array.isArray(value)) {
            return value.every((date) => date instanceof Date);
          }
          return value === true; // Adjust this condition based on your needs
        });
  
        // Update filterState based on the check
        this.filterState = allValuesTrue && this.filterStates.FILTER
    });
  }

  public onSubmit(): void {
    const { daysFilterS1, daysFilterS2 } = this.filtersForm.value;

    const obsS1 = this.observations.filter((obs) => {
      const isBefore =
        new Date(obs.attributes.created_at) <= daysFilterS1[1];
      const isAfter =
        new Date(obs.attributes.created_at) >= daysFilterS1[0];
      if (isBefore && isAfter) return true;
      return false;
    });

    const obsS2 = this.observations.filter((obs) => {
      const isBefore =
        new Date(obs.attributes.created_at) <= daysFilterS2[1];
      const isAfter =
        new Date(obs.attributes.created_at) >= daysFilterS2[0];
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
      legend: {
        data: dataLegend,
        inactiveColor: '#777',
      },
      series: series as CandlestickSeriesOption[],
    };

    this.options && this.myChart.setOption(this.options);
  }

  public resetFormToInitialValues(): void {
    // Define initial values or reset to default
    const initialValues: {daysFilterS1: [Date,Date], daysFilterS2:[]} = {
      daysFilterS1: [this.firstDay, this.lastDay],
      daysFilterS2: [],
    };
  
    //Update the form values
    
    this.filtersForm.setValue(initialValues);
    this.filterState = undefined;
      // Set the new options on the chart, making sure to replace the old options
    this.myChart.setOption(this.initialOptions,true);
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
    const AvgByHour: {
      [key: number]: number[];
    } = [];
    //Calculate avg and update de value at groupByHour
    for (const keyOfHours in groupByHour) {
      const data = groupByHour[keyOfHours];
      const avg = data
        .reduce(
          (acc, curr) => {
            return [
              acc[0] + curr[0],
              acc[1] + curr[1],
              acc[2] + curr[2],
              acc[3] + curr[3],
              acc[4] + curr[4],
            ];
            //Have to sum each value of acc array with the curr array
          },
          [0, 0, 0, 0, 0]
        )
        .map((value: number) => parseFloat((value / data.length).toFixed(2)));

      AvgByHour[keyOfHours] = avg;
    }

    //Adding rest of the hours with empty values
    for (let hour = 0; hour <= 24; hour++) {
      if (!AvgByHour.hasOwnProperty(hour)) {
        AvgByHour[hour] = [];
      }
    }

    return Object.values(AvgByHour);
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
    const serieName = isS2 ? 'Serie 2' : 'Serie 1';
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
    const last100Obs = this.observations;

    //Filter falsy values
    const filteredObs = last100Obs.filter((observation) => {
      return (
        +observation.attributes.Leq &&
        +observation.attributes.LAmax &&
        +observation.attributes.L10 &&
        +observation.attributes.L90 &&
        +observation.attributes.LAmin
      );
    });

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
        data: ['Dia Serie 1', 'Tarda Serie 1', 'Nit Serie 1'],
        inactiveColor: '#777',
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          let p = params as CallbackDataParams;
          let values: string[] = [];
          const data = p.data as number[];
          const date = p.name;
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
      },
      yAxis: {},
      series: [
        {
          name: 'Dia Serie 1',
          itemStyle: colors.s1['day'],
          type: 'candlestick',
          data: dayObs,
        },
        {
          name: 'Tarda Serie 1',
          itemStyle: colors.s1['afternoon'],
          type: 'candlestick',
          data: afternoonObs,
        },
        {
          name: 'Nit Serie 1',
          itemStyle: colors.s1['night'],
          type: 'candlestick',
          data: nightObs,
        },
      ],
    };
    this.myChart.hideLoading();
    this.initialOptions = this.options
    this.options && this.myChart.setOption(this.options);
  }
}
