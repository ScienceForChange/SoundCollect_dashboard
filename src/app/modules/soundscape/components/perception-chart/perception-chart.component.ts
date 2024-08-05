import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';

import { Subscription } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent } from 'echarts/components';

import { Observations } from '../../../../models/observations';
import { ObservationsService } from '../../../../services/observations/observations.service';

echarts.use([GridComponent, LegendComponent, BarChart, CanvasRenderer,PieChart]);

@Component({
  selector: 'app-perception-chart',
  templateUrl: './perception-chart.component.html',
  styleUrl: './perception-chart.component.scss'
})
export class PerceptionChartComponent implements OnInit, OnDestroy{

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.chart.resize();
  }
  private observations!: Observations[];
  private chart: echarts.ECharts;
  private option!: echarts.EChartsCoreOption;
  private data: number[][] = [];
  public pie: number = 0;
  private observationsService = inject(ObservationsService);
  private translations = inject(TranslateService);
  private observations$!: Subscription;

  public pieOptions: {value:number, label:string}[] = [
      { value: 0, label: this.translations.instant('soundscape.perception.quiet') },
      { value: 1, label: this.translations.instant('soundscape.perception.cleanliness') },
      { value: 2, label: this.translations.instant('soundscape.perception.accessibility') },
      { value: 3, label: this.translations.instant('soundscape.perception.safety') }
  ];

  private legendsLabels: string[][] = [
    [
      this.translations.instant('soundscape.perception.notQuiet'),
      this.translations.instant('soundscape.perception.littleQuiet'),
      this.translations.instant('soundscape.perception.lowlyQuiet'),
      this.translations.instant('soundscape.perception.fairlyQuiet'),
      this.translations.instant('soundscape.perception.veryQuiet')
    ],
    [
      this.translations.instant('soundscape.perception.veryBad'),
      this.translations.instant('soundscape.perception.bad'),
      this.translations.instant('soundscape.perception.medium'),
      this.translations.instant('soundscape.perception.good'),
      this.translations.instant('soundscape.perception.verGood')
    ],
    [
      this.translations.instant('soundscape.perception.veryBad'),
      this.translations.instant('soundscape.perception.bad'),
      this.translations.instant('soundscape.perception.medium'),
      this.translations.instant('soundscape.perception.good'),
      this.translations.instant('soundscape.perception.verGood')
    ],
    [
      this.translations.instant('soundscape.perception.veryBad'),
      this.translations.instant('soundscape.perception.bad'),
      this.translations.instant('soundscape.perception.medium'),
      this.translations.instant('soundscape.perception.good'),
      this.translations.instant('soundscape.perception.verGood')
    ]
  ];

  ngOnInit(): void {
    let chartDom = document.getElementById('perceptionChart')!;
    this.chart = echarts.init(chartDom);
    this.observations$ = this.observationsService.observations$.subscribe((observations: Observations[]) => {
      this.observations = observations;
      this.data = this.getDataFromObservations();
      this.updateChart();
    });
  }

  public updateChart(): void {
    this.option = {
      title: {
        text: this.pieOptions[this.pie].label,
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: {
        name: this.pieOptions[this.pie].label,
        type: 'pie',
        radius: '50%',
        data: this.data[this.pie].map((val, index) => ({value: val , name: this.legendsLabels[this.pie][index]})),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    };
    this.chart.setOption(this.option);
  }

  private getDataFromObservations(): number[][] {
    let data: number[][] = [];

    let quiet: number[] = Array.from({length: this.legendsLabels[0].length}, () => 0);
    let cleanliness: number[] = Array.from({length: this.legendsLabels[1].length}, () => 0);
    let accessibility: number[] = Array.from({length: this.legendsLabels[2].length}, () => 0);
    let safety: number[] = Array.from({length: this.legendsLabels[3].length}, () => 0);
    //let numeric = 0;
    //let noNumeric = 0;


    this.observations.forEach(obs => {

      if(Number(obs.attributes.quiet)){
        quiet[Number(obs.attributes.quiet) - 1] ++;
      }


      if(Number(obs.attributes.cleanliness)){
        cleanliness[Number(obs.attributes.cleanliness) - 1] ++;
      }

      if(Number(obs.attributes.accessibility)){
        accessibility[Number(obs.attributes.accessibility) - 1]++;
      }

      if(Number(obs.attributes.safety)){
        safety[Number(obs.attributes.safety) - 1] ++;
      }

    });

    data.push(quiet);
    data.push(cleanliness);
    data.push(accessibility);
    data.push(safety);

    return data;
  }

  ngOnDestroy(): void {
    this.observations$.unsubscribe();
  }

}
