import { AfterViewInit, Component, HostListener, Input } from '@angular/core';
import { Observations } from '../../../../models/observations';
import * as echarts from 'echarts';

@Component({
  selector: 'app-qualitative-data-chart',
  templateUrl: './qualitative-data-chart.component.html',
  styleUrl: './qualitative-data-chart.component.scss'
})
export class QualitativeDataChartComponent implements AfterViewInit {
  @Input() observations: Observations[];
  private chart: echarts.ECharts;
  public totalObservationTypes:number = 0
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.chart.resize();
  }

  ngAfterViewInit(): void {
    const chartDom = document.getElementById('qualitativeDataChart')!;
    this.chart = echarts.init(chartDom);

    const data = Array.from({ length: 100 }, () => [Math.round((Math.random() * 2 - 1)* 100) / 100, Math.round((Math.random() * 2 - 1)* 100) / 100]);

    const { closePoints, otherPoints } = this.classifyData(data);

    const option = {
      xAxis: {
        min: -1,
        max: 1,
        name: "Nivell d'activitat",
        nameLocation: 'middle',
        nameGap: 35,
      },
      yAxis: {
        min: -1,
        max: 1,
        name: "Nivell d'agradabilitat",
        nameLocation: 'middle',
        nameGap: 35,
      },
      tooltip: {
        position: 'top'
      },
      series: [
        {
          name: 'Activitat / Agradabilitat',
          type: 'scatter',
          data: [...closePoints, ...otherPoints],
          encode: { tooltip: [0, 1] },
          symbolSize: 20,
          itemStyle: {
         //   color: 'blue'
          },
          markArea: {
            silent: true,
            itemStyle: {
              color: 'rgba(128, 128, 128, 0)'
            },
            data: [
              [{
                coord: [
                  Math.min(...closePoints.map(p => p[0])),
                  Math.min(...closePoints.map(p => p[1]))
                ]
              },
              {
                coord: [
                  Math.max(...closePoints.map(p => p[0])),
                  Math.max(...closePoints.map(p => p[1]))
                ]
              }]
            ]
          }
        },
        //{
        //  name: 'Other Points',
        //  type: 'scatter',
        //  data: otherPoints,
        //  encode: { tooltip: [0, 1] },
        //  symbolSize: 20,
        //  itemStyle: {
        //  //  color: 'red'
        //  }
        //}
      ]
    };

    this.chart.setOption(option);
  }


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
