import {
  AfterViewInit,
  Component,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TitleComponentOption,
  ToolboxComponent,
  ToolboxComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  VisualMapComponent,
  VisualMapComponentOption,
  GeoComponent,
  GeoComponentOption,
  DataZoomComponent,
} from 'echarts/components';
import { MapChart, MapSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { HttpClient } from '@angular/common/http';
import { ObservationsService } from '../../../../services/observations/observations.service';

type EChartsOption = echarts.ComposeOption<
  | TitleComponentOption
  | ToolboxComponentOption
  | TooltipComponentOption
  | VisualMapComponentOption
  | GeoComponentOption
  | MapSeriesOption
>;

@Component({
  selector: 'app-catalunya-map',
  templateUrl: './catalunya-map.component.html',
  styleUrl: './catalunya-map.component.scss',
})
export class CatalunyaMapComponent implements OnInit, AfterViewInit {
  myChart!: echarts.ECharts;
  options: EChartsOption;
  http: HttpClient = inject(HttpClient);
  observationService: ObservationsService = inject(ObservationsService);
  loadingOptions = {
    text: 'Carregant...',
    color: '#FF7A1F',
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.myChart.resize();
  }

  ngOnInit(): void {
    echarts.use([
      TitleComponent,
      ToolboxComponent,
      TooltipComponent,
      VisualMapComponent,
      GeoComponent,
      MapChart,
      CanvasRenderer,
      DataZoomComponent,
    ]);
  }

  ngAfterViewInit(): void {
    const chartDom = document.getElementById('chart-container');
    this.myChart = echarts.init(chartDom);
    this.myChart.showLoading('default', this.loadingOptions);
    this.observationService
      .getAllObservationsByRegion()
      .subscribe(({ values, geojson }) => {
        echarts.registerMap('CATALUNYA', geojson);
        const max = Math.max(...values.map((v: any) => v.value));
        const min = Math.min(...values.map((v: any) => v.value));
        this.options = {
          title: {
            text: 'Observacions per comarques',
            left: 'right',
          },
          tooltip: {
            trigger: 'item',
            showDelay: 0,
            transitionDuration: 0.2,
          },
          dataZoom: [{ type: 'inside', disabled: true }],
          visualMap: {
            //Esto es el filtro que aparece abajo a la derecha
            left: 'right',
            min: min,
            max: max,
            inRange: {
              color: [
                '#313695',
                '#4575b4',
                '#74add1',
                '#abd9e9',
                '#e0f3f8',
                '#ffffbf',
                '#fee090',
                '#fdae61',
                '#f46d43',
                '#d73027',
                '#a50026',
              ],
            },
            text: ['Més observacions', 'Menys observacions'],
            calculable: true,
          },
          toolbox: {
            show: false,
          },
          series: [
            {
              name: 'Número de observacions',
              type: 'map',
              roam: false,
              map: 'CATALUNYA',
              emphasis: {
                label: {
                  show: true,
                },
              },
              data: values,
            },
          ],
        };
        this.myChart.hideLoading();
        this.myChart.resize();
        this.myChart.setOption(this.options);
      });
    this.options && this.myChart.setOption(this.options);
  }
}
