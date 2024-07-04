import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { Observations } from '../../../../models/observations';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent } from 'echarts/components';
import { ObservationsService } from '../../../../services/observations/observations.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

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
      this.translations.instant('soundscape.perception.dirty'),
      this.translations.instant('soundscape.perception.clean'),
      this.translations.instant('soundscape.perception.veryClean')
    ],
    [
      this.translations.instant('soundscape.perception.notAccessible'),
      this.translations.instant('soundscape.perception.accessible'),
      this.translations.instant('soundscape.perception.veryAccessible')
    ],
    [
      this.translations.instant('soundscape.perception.notSafe'),
      this.translations.instant('soundscape.perception.safe'),
      this.translations.instant('soundscape.perception.verySafe')
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

    this.observations.forEach(obs => {
      if(Number(obs.attributes.quiet)){
        quiet[Number(obs.attributes.quiet) - 1] ++;
      }

      if(Number(obs.attributes.cleanliness) && Number(obs.attributes.cleanliness) <= 3){
        cleanliness[Number(obs.attributes.cleanliness) - 1] ++;
      }

      if(Number(obs.attributes.accessibility) && Number(obs.attributes.accessibility) <= 3){
        accessibility[Number(obs.attributes.accessibility) - 1]++;
      }

      if(Number(obs.attributes.safety) && Number(obs.attributes.safety) <= 3){
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
