import { AfterViewInit, Component, inject, Input, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent } from 'echarts/components';

import { Observations } from '../../../models/observations';
import energeticAvg from '../../../../utils/energeticAvg';

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
    color: '#FF7A1F',
  };

  public totalObservationTypes: number = 0;
  private hertzLevels: number[] = [];

  ngOnInit(): void {
    echarts.use([
      GridComponent,
      LegendComponent,
      BarChart,
      CanvasRenderer,
      PieChart,
    ]);
    this.hertzLevels =
      this.observationSelected.relationships.segments[0].freq_3;
  }

  private updateYAxis(event: any) {
    let name = this.translate.instant('soundscape.tonalFrequency.presure');
    let isWithPonderationSelected =
      !Object.values(event.selected)[1] && Object.values(event.selected)[0];
    if (isWithPonderationSelected) {
      name = this.translate.instant(
        'soundscape.tonalFrequency.pressurePonderation'
      );
    }
    this.options = {
      ...this.options,
      yAxis: {
        name: name,
        nameLocation: 'middle',
        nameGap: 35,
        type: 'value',
      },
    };
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
        },
      ];

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

  private calculateDataFromObservations(): { ponderation: number[]; ponderationc: number[]; noPonderation: number[]; } {

    let ponderation: number[] = [];
    let ponderationc: number[] = [];
    let noPonderation: number[] = [];

    const segmentsSpec_3 = this.observationSelected.relationships.segments.map(
      (segment) => segment.spec_3
    );
    const segmentsSpec_3_dB = this.observationSelected.relationships.segments.map(
      (segment) => segment.spec_3_dB
    );
    const segmentsSpec_3_dBC = this.observationSelected.relationships.segments.map(
      (segment) => segment.spec_3_dBC
    );

    if (!segmentsSpec_3[0] || !segmentsSpec_3_dB[0] || !segmentsSpec_3_dBC[0]) {
      return { ponderation, ponderationc, noPonderation };
    } else {
      for (let i = 0; i < this.hertzLevels.length; i++) {
        const spec_3_at_idx     = segmentsSpec_3.map((segment) => segment[i]);
        const spec_3_dB_at_idx  = segmentsSpec_3_dB.map((segment) => segment[i]);
        const spec_3_dBC_at_idx = segmentsSpec_3_dBC.map((segment) => segment[i]);

        const energeticAvgNoPond  = energeticAvg(spec_3_dB_at_idx);
        const energeticAvgPond    = energeticAvg(spec_3_at_idx);
        const energeticAvgPondC   = energeticAvg(spec_3_dBC_at_idx);

        noPonderation.push(energeticAvgNoPond);
        ponderation.push(energeticAvgPond);
        ponderationc.push(energeticAvgPondC);
      }

      return { ponderation, ponderationc, noPonderation };
    }
  }
}
