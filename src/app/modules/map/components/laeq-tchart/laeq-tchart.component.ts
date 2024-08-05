import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import * as echarts from 'echarts/core';
import { GridComponent, GridComponentOption } from 'echarts/components';
import { LineChart, LineSeriesOption } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import { Observations } from '../../../../models/observations';

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | LineSeriesOption
>;

@Component({
  selector: 'app-laeq-tchart',
  templateUrl: './laeq-tchart.component.html',
  styleUrl: './laeq-tchart.component.scss',
})
export class LAeqTChartComponent implements OnInit, AfterViewInit {
  private translations = inject(TranslateService);

  @Input() observationSelected!: Observations;

  private myLineChart!: echarts.ECharts;
  private options: EChartsOption;
  private loadingOptions = {
    text: this.translations.instant('app.loading'),
    color: '#FF7A1F',
  };

  ngOnInit(): void {
    echarts.use([
      GridComponent,
      LineChart,
      CanvasRenderer,
      UniversalTransition,
    ]);
  }
  ngAfterViewInit(): void {
      setTimeout(() => {
        // Access the CSS variable --blue-light
        const rootStyle = getComputedStyle(document.documentElement);
        const blueLightColor = rootStyle
          .getPropertyValue('--blue-light')
          .trim();
        const chartDom = document.getElementById('line-chart-container');
        this.myLineChart = echarts.init(chartDom);
        this.myLineChart.showLoading('default', this.loadingOptions);
        let LAeqT:number[] = this.observationSelected.attributes.LAeqT as number[];
        if(typeof LAeqT === 'string'){
         LAeqT = (this.observationSelected.attributes.LAeqT as string).split(',').map(
          (value) => Number(value)
        )
      }
        const seconds = [...Array(LAeqT.length)].map((_, i) => i + 1);

        this.options = {
          xAxis: {
            type: 'category',
            name: this.translations.instant('map.laeqtChart.axisX'),
            nameGap: 35,
            nameLocation: 'middle',
            data: seconds,
            nameTextStyle:{
              fontSize: 15,
              fontWeight:600
            }
          },
          yAxis: {
            type: 'value',
            name: this.translations.instant('map.laeqtChart.axisY'),
            nameGap: 35,
            nameLocation: 'middle',
            nameTextStyle:{
              fontSize: 15,
              fontWeight:600
            }
          },
          series: [
            {
              data: LAeqT,
              type: 'line',
              itemStyle: {
                color: blueLightColor,
              },
              lineStyle: {
                color: blueLightColor,
              },
            },
          ],
        };
        this.myLineChart.hideLoading();
        this.options && this.myLineChart.setOption(this.options);
      }, 100);
  }

}
