import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { TranslateService } from '@ngx-translate/core';

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

import { ObservationsService } from '../../../../services/observations/observations.service';
import { Subscription } from 'rxjs';

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
export class CatalunyaMapComponent implements OnInit, AfterViewInit, OnDestroy {
  myChart!: echarts.ECharts;
  options: EChartsOption;
  http: HttpClient = inject(HttpClient);
  observationService: ObservationsService = inject(ObservationsService);
  private translate: TranslateService = inject(TranslateService);
  loadingOptions = {
    text: this.translate.instant('app.loading'),
    color: '#FF7A1F',
  };
  private subscriptions = new Subscription();

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
    this.subscriptions.add(
      this.observationService
        .getAllObservationsByRegion()
        .subscribe(({ values, geojson }) => {
          echarts.registerMap('CATALUNYA', geojson);
          const max = Math.max(...values.map((v: any) => v.value));
          const min = Math.min(...values.map((v: any) => v.value));
          this.options = {
            title: {
              text: this.translate.instant('overview.cataloniaMap.regions'),
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
              text: [
                this.translate.instant('overview.cataloniaMap.moreObs'),
                this.translate.instant('overview.cataloniaMap.lessObs'),
              ],
              calculable: true,
            },
            toolbox: {
              show: false,
            },
            series: [
              {
                name: this.translate.instant('overview.cataloniaMap.obsNumber'),
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
        })
    );
    this.options && this.myChart.setOption(this.options);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
