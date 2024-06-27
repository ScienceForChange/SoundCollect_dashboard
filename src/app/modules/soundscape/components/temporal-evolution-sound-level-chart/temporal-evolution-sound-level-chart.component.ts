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

type EChartsOption = echarts.ComposeOption<
  | GridComponentOption
  | CandlestickSeriesOption
  | LegendComponentOption
  | DataZoomComponentOption
  | TooltipComponentOption
>;
// type Unified<T> = Exclude<T, T[]>
// type TooltipFormatterCallback = Exclude<NonNullable<TooltipComponentOption['formatter']>, string>
// // single and multiple params
// type TooltipFormatterParams = Parameters<TooltipFormatterCallback>[0]
// // single params
// type SingleTooltipFormatterParams = Unified<TooltipFormatterParams>
// // multiple params
// type MultipleTooltipFormatterParams = SingleTooltipFormatterParams[]


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
    // const firstDate = this.observations[0].attributes.created_at;
    // const lastDate =
    //   this.observations[this.observations.length - 1].attributes.created_at;
    // // const hoursBetween = (new Date(lastDate).getTime() - new Date(firstDate).getTime())/ (1000 * 3600)
    // console.log(
    //   'firstDate',
    //   firstDate,
    //   new Date(firstDate).getTime(),
    //   new Date(new Date(firstDate).getTime())
    // );
    // console.log('lastDate', lastDate, new Date(lastDate).getTime());
    // // console.log('diff', Math.ceil(hoursBetween))
  }

  tooltipCallback(params: CallbackDataParams[]):string {
    let values: string[] = []
    params.forEach((param) => {
      const data = param.data as number[]
      const name = param.seriesName
      const date = param.name
      const LAmax = data[0]
      const L10 = data[1]
      const L90 = data[2]
      const LAmin = data[3]
      const Leq = data[4]
      const html = `
      Hora: ${date} <br>
      LAeq: ${Leq} <br>
      L10: ${L10} <br>
      L90: ${L90} <br>
      LAmin: ${LAmin} <br>
      LAmax: ${LAmax} <br>
      `
      values.push(html)
    })
    return values.join('<br>')
  }


  ngAfterViewInit(): void {
    const chartDom = document.getElementById('candelstick-chart-container');
    this.myChart = echarts.init(chartDom);
    this.myChart.showLoading('default', this.loadingOptions);
    const last100Obs = this.observations.slice(-100);
    const dates = last100Obs.map(
      (observation) => observation.attributes.created_at
    );
    const soundLevelsByTime: {
      day: string[][];
      afternoon: string[][];
      night: string[][];
    } = {
      day: [],
      afternoon: [],
      night: [],
    };

    last100Obs.forEach((observation) => {
      const hour = new Date(observation.attributes.created_at).getHours();
      if (hour >= 7 && hour <= 19) {
        soundLevelsByTime.day.push([
          observation.attributes.LAmax,
          observation.attributes.L10,
          observation.attributes.L90,
          observation.attributes.LAmin,
          observation.attributes.Leq,
        ]);
        return;
      }
      if (hour >= 20 && hour <= 23) {
        soundLevelsByTime.afternoon.push([
          observation.attributes.LAmax,
          observation.attributes.L10,
          observation.attributes.L90,
          observation.attributes.LAmin,
          observation.attributes.Leq,
        ]);
        return;
      }
      if (hour >= 0 && hour <= 6) {
        soundLevelsByTime.night.push([
          observation.attributes.LAmax,
          observation.attributes.L10,
          observation.attributes.L90,
          observation.attributes.LAmin,
          observation.attributes.Leq,
        ]);
        return;
      }
    });

    this.options = {
      legend: {
        data: ['Dia', 'Tarda', 'Nit'],
        inactiveColor: '#777',
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          // const ids = params.map(candel => candel.data[5]);
          let p = params as CallbackDataParams[]
          let values: string[] = [];
          p.forEach((param) => {
            const data = param.data as number[];
            const date = param.name;
            const LAmax = data[0];
            const L10 = data[1];
            const L90 = data[2];
            const LAmin = data[3];
            const Leq = data[4];
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
        data: dates,
      },
      yAxis: {},
      series: [
        {
          name: 'Dia',
          type: 'candlestick',
          itemStyle:{
            color: '#F8766D',
            color0: '#F8766D',
            borderColor: '#F8766D',
            borderColor0: '#F8766D',
          },
          data: soundLevelsByTime.day,
        },
        {
          name: 'Tarda',
          itemStyle:{
            color: '#00BA38',
            color0: '#00BA38',
            borderColor: '#00BA38',
            borderColor0: '#00BA38',
          },
          type: 'candlestick',
          data: soundLevelsByTime.afternoon,
        },
        {
          name: 'Nit',
          itemStyle:{
            color: '#FF61CC',
            color0: '#FF61CC',
            borderColor: '#FF61CC',
            borderColor0: '#FF61CC',
          },
          type: 'candlestick',
          data: soundLevelsByTime.afternoon,
        },
      ],
    };
    this.myChart.hideLoading();

    this.options && this.myChart.setOption(this.options);
  }
}
