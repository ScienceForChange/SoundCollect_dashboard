import { AfterViewInit, Component, HostListener, Input, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import * as echarts from 'echarts';
import { Observations } from '../../../../models/observations';
import { ObservationsService } from '../../../../services/observations/observations.service';

@Component({
  selector: 'app-qualitative-data-chart',
  templateUrl: './qualitative-data-chart.component.html',
  styleUrl: './qualitative-data-chart.component.scss'
})
export class QualitativeDataChartComponent implements AfterViewInit {

  private chart: echarts.ECharts;
  public totalObservationTypes:number = 0;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.chart.resize();
  }
  private observations!: Observations[];
  private observations$!: Subscription;
  private observationsService = inject(ObservationsService);
  private translate = inject(TranslateService);

  ngAfterViewInit(): void {

    const chartDom = document.getElementById('qualitativeDataChart')!;
    this.chart = echarts.init(chartDom);

    this.observations$ = this.observationsService.observations$.subscribe((observations: Observations[]) => {
      this.observations = observations;
      this.updateChart();
    });

  }
  public updateChart(): void {

    const data = this.getDataFromObservations();
    const { closePoints, otherPoints } = this.classifyData(data);

    const option = {
      xAxis: {
        min: -1,
        max: 1,
        name: this.translate.instant('soundscape.quas.activityLevel'),
        nameLocation: 'middle',
        nameGap: 35,
        nameTextStyle:{
          fontSize: 15,
          fontWeight:600
        }
      },
      yAxis: {
        min: -1,
        max: 1,
        name: this.translate.instant('soundscape.quas.pleasantnessLevel'),
        nameLocation: 'middle',
        nameGap: 35,
        nameTextStyle:{
          fontSize: 15,
          fontWeight:600
        }
      },
      tooltip: {
        position: 'top'
      },
      series: [
        {
          name: this.translate.instant('soundscape.quas.activity&pleasantness'),
          type: 'scatter',
          data: [...closePoints],
          encode: { tooltip: [0, 1] },
          symbolSize: 20,
          itemStyle: {
            color: 'blue'
          },
          // markArea: {
          //   silent: true,
          //   itemStyle: {
          //     color: 'rgba(128, 128, 128, .3)'
          //   },
          //   data: [
          //     [{
          //       coord: [
          //         Math.min(...closePoints.map(p => p[0])),
          //         Math.min(...closePoints.map(p => p[1]))
          //       ]
          //     },
          //     {
          //       coord: [
          //         Math.max(...closePoints.map(p => p[0])),
          //         Math.max(...closePoints.map(p => p[1]))
          //       ]
          //     }]
          //   ]
          // }
        },
        {
         name: 'Other Points',
         type: 'scatter',
         data: otherPoints,
         encode: { tooltip: [0, 1] },
         symbolSize: 20,
         itemStyle: {
           color: 'blue' //'red'
         }
        }
      ]
    };

    this.chart.setOption(option);
  }

  private getDataFromObservations(): number[][] {

    let data = this.observations.map(observation => {
      //TODO: cambiar la condición de pleasant por si el usuario es o no experto
      if(observation.attributes.pleasant !== "N/A"){

        const p:number  = Number(observation.attributes.pleasant);
        const ch:number = Number(observation.attributes.chaotic);
        const v:number  = Number(observation.attributes.vibrant);
        const u:number  = Number(observation.attributes.uneventful);
        const ca:number = Number(observation.attributes.calm);
        const a:number  = Number(observation.attributes.annoying);
        const e:number  = Number(observation.attributes.eventful !== "N/A" ? observation.attributes.eventful : 5);
        const m:number  = Number(observation.attributes.monotonous);

        const cos45:number = Math.cos(45 * Math.PI / 180);

        const activityLevel     = (p - a) + (cos45 * (ca - ch)) + (cos45 * (v - m));
        const pleasantnessLevel = (e - u) + (cos45 * (ch - ca)) + (cos45 * (v - m));

        return [Math.round((activityLevel / 9.657) * 100) / 100, Math.round((pleasantnessLevel / 9.657) * 100) / 100];

      }
      else{
        return [];
        //mockup de datos entre -1 y 1
        return [Math.random() * (1 - (-1)) + (-1), Math.random() * (1 - (-1)) + (-1)];
      }


    });

    return data;

  }

  /* ESTAS FUNCIONES SON PARA DETECTAR EL CUMULO DE PUNTOS Y PINTAR EL AREA
  * FALTA COMPROBAR SI LOS DATOS DEVUELTOS A LA GRAFICA SON LOS CORRECTOS
  */
  // Calcula la distancia euclidiana entre dos puntos
  private calculateDistance(point1: number[], point2: number[]): number {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
  }
  // Clasifica los datos en dos grupos, los más cercanos y los demás
  classifyData(data: number[][]): { closePoints: number[][], otherPoints: number[][] } {
    const distances: { point: number[], sumDistances: number }[] = data.map(point => ({
      point,
      sumDistances: data.reduce((sum, otherPoint) => sum + this.calculateDistance(point, otherPoint), 0)
    }));

    distances.sort((a, b) => a.sumDistances - b.sumDistances);

    const halfLength = Math.ceil(distances.length / 2);
    const closePoints = distances.slice(0, halfLength).map(d => d.point);
    const otherPoints = distances.slice(halfLength).map(d => d.point);

    return { closePoints, otherPoints };
  }

}
