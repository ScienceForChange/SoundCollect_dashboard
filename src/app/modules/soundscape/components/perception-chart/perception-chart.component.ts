import { AfterViewInit, Component, HostListener, Input } from '@angular/core';
import { Observations } from '../../../../models/observations';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent } from 'echarts/components';

echarts.use([GridComponent, LegendComponent, BarChart, CanvasRenderer,PieChart]);

@Component({
  selector: 'app-perception-chart',
  templateUrl: './perception-chart.component.html',
  styleUrl: './perception-chart.component.scss'
})
export class PerceptionChartComponent implements AfterViewInit{

  @Input() observations: Observations[];
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.chart.resize();
  }
  private chart: echarts.ECharts;
  private option! : echarts.EChartsCoreOption;
  private data:number[][] = [];
  public pie: number = 0;


  public pieOptions: {value:number, label:string}[] = [
      { value: 0, label: 'Tranquilitat' },
      { value: 1, label: 'Neteja i manteniment' },
      { value: 2, label: 'Accessibilitat' },
      { value: 3, label: 'Seguretat' }
  ];

  private legendsLabels: string[][] = [
    ['Gens tranquil', 'Poc tranquil', 'Moderament tranquil', 'Prou tranquil', 'Molt tranquil'],
    ['Poc net', 'Net', 'Molt net'],
    ['Poc accessible', 'Accessible', 'Molt accessible'],
    ['Poc segur', 'Segur', 'Molt segur'],
  ]

  ngAfterViewInit(): void {
    let chartDom = document.getElementById('perceptionChart')!;
    this.chart = echarts.init(chartDom);
    this.data = this.getDataFromObservations();
    this.updateChart();
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
    let data: number[][] = []

    let quiet: number[] = Array.from({length: this.legendsLabels[0].length}, () => 0);
    let cleaning: number[] = Array.from({length: this.legendsLabels[1].length}, () => 0);
    let accessibility: number[] = Array.from({length: this.legendsLabels[2].length}, () => 0);
    let security: number[] = Array.from({length: this.legendsLabels[3].length}, () => 0);

    this.observations.forEach(obs => {
      if(Number(obs.attributes.quiet)){
        quiet[Number(obs.attributes.quiet) - 1] ++;
      }

      if(Number(obs.attributes.quiet) && Number(obs.attributes.quiet) <= 3){
        cleaning[Number(obs.attributes.quiet) - 1] = cleaning[Number(obs.attributes.quiet) - 1] + 10;
      }

      if(Number(obs.attributes.quiet) && Number(obs.attributes.quiet) <= 3){
        accessibility[Number(obs.attributes.quiet) - 1] = accessibility[Number(obs.attributes.quiet) - 1] + 5;
      }

      if(Number(obs.attributes.quiet) && Number(obs.attributes.quiet) <= 3){
        security[Number(obs.attributes.quiet) - 1] = security[Number(obs.attributes.quiet) - 1] + 2;
      }
    });

    data.push(quiet);
    data.push(cleaning);
    data.push(accessibility);
    data.push(security);

    return data;
  }

}
