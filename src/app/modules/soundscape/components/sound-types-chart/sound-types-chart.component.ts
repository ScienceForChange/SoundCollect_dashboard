import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';

import { Subscription } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent } from 'echarts/components';

import { __values } from 'tslib';

import { Observations } from '../../../../models/observations';
import { ObservationsService } from '../../../../services/observations/observations.service';

echarts.use([GridComponent, LegendComponent, BarChart, CanvasRenderer,PieChart]);

@Component({
  selector: 'app-sound-types-chart',
  templateUrl: './sound-types-chart.component.html',
  styleUrl: './sound-types-chart.component.scss'
})
export class SoundTypesChartComponent implements OnInit, OnDestroy{

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.chart.resize();
  }
  private observations!: Observations[];
  private chart: echarts.ECharts;
  private option! : echarts.EChartsCoreOption;
  public totalObservationTypes:number = 0
  private observationsService = inject(ObservationsService);
  private translations = inject(TranslateService);
  private observations$!: Subscription;


  ngOnInit(): void {
    let chartDom = document.getElementById('typesChart')!;
    this.chart = echarts.init(chartDom);
    this.observations$ = this.observationsService.observations$.subscribe((observations: Observations[]) => {
      this.observations = observations;
      this.updateChart();
    });
  }

  private updateChart(): void {

    this.totalObservationTypes = 0;
    const data = this.getDataFromObservations();
    const types = data.types.map(type => {
      const typeFormated = type.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, '-')
      return this.translations.instant(`soundscape.soundTypes.${typeFormated}`);
    });

    const rawData = data.cuantity;

    if(rawData.length > 0) {
      for (let i = 0; i < rawData[0].length; ++i) {
        for (let j:number = 0; j < rawData.length; ++j) {
          this.totalObservationTypes += rawData[j][i];
        }
      }
    }
    else{
      this.totalObservationTypes = 0;
    }

    const grid = {
      left: 50,
      right: 50,
      top: 80,
      bottom: 10
    };

    const series = types.map((name, sid) => {
      return {
        name,
        type: 'bar',
        stack: 'total',
        barWidth: '60%',
        label: {
          show: true,
          formatter: (params:any) =>{
            return `${Math.round((params.value / this.totalObservationTypes) * 1000) / 10}%`;
          }
        },
        data: rawData[sid]
      };
    });

    this.option = {
      legend: {
        selectedMode: true
      },
      tooltip: {
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params:any) => {
          return `${params.value} ${this.translations.instant('app.observations').toLowerCase()}`;
        }
      },
      grid,
      yAxis: {
        name: this.translations.instant('soundscape.soundTypes.axisY'),
        nameLocation: 'middle',
        nameGap: 35,
        type: 'value',
        nameTextStyle:{
          fontSize: 15,
          fontWeight:600
        }
      },
      xAxis: {
        type: 'category',
        data: ['']
      },
      series
    };
    this.chart.clear();
    this.chart.setOption(this.option);

  }
  private getDataFromObservations(): {types : string[], cuantity: number[][]} {
    let types:string[] = [];
    let cuantity:number[] = [];
    this.observations.forEach(obs => {
      obs.relationships.types.forEach(type => {
        let index = types.indexOf(type.name);
        if(index === -1) {
          types.push(type.name);
          cuantity.push(1);
        } else {
          cuantity[index] += 1;
        }
      });
    });
    return {types: types, cuantity: cuantity.map(c => [c])};
  }

  ngOnDestroy(): void {
    this.observations$.unsubscribe();
  }

}
