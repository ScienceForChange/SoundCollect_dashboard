import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';

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
import { Observations } from '../../../../models/observations';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { valueOrDefault } from 'chart.js/dist/helpers/helpers.core';
import { last, map } from 'rxjs';

type EChartsOption = echarts.ComposeOption<
  | GridComponentOption
  | CandlestickSeriesOption
  | LegendComponentOption
  | DataZoomComponentOption
  | TooltipComponentOption
>;

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
  private loadingOptions = {
    text: 'Carregant...',
    color: '#FF7A1F',
  };

  ngOnInit(): void {
    echarts.use([
      GridComponent,
      CandlestickChart,
      CanvasRenderer,
      LegendComponent,
      DataZoomComponent,
      TooltipComponent,
    ]);
  }

  private groupObsByHours(chartObservations: (string | number)[][]): number[][] {
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

    return Object.values(AvgByHour)
  }

  ngAfterViewInit(): void {
    const chartDom = document.getElementById('candelstick-chart-container');
    this.myChart = echarts.init(chartDom);
    this.myChart.showLoading('default', this.loadingOptions);
    const last100Obs = this.observations.slice(-100);

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
    filteredObs
      .sort(
        (a, b) =>
          new Date(a.attributes.created_at).getHours() -
          new Date(b.attributes.created_at).getHours()
      )
      .forEach((observation) => {
        const hour = new Date(observation.attributes.created_at).getHours();
        if (hour >= 7 && hour <= 19) {
          soundLevelsByTime.day.push([
            +observation.attributes.LAmax,
            +observation.attributes.L10,
            +observation.attributes.L90,
            +observation.attributes.LAmin,
            +observation.attributes.Leq,
            observation.attributes.created_at,
          ]);
          return;
        }
        if (hour >= 20 && hour <= 23) {
          soundLevelsByTime.afternoon.push([
            +observation.attributes.LAmax,
            +observation.attributes.L10,
            +observation.attributes.L90,
            +observation.attributes.LAmin,
            +observation.attributes.Leq,
            observation.attributes.created_at,
          ]);
          return;
        }
        if (hour >= 0 && hour <= 6) {
          soundLevelsByTime.night.push([
            +observation.attributes.LAmax,
            +observation.attributes.L10,
            +observation.attributes.L90,
            +observation.attributes.LAmin,
            +observation.attributes.Leq,
            observation.attributes.created_at,
          ]);
          return;
        }
      });
      const dayObs = this.groupObsByHours(soundLevelsByTime.day)
      const afternoonObs = this.groupObsByHours(soundLevelsByTime.afternoon)
      const nightObs = this.groupObsByHours(soundLevelsByTime.night)




    this.options = {
      legend: {
        data: ['Dia', 'Tarda', 'Nit'],
        inactiveColor: '#777',
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let p = params as CallbackDataParams[];
          let values: string[] = [];
          p.forEach((param) => {
            const data = param.data as number[];
            //No create tooltip for undefined values
            if (data.length === 1) return;
            const date = param.name;
            const LAmax = data[1];
            const L10 = data[2];
            const L90 = data[3];
            const LAmin = data[4];
            const Leq = data[5];
            const html = `
            Hora: ${date} <br>
            LAeq: ${Leq} <br>
            L10: ${L10} <br>
            L90: ${L90} <br>
            LAmin: ${LAmin} <br>
            LAmax: ${LAmax} <br>
            `;
            values.push(html);
          });
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
          name: 'Dia',
          type: 'candlestick',
          itemStyle: {
            color: '#F8766D',
            color0: '#F8766D',
            borderColor: '#F8766D',
            borderColor0: '#F8766D',
          },
          data: dayObs,
        },
        {
          name: 'Tarda',
          itemStyle: {
            color: '#00BA38',
            color0: '#00BA38',
            borderColor: '#00BA38',
            borderColor0: '#00BA38',
          },
          type: 'candlestick',
          data: afternoonObs,
        },
        {
          name: 'Nit',
          itemStyle: {
            color: '#FF61CC',
            color0: '#FF61CC',
            borderColor: '#FF61CC',
            borderColor0: '#FF61CC',
          },
          type: 'candlestick',
          data: nightObs,
        },
      ],
    };
    this.myChart.hideLoading();

    this.options && this.myChart.setOption(this.options);
  }
}
