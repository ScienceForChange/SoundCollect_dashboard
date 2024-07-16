import { Component, HostListener, inject } from '@angular/core';

import { Subscription } from 'rxjs';

import { random } from 'lodash';

import { TranslateService } from '@ngx-translate/core';

import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { LegendComponent } from 'echarts/components';

import { Observations } from '../../../../models/observations';
import { ObservationsService } from '../../../../services/observations/observations.service';

echarts.use([LegendComponent, BarChart, CanvasRenderer,]);

@Component({
  selector: 'app-tonal-frequency-chart',
  templateUrl: './tonal-frequency-chart.component.html',
  styleUrl: './tonal-frequency-chart.component.scss'
})
export class TonalFrequencyChartComponent {

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.chart.resize();
  }
  private observations!: Observations[];
  private chart: echarts.ECharts;
  private option! : echarts.EChartsCoreOption;
  public totalObservationTypes:number = 0
  private observationsService = inject(ObservationsService);
  private translate = inject(TranslateService);
  private observations$!: Subscription;
  private quietTypesLabel = [this.translate.instant('soundscape.tonalFrequency.ponderation'), this.translate.instant('soundscape.tonalFrequency.noPonderation')];
  private hertzLevels = ['50', '63', '80', '100', '125', '160', '200', '250', '315', '400', '500', '630', '800',
                         '1000', '1250', '1600', '2000', '2500', '3150', '4000', '5000', '6300', '8000',
                         '10000', '12500', '16000', '20000'];
  ngOnInit(): void {
    let chartDom = document.getElementById('tonalFrequencyChart')!;
    this.chart = echarts.init(chartDom);
    this.observations$ = this.observationsService.observations$.subscribe((observations: Observations[]) => {
      this.observations = observations;
      this.updateChart();
    });
    this.chart.on('legendselectchanged', this.updateYAxis.bind(this))

  }

  private updateYAxis(event:any){
      let name = this.translate.instant('soundscape.tonalFrequency.presure');
      let isWithPonderationSelected= !Object.values(event.selected)[1] && Object.values(event.selected)[0]
      if(isWithPonderationSelected) name = this.translate.instant('soundscape.tonalFrequency.pressurePonderation')
      this.option = {
        ...this.option,
        yAxis: {
          name: name,
          nameLocation: 'middle',
          nameGap: 35,
          type: 'value',
          //cambiamos el tamaño de la letra
        },
  }
  // Apply the updated options to the chart
  this.chart.setOption(this.option);
  }

  private updateChart(): void {

    const rawData:number[][] = this.getDataFromObservations();

    for (let i = 0; i < rawData[0].length; ++i) {
      for (let j:number = 0; j < rawData.length; ++j) {
        this.totalObservationTypes += rawData[j][i];
      }
    }

    const grid = {
      left: 50,
      right: 50,
      top: 100,
      bottom: 80
    };


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

    this.option = {
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
      series

    }
    this.chart.setOption(this.option);
  }

  private getDataFromObservations(): number[][] {
    let dBLevels:number[][] = [];
    let pond: number[] = [];
    let noPond: number[] = [];
    this.hertzLevels.forEach(() => {
      pond.push(random(20,80));
      noPond.push(random(20,80));
    });
    dBLevels.push(pond);
    dBLevels.push(noPond);
    return dBLevels;
  }

}
