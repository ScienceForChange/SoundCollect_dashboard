import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Observations } from '../../../../models/observations';
import { ObservationsService } from '../../../../services/observations/observations.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import * as echarts from 'echarts/core';
import { number } from 'echarts';

interface Survey {
  push(surveyValues: any[]): unknown;
  pleasant: number,
  calm: number,
  vibrant: number,
  chaotic: number,
  uneventful: number,
  annoying: number,
  eventfull: number,
  monotonous: number
}

@Component({
  selector: 'app-survey-chart',
  templateUrl: './survey-chart.component.html',
  styleUrl: './survey-chart.component.scss'
})
export class SurveyChartComponent implements OnInit, OnDestroy{

  private survey!: Survey;
  private chart: echarts.ECharts;
  private option! : echarts.EChartsCoreOption;
  public totalObservationTypes:number = 0
  private observationsService = inject(ObservationsService);
  private translations = inject(TranslateService);
  private observations$!: Subscription;


  ngOnInit(): void {
    let chartDom = document.getElementById('surveyChart')!;
    this.chart = echarts.init(chartDom);
    this.observations$ = this.observationsService.observations$.subscribe((observations: Observations[]) => {
      this.updateChart();
    });
  }

  private updateChart(): void {

    const data = this.getDataFromObservations();

    this.option = {
      title: {
        text: 'Basic Radar Chart'
      },
      legend: {
        data: ['Allocated Budget', 'Actual Spending']
      },
      radar: {
        // shape: 'circle',
        indicator: [
          { name: 'pleasant' },
          { name: 'calm' },
          { name: 'vibrant' },
          { name: 'chaotic' },
          { name: 'uneventful' },
          { name: 'annoying' },
          { name: 'eventfull' },
          { name: 'monotonous' }
        ]
      },
      series: [
        {
          name: 'Budget vs spending',
          type: 'radar',
          data: [
            {
              value: [4200, 3000, 20000, 35000, 50000, 18000],
              name: 'Allocated Budget'
            },
            {
              value: [5000, 14000, 28000, 26000, 42000, 21000],
              name: 'Actual Spending'
            }
          ]
        }
      ]
    };

    this.chart.setOption(this.option);
  }

  private getDataFromObservations(): number[][] {
    let data:any;


    return [];
  }

  ngOnDestroy(): void {
    this.observations$.unsubscribe();
  }
}
