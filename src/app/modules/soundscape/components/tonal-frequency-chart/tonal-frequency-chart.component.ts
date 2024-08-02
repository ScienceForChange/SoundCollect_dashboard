import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { random } from 'lodash';

import { TranslateService } from '@ngx-translate/core';

import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { LegendComponent } from 'echarts/components';

import { Observations } from '../../../../models/observations';
import { ObservationsService } from '../../../../services/observations/observations.service';
import energeticAvg from '../../../../../utils/energeticAvg';

echarts.use([LegendComponent, BarChart, CanvasRenderer,]);

@Component({
  selector: 'app-tonal-frequency-chart',
  templateUrl: './tonal-frequency-chart.component.html',
  styleUrl: './tonal-frequency-chart.component.scss'
})
export class TonalFrequencyChartComponent implements OnInit, OnDestroy {
  private observationsService = inject(ObservationsService);
  private translate = inject(TranslateService);

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.chart.resize();
  }
  private observations!: Observations[];
  private chart: echarts.ECharts;
  private options! : echarts.EChartsCoreOption;
  public totalObservationTypes:number = 0
  private observations$!: Subscription;
  private hertzLevels: number[] = [];

  ngOnInit(): void {
    let chartDom = document.getElementById('tonalFrequencyChart')!;
    this.chart = echarts.init(chartDom);

    this.observations$ = this.observationsService.observations$.subscribe((observations: Observations[]) => {
      //Filter because we only want observations with segments thath have value
      this.observations = observations.filter((obs) => {
        if(obs.relationships.segments.length === 0) return false;
        return obs.relationships.segments[0].spec_3 || obs.relationships.segments[0].spec_3_dB;
      });
      if(this.observations.length !== 0){
        this.hertzLevels = this.observations[0].relationships.segments[0].freq_3;
      }
      this.updateChart();
    });

    this.chart.on('legendselectchanged', this.updateYAxis.bind(this))
  }

  private updateYAxis(event:any){
      let name = this.translate.instant('soundscape.tonalFrequency.presure');
      let isWithPonderationSelected= !Object.values(event.selected)[1] && Object.values(event.selected)[0]
      if(isWithPonderationSelected) name = this.translate.instant('soundscape.tonalFrequency.pressurePonderation')
      this.options = {
        ...this.options,
        yAxis: {
          name: name,
          nameLocation: 'middle',
          nameGap: 35,
          type: 'value',
        },
  }
  // Apply the updated options to the chart
  this.chart.setOption(this.options);
  }

  private updateChart(): void {

    const grid = {
      left: 50,
      right: 50,
      top: 100,
      bottom: 80
    };


    const seriesData: {
      ponderation: number[];
      noPonderation: number[];
    } = this.calculateDataFromObservations();

    const series = [
      {
        name: this.translate.instant(
          'soundscape.tonalFrequency.noPonderation'
        ),
        type: 'bar',
        label: {
          show: false,
        },
        data: seriesData.ponderation,
      },
      {
        name: this.translate.instant('soundscape.tonalFrequency.ponderation'),
        type: 'bar',
        label: {
          show: false,
        },
        data: seriesData.noPonderation,
      },
    ];

    this.options = {
      grid,
      legend: {
        selectedMode: true,
        top:40
      },
      xAxis: {
        name: this.translate.instant('soundscape.tonalFrequency.frequency'),
        nameLocation: 'middle',
        nameTextStyle:{
          fontSize: 15,
          fontWeight:600
        },
        nameGap: 55,
        type: 'category',
        data: this.hertzLevels,
        axisLabel: { interval: 0, rotate: 45, fontSize: 10 , margin: 10 }

      },
      yAxis: {
        name: this.translate.instant('soundscape.tonalFrequency.presure'),
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
            show: true
          }
        }
      },
      series,

    }
    this.chart.hideLoading();
    this.chart.setOption(this.options);
  }

  private calculateDataFromObservations(): {
    ponderation: number[];
    noPonderation: number[];
  } {
    let ponderation: number[] = [];
    let noPonderation: number[] = [];
    const observationsSegmentsSpec_3 = this.observations.map((obs) => obs.relationships.segments).map(
      (segment) => segment.map((segment) => segment.spec_3)
    ).flat()
    const observationsSegmentsSpec_3_dB = this.observations.map((obs) => obs.relationships.segments).map(
      (segment) => segment.map((segment) => segment.spec_3_dB)
    ).flat()

      for (let i = 0; i < this.hertzLevels.length; i++) {
        const spec_3_at_idx = observationsSegmentsSpec_3.map((segment) => segment[i]);
        const spec_3_dB_at_idx = observationsSegmentsSpec_3_dB.map((segment) => segment[i]);

        const energeticAvgNoPond = energeticAvg(spec_3_dB_at_idx);
        const energeticAvgPond = energeticAvg(spec_3_at_idx);

        noPonderation.push(energeticAvgNoPond);
        ponderation.push(energeticAvgPond);
      }

      return { ponderation, noPonderation };
  }

  ngOnDestroy(): void {
    this.observations$.unsubscribe();
  }
}
