import { AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit, inject } from '@angular/core';
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
  selector: 'app-pressure-chart',
  templateUrl: './pressure-chart.component.html',
  styleUrl: './pressure-chart.component.scss'
})
export class PressureChartComponent implements OnInit, OnDestroy{

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.chart.resize();
  }
  private observations!: Observations[];
  private chart: echarts.ECharts;
  private option! : echarts.EChartsCoreOption;
  private observationsService = inject(ObservationsService);
  private translate = inject(TranslateService);
  private observations$!: Subscription;
  public totalObservationTypes:number = 0
  private quietTypesLabel = [
    this.translate.instant('soundscape.pressure.morning'),
    this.translate.instant('soundscape.pressure.afternoon'),
    this.translate.instant('soundscape.pressure.night')
  ];
  private dBLevels = ['< = 35', '35-40', '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80', '> 80'];

  ngOnInit(): void {
    let chartDom = document.getElementById('pressureChart')!;
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
      bottom: 50
    };

    const series = this.quietTypesLabel.map((name, sid) => {
      return {
        name,
        type: 'bar',
        stack: 'total',
        barWidth: '60%',
        label: {
          show: false,
          formatter: (params:any) =>{
            return `${params.value} (${Math.round((params.value / this.observations.length) * 1000) / 10}%)`;
          }
        },
        data: rawData[sid]
      }
    });

    this.option = {
      title: {
        subtext: this.translate.instant('soundscape.pressure.hourRange'),
        left: 'center',
      },
      grid,
      legend: {
        selectedMode: true,
        top:40
      },
      xAxis: {
        name: 'dBA',
        nameLocation: 'middle',
        nameGap: 35,
        type: 'category',
        data: this.dBLevels,
        nameTextStyle:{
          fontSize: 15,
          fontWeight:600
        }
      },
      yAxis: {
        name: this.translate.instant('soundscape.pressure.obsNumber'),
        nameLocation: 'middle',
        nameGap: 35,
        type: 'value',
        nameTextStyle:{
          fontSize: 15,
          fontWeight:600
        }
      },
      tooltip: {
        color: true,
        axisPointer: {
          type: 'shadow',
        },
        formatter: function(params:any) {
          var content = `<b>${params.seriesName}</b><br/>`;
          content += params.name + ' dBA<br/>';
          content += params.value + ' observacions';
          return content;
        }
      },
      series
    };

    this.chart.setOption(this.option);
  }

  private getDataFromObservations(): number[][] {
    let dBLevels:number[][] = [];

    for (let i = 0; i < this.quietTypesLabel.length; ++i) {
      let dBArrayToPush = Array.from({length: this.dBLevels.length}, () => 0);
      dBLevels.push(dBArrayToPush);
    };
    this.observations.forEach(obs => {
      const date = new Date(obs.attributes.created_at).getHours();
      if(date >= 7 && date < 19){
        dBLevels[0][this.getIndexOfdBLevel(Number(obs.attributes.Leq))]++;
      }
      if(date >= 19 && date < 23){
        dBLevels[1][this.getIndexOfdBLevel(Number(obs.attributes.Leq))]++;
      }
      if(date >= 23 || date < 7){
        dBLevels[2][this.getIndexOfdBLevel(Number(obs.attributes.Leq))]++;
      }
    });
    return dBLevels;
  }

  getIndexOfdBLevel(dBLevel:number):number {

    if(dBLevel <= 35) return 0;
    if(dBLevel > 35 && dBLevel <= 40) return 1;
    if(dBLevel > 40 && dBLevel <= 45) return 2;
    if(dBLevel > 45 && dBLevel <= 50) return 3;
    if(dBLevel > 50 && dBLevel <= 55) return 4;
    if(dBLevel > 55 && dBLevel <= 60) return 5;
    if(dBLevel > 60 && dBLevel <= 65) return 6;
    if(dBLevel > 65 && dBLevel <= 70) return 7;
    if(dBLevel > 70 && dBLevel <= 75) return 8;
    if(dBLevel > 75 && dBLevel <= 80) return 9;
    return 10;

  }
  ngOnDestroy(): void {
    this.observations$.unsubscribe();
  }
}
