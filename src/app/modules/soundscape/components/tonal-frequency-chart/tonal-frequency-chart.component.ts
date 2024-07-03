import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { Observations } from '../../../../models/observations';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent } from 'echarts/components';
import { ObservationsService } from '../../../../services/observations/observations.service';
import { Subscription } from 'rxjs';
import { random } from 'lodash';
import { number } from 'echarts';

echarts.use([GridComponent, LegendComponent, BarChart, CanvasRenderer,PieChart]);

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
  private observations$!: Subscription;
  private quietTypesLabel = ['Amb ponderació', 'Sense ponderació'];
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
        barWidth: '40%',
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
        color: true,
        axisPointer: {
          type: 'shadow',
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
      pond.push(random(0,1000));
      noPond.push(random(0,1000));
    });
    dBLevels.push(pond);
    dBLevels.push(noPond);
    return dBLevels;
  }

}
