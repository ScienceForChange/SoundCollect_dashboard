import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent } from 'echarts/components';
import { EChartsOption } from 'echarts';
import { Observations } from '../../../../models/observations';

import { random } from 'lodash';

@Component({
  selector: 'app-one-third-octave-chart',
  templateUrl: './one-third-octave-chart.component.html',
  styleUrl: './one-third-octave-chart.component.scss',
})
export class OneThirdOctaveChartComponent implements OnInit, AfterViewInit {
  @Input() observationSelected!: Observations;

  private myBarChart!: echarts.ECharts;
  private options!: echarts.EChartsCoreOption;
  private loadingOptions = {
    text: 'Carregant...',
    color: '#FF7A1F',
  };

  public totalObservationTypes:number = 0
  private quietTypesLabel = ['Amb ponderació', 'Sense ponderació'];
  private hertzLevels = [
    '50',
    '63',
    '80',
    '100',
    '125',
    '160',
    '200',
    '250',
    '315',
    '400',
    '500',
    '630',
    '800',
    '1000',
    '1250',
    '1600',
    '2000',
    '2500',
    '3150',
    '4000',
    '5000',
    '6300',
    '8000',
    '10000',
    '12500',
    '16000',
    '20000',
  ];

  ngOnInit(): void {
    echarts.use([
      GridComponent,
      LegendComponent,
      BarChart,
      CanvasRenderer,
      PieChart,
    ]);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      // Access the CSS variable --blue-light
      const rootStyle = getComputedStyle(document.documentElement);
      const blueLightColor = rootStyle
        .getPropertyValue('--blue-light')
        .trim();
      const chartDom = document.getElementById('bar-chart-container');
      this.myBarChart = echarts.init(chartDom);
      this.myBarChart.showLoading('default', this.loadingOptions);

      const rawData:number[][] = this.getDataFromObservations();
      for (let i = 0; i < rawData[0].length; ++i) {
        for (let j:number = 0; j < rawData.length; ++j) {
          this.totalObservationTypes += rawData[j][i];
        }
      }
      const series = this.quietTypesLabel.map((name, sid) => {
        return {
          name,
          type: 'bar',
          label: {
            show: false,
          },
          data: rawData[sid]
        }
      });
      
    const grid = {
      left: 50,
      right: 50,
      top: 100,
      bottom: 80
    };
    this.options = {
      grid,
      legend: {
        selectedMode: true,
        top:40
      },
      xAxis: {
        name: 'Freqüències (Hertz)',
        nameLocation: 'middle',
        nameGap: 55,
        type: 'category',
        data: this.hertzLevels,
        axisLabel: { interval: 0, rotate: 45, fontSize: 10 , margin: 10 }
      },
      yAxis: {
        name: 'Presió sonora dBA',
        nameLocation: 'middle',
        nameGap: 35,
        type: 'value'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          label: {
            show: true
          }
        }
      },
      series

    }
      this.myBarChart.hideLoading();
      this.options && this.myBarChart.setOption(this.options);
    }, 100);
  }

  private getDataFromObservations(): number[][] {
    let dBLevels:number[][] = [];
    let pond: number[] = [];
    let noPond: number[] = [];
    this.hertzLevels.forEach(() => {
      pond.push(random(0,1000));
      noPond.push(random(0,1000));
    });
    dBLevels.push(pond);
    dBLevels.push(noPond);
    return dBLevels;
  }
}
