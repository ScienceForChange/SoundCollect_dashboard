import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Observations } from '../../../../models/observations';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import * as echarts from 'echarts/core';

interface Survey {
  push(surveyValues: any[]): unknown;
  pleasant: number,
  calm: number,
  vibrant: number,
  chaotic: number,
  uneventful: number,
  annoying: number,
  eventful: number,
  monotonous: number
}

@Component({
  selector: 'app-survey-chart',
  templateUrl: './survey-chart.component.html',
  styleUrl: './survey-chart.component.scss'
})
export class SurveyChartComponent implements OnInit, OnDestroy{

  private chart: echarts.ECharts;
  private option! : echarts.EChartsCoreOption;
  public totalObservationTypes:number = 0
  private translate = inject(TranslateService);
  private observations$!: Subscription;
  private observationsSubject =  new BehaviorSubject<Observations[]>([]);
  @Input() set filteredObs(value: Observations[]) {
    this.observationsSubject.next(value);
  }
  private observations: Observations[];

  ngOnInit(): void {
    let chartDom = document.getElementById('surveyChart')!;
    this.chart = echarts.init(chartDom);
    this.observations$ = this.observationsSubject.subscribe((observations: Observations[]) => {
      this.observations = observations;
      this.updateChart();
    });
  }


  private updateChart(): void {

    //array de colores para 10 observaciones, ningun color se repite ni se acerca al rojo
    let colors = [
      'rgba(0, 166, 172, 0.1)',  // Verde azulado
      'rgba(0, 210, 213, 0.1)',  // Aqua claro
      'rgba(30, 144, 255, 0.1)', // Azul dodger
      'rgba(50, 205, 50, 0.1)',  // Verde lima
      'rgba(147, 112, 219, 0.1)',// Púrpura mediana
      'rgba(255, 215, 0, 0.1)',  // Dorado
      'rgba(138, 43, 226, 0.1)', // Azul violeta
      'rgba(64, 224, 208, 0.1)',// Turquesa
      'rgba(70, 130, 180, 0.1)',// Azul acero
      'rgba(60, 179, 113, 0.1)' // Verde mar medio
    ];    

    const data = this.getDataFromObservations().survey.map((survey, index) => {
      return {
        name: this.translate.instant('soundscape.survey.all'),
        type: 'radar',
        tooltip: {
          trigger: 'observations'
        },
        itemStyle: {
          color: "rgba(30, 144, 255, 0.15)"//colors[index],
        },
        label: null,
        data: [
          {
            value: survey,
            name: 'Actual Spending',
            symbol: 'circle',
            lineStyle: null,
            areaStyle: null,
          }
        ]
      };
    });

    // añadimos la media
    data.push({
      name: this.translate.instant('soundscape.survey.average'),
      type: 'radar',
      tooltip: {
        trigger: 'average'
      },
      itemStyle: {
        color:'#ff917c',            
      },
      label: {
        show: true,
        formatter: function (params:any) {
          //devolvemos el dato redondeado a 2 decimales
          return  Math.round(params.value * 100) / 100;
        },
        backgroundColor: '#ff917c',
        borderRadius: 5,
        padding: 5,
        color: '#000',
      },
      data: [
        {
          value: this.getDataFromObservations().average,
          name: 'Actual Spending',
          symbol: 'circle',
          lineStyle: {
            color: '#ff917c',
          },
          areaStyle: {
            color: 'rgba(255, 145, 124, 0.2)',

          }
        }
      ],
    });

    let min = 0;
    let max = 5;

    this.option = {

      legend: {
        data: [this.translate.instant('soundscape.survey.average'), this.translate.instant('soundscape.survey.all')],
        icon: ['roundRect'],        
      },
      radar: {
        indicator: [
          { name: this.translate.instant('soundscape.survey.eventful'),   min: min, max: max },
          { name: this.translate.instant('soundscape.survey.vibrant'),    min: min, max: max },
          { name: this.translate.instant('soundscape.survey.pleasant'),   min: min, max: max },
          { name: this.translate.instant('soundscape.survey.calm'),       min: min, max: max },
          { name: this.translate.instant('soundscape.survey.uneventful'), min: min, max: max },
          { name: this.translate.instant('soundscape.survey.monotonous'), min: min, max: max },
          { name: this.translate.instant('soundscape.survey.annoying'),   min: min, max: max },
          { name: this.translate.instant('soundscape.survey.chaotic'),    min: min, max: max },
        ]
      },
      series: data
    };

    this.chart.setOption(this.option);
  }

  private getDataFromObservations(): {survey: number[][], average: number[]} {
    // filtrar las observaciones de expertos
    let expertObservations = this.observations.filter(observation => observation.relationships.user.attributes.is_expert === true);
    

    let survey = expertObservations.filter(observation => observation.attributes.calm !== "N/A" && observation.attributes.calm !== null).map(observation => 
      {
        return [
          Number(observation.attributes.pleasant),
          Number(observation.attributes.calm),
          Number(observation.attributes.vibrant),
          Number(observation.attributes.chaotic),
          Number(observation.attributes.uneventful),
          Number(observation.attributes.annoying),
          Number(observation.attributes.eventful),
          Number(observation.attributes.monotonous),
        ];
      }
    );

    // calculamos la media de las encuestas
    let average = survey.reduce((acc, survey) => {
      return acc.map((value, index) => value + survey[index]);
    }, [0, 0, 0, 0, 0, 0, 0, 0]).map(value => value / survey.length);

    return {survey: survey,average: average};
  }

  ngOnDestroy(): void {
    this.observations$.unsubscribe();
  }
}
