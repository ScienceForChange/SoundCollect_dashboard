import { AfterViewInit, Component, HostListener, Input, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';

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
  private observationsSubject =  new BehaviorSubject<Observations[]>([]);
  @Input() set filteredObs(value: Observations[]) {
    this.observationsSubject.next(value);
  }
  private observations: Observations[];
  private observations$!: Subscription;
  private translate = inject(TranslateService);

  ngAfterViewInit(): void {

    const chartDom = document.getElementById('qualitativeDataChart')!;
    this.chart = echarts.init(chartDom);

    this.observations$ = this.observationsSubject.subscribe((observations: Observations[]) => {
      this.observations = observations;
      this.updateChart();
    });

  }
  public updateChart(): void {

    const data = this.getDataFromObservations();
    const { closePoints, otherPoints, convexHull } = this.classifyData(data);
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
          type: 'custom',
          renderItem: function (params:any, api:any) {
            if (params.context.rendered) {
              return 0;
            }
            params.context.rendered = true;
    
            let points: number[][] = [];
            for (let i = 0; i < convexHull.length; i++) {
              points.push(api.coord(convexHull[i]));
            }
            let color = 'rgba(128, 128, 128, 0.3)';
    
            return {
              type: 'polygon',
              transition: ['shape'],
              shape: {
                points: points
              },
              style: api.style({
                fill: 'rgba(255, 128, 128, 0.3)',
                stroke: 'rgba(255, 128, 128, 1)'
              })
            };
          },
          z: 100000,
          clip: true,
          data: convexHull,

        },
        {
          name: this.translate.instant('soundscape.quas.activity&pleasantness'),
          type: 'scatter',
          data: [...closePoints],
          encode: { tooltip: [0, 1] },
          symbolSize: 10,
          z:1,
          itemStyle: {
            color: 'blue' //'red'
          },
        },
        {
         name: 'Other Points',
         type: 'scatter',
         data: otherPoints,
         encode: { tooltip: [0, 1] },
         symbolSize: 10,
         z:2,
         itemStyle: {
           color: 'blue' //'red'
         }
        },
        
      ],
    };

    this.chart.setOption(option);
  }

  private getDataFromObservations(): number[][] {

    let data = this.observations
      //TODO: cambiar la condición de pleasant por si el usuario es o no experto
      .filter( observation => observation.attributes.pleasant !== "N/A" && observation.attributes.pleasant )
      .map(observation => {
      

        const p:number  = Number(observation.attributes.pleasant);
        const ch:number = Number(observation.attributes.chaotic);
        const v:number  = Number(observation.attributes.vibrant);
        const u:number  = Number(observation.attributes.uneventful);
        const ca:number = Number(observation.attributes.calm);
        const a:number  = Number(observation.attributes.annoying);
        const e:number  = Number(observation.attributes.eventful);
        const m:number  = Number(observation.attributes.monotonous);

        const cos45:number = Math.cos(45 * Math.PI / 180);

        const activityLevel     = (p - a) + (cos45 * (ca - ch)) + (cos45 * (v - m));
        const pleasantnessLevel = (e - u) + (cos45 * (ch - ca)) + (cos45 * (v - m));

        return [Math.round((activityLevel / 9.657) * 100) / 100, Math.round((pleasantnessLevel / 9.657) * 100) / 100];

      }
    );

    return data ;

  }

  /* ESTAS FUNCIONES SON PARA DETECTAR EL CUMULO DE PUNTOS Y PINTAR EL AREA
  * FALTA COMPROBAR SI LOS DATOS DEVUELTOS A LA GRAFICA SON LOS CORRECTOS
  */
  // Calcula la distancia euclidiana entre dos puntos
  private calculateDistance(point1: number[], point2: number[]): number {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
  }
  // Clasifica los datos en dos grupos, los más cercanos y los demás
  classifyData(data: number[][]): { closePoints: number[][], otherPoints: number[][], convexHull: number[][] } {
    const distances: { point: number[], sumDistances: number }[] = data.map(point => ({
      point,
      sumDistances: data.reduce((sum, otherPoint) => sum + this.calculateDistance(point, otherPoint), 0)
    }));

    distances.sort((a, b) => a.sumDistances - b.sumDistances);

    const halfLength = Math.ceil(distances.length / 2);
    const closePoints = distances.slice(0, halfLength).map(d => d.point);
    const otherPoints = distances.slice(halfLength).map(d => d.point);
    const convexHull = this.convexHull(closePoints);


    return { closePoints, otherPoints, convexHull};
  }

  private convexHull(points: number[][]): number[][] {

    const cross = (O: number[], A: number[], B: number[]) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
    const sortPoints = points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const lower = [];
    for (const point of sortPoints) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }
    const upper = [];
    for (const point of sortPoints.slice().reverse()) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }
      upper.push(point);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
  }

}
