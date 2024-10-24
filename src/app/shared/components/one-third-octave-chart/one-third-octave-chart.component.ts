import { AfterViewInit, Component, inject, Input, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent } from 'echarts/components';

import { Observations } from '../../../models/observations';
import { energeticAvg, energeticSum, testEnergeticSum } from '../../../../utils/energeticAvg';
import { get } from 'lodash';

@Component({
  selector: 'app-one-third-octave-chart',
  templateUrl: './one-third-octave-chart.component.html',
  styleUrl: './one-third-octave-chart.component.scss',
})
export class OneThirdOctaveChartComponent implements OnInit, AfterViewInit {
  private translate = inject(TranslateService);

  @Input() observationSelected!: Observations;

  private myBarChart!: echarts.ECharts;
  private options!: echarts.EChartsCoreOption;
  private loadingOptions = {
    text: this.translate.instant('app.loading'),
    color: '#00FFBF',
  };

  public totalObservationTypes: number = 0;
  private hertzLevels: Array<number|string> = [];

  ngOnInit(): void {
    echarts.use([
      GridComponent,
      LegendComponent,
      BarChart,
      CanvasRenderer,
      PieChart,
    ]);
    if(this.observationSelected){
      let xArray: any[] = [...this.observationSelected.relationships.segments[0].freq_3];
      xArray.push(this.translate.instant('soundscape.tonalFrequency.global'));
      this.hertzLevels = xArray;
    }
  }

  private updateYAxis(event:any){
    let name = this.translate.instant('soundscape.tonalFrequency.presure');
    this.hertzLevels[this.hertzLevels.length - 1] = '';
    this.options = {...this.options, yAxis: {name: name, nameLocation: 'middle', nameGap: 35, type: 'value'}}
    // Apply the updated options to the chart
    this.myBarChart.setOption(this.options);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const chartDom = document.getElementById('bar-chart-container');
      this.myBarChart = echarts.init(chartDom);
      this.myBarChart.showLoading('default', this.loadingOptions);
      this.myBarChart.on('legendselectchanged', this.updateYAxis.bind(this));

      const seriesData: {
        noPonderation: number[];
        ponderation: number[];
        ponderationc: number[];
      } = this.calculateDataFromObservations();

      const series = [
        {
          name: this.translate.instant('soundscape.tonalFrequency.ponderation'),
          type: 'bar',
          label: {
            show: false,
          },
          data: seriesData.noPonderation,
        },
        {
          name: this.translate.instant('soundscape.tonalFrequency.noPonderation'),
          type: 'bar',
          label: {
            show: false,
          },
          data: seriesData.ponderation,
        },
        {
          name: this.translate.instant('soundscape.tonalFrequency.ponderation-c'),
          type: 'bar',
          label: {
            show: false,
          },
          data: seriesData.ponderationc,
        }
      ];
      series[1].data.push(Number(this.observationSelected.attributes.Leq));

      const grid = {
        left: 50,
        right: 50,
        top: 100,
        bottom: 80,
      };
      this.options = {
        grid,
        legend: {
          selectedMode: true,
          top: 40,
        },
        xAxis: {
          name: this.translate.instant('soundscape.tonalFrequency.frequency'),
          nameLocation: 'middle',
          nameGap: 55,
          type: 'category',
          data: this.hertzLevels,
          axisLabel: { interval: 0, rotate: 45, fontSize: 10, margin: 10 },
          nameTextStyle: {
            fontSize: 15,
            fontWeight: 600,
          },
        },
        yAxis: {
          name: ` ${this.translate.instant('soundscape.tonalFrequency.presure')} ${this.translate.instant('soundscape.tonalFrequency.ponderation')} ${this.translate.instant('soundscape.tonalFrequency.noPonderation')} ${this.translate.instant('soundscape.tonalFrequency.ponderation-c')} `,
          nameLocation: 'middle',
          nameTextStyle:{
            fontSize: 15,
            fontWeight:600
          },
          nameGap: 35,
          type: 'value'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            label: {
              show: true,
            },
          },
        },
        series,
      };

      this.myBarChart.hideLoading();
      this.myBarChart.setOption(this.options);
    }, 100);
  }

  private calculateDataFromObservations(): { ponderation: number[]; ponderationc: number[]; noPonderation: number[] } {

    let ponderation: number[] = [];
    let ponderationc: number[] = [];
    let noPonderation: number[] = [];

    const segmentsSpec_3      = this.observationSelected.relationships.segments.map((segment) => segment.spec_3);
    const segmentsSpec_3_dB   = this.observationSelected.relationships.segments.map((segment) => segment.spec_3_dB);
    const segmentsSpec_3_dBC  = this.observationSelected.relationships.segments.map((segment) => segment.spec_3_dBC);
    
    if (!segmentsSpec_3[0] || !segmentsSpec_3_dB[0] || !segmentsSpec_3_dBC[0]) {
      return { ponderation, ponderationc, noPonderation };
    }
    else {
      for (let i = 0; i < this.hertzLevels.length - 1; i++) {
        const spec_3_at_idx       = segmentsSpec_3.map((segment) => segment[i]);
        const spec_3_dB_at_idx    = segmentsSpec_3_dB.map((segment) => segment[i]);
        const spec_3_dBC_at_idx   = segmentsSpec_3_dBC.map((segment) => segment[i]);

        const energeticAvgNoPond  = energeticSum(spec_3_dB_at_idx);
        const energeticAvgPond    = energeticSum(spec_3_at_idx);
        const energeticAvgPondC   = energeticSum(spec_3_dBC_at_idx);

        noPonderation.push(Math.trunc(energeticAvgNoPond * 10) / 10);
        ponderation.push(Math.trunc(energeticAvgPond * 10) / 10);
        ponderationc.push(Math.trunc(energeticAvgPondC * 10) / 10);
      }
      
      // separamos los valores de cada segmento en un array ordenado por frecuencia
      const segment_total_spec_3_at_idx = this.observationSelected.relationships.segments.map((segment) => segment.spec_3);
      const segment_total_spec_3_dB_at_idx = this.observationSelected.relationships.segments.map((segment) => segment.spec_3_dB);
      const segment_total_spec_3_dBC_at_idx = this.observationSelected.relationships.segments.map((segment) => segment.spec_3_dBC);

      // obtenemos la suma energetica de cada segmento
      const total_spec_3_at_idx = segment_total_spec_3_at_idx.map((segment) => energeticSum(segment));
      const total_spec_3_dB_at_idx = segment_total_spec_3_dB_at_idx.map((segment) => energeticSum(segment));
      const total_spec_3_dBC_at_idx = segment_total_spec_3_dBC_at_idx.map((segment) => energeticSum(segment));

      // obtenemos la suma energetica de todos los segmentos
      noPonderation.push(Math.trunc(energeticSum(total_spec_3_at_idx) * 10) / 10);
      ponderation.push(Math.trunc(energeticSum(total_spec_3_dB_at_idx) * 10) / 10);
      ponderationc.push(Math.trunc(energeticSum(total_spec_3_dBC_at_idx) * 10) / 10);

      return { ponderation, ponderationc, noPonderation };
    }

  }

}
