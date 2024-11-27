import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
} from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { CallbackDataParams } from 'echarts/types/dist/shared';

import { Observations } from '../../../../models/observations';
import { ObservationsService } from '../../../../services/observations/observations.service';

import calculateStandardDeviation from '../../../../../utils/standardDeviation';
import roundTwoLastDecimals from '../../../../../utils/twoDecimalsRounded';

type EChartsOption = echarts.ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | BarSeriesOption
>;

interface ObsData {
  min: number;
  max: number;
  average: number;
  standardDeviation: number;
  numOfObs: number;
}

const typeOfData: { [key: string]: string } = {
  SHARPNESS: 'sharpness_S',
  ROUGHNESS: 'roughtness_R',
  LOUDNESS: 'loudness_N',
  FLUCTUATION_STRENGTH: 'fluctuation_strength_F',
};

const typeOfUnits: { [key: string]: string } = {
  SHARPNESS: 'acum',
  ROUGHNESS: 'asper',
  LOUDNESS: 'Sone',
  FLUCTUATION_STRENGTH: 'Vacil',
};

const typeOfDataTranslated: { [key: string]: string } = {
  SHARPNESS: 'soundscape.physcoAcustic.types.sharpness',
  ROUGHNESS: 'soundscape.physcoAcustic.types.roughtness',
  LOUDNESS: 'soundscape.physcoAcustic.types.loudness',
  FLUCTUATION_STRENGTH: 'soundscape.physcoAcustic.types.fluctuationStrenght',
};

@Component({
  selector: 'app-phychoacustics',
  templateUrl: './phychoacustics.component.html',
  styleUrl: './phychoacustics.component.scss',
})
export class PhychoacusticsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private translations = inject(TranslateService);

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.myChart.resize();
  }
  private observationsSubject =  new BehaviorSubject<Observations[]>([]);
  @Input() set filteredObs(value: Observations[]) {
    this.observationsSubject.next(value);
  }
  private observations: Observations[];
  private myChart!: echarts.ECharts;
  private options: EChartsOption;
  private loadingOptions = {
    text: this.translations.instant('app.loading'),
    color: '#00FFBF',
  };
  private data: ObsData[] = [];
  private subscriptions = new Subscription();


  //definimos la diferencia minima entre max y min para que la barra sea visible si los valores minimos y maximos son iguales
  minDiff:number = 0.05;

  public selectedType: string = 'SHARPNESS';
  public buttonOptions: { value: string; label: string }[] = [
    {
      value: 'SHARPNESS',
      label: this.translations.instant(
        'soundscape.physcoAcustic.types.sharpness'
      ),
    },
    {
      value: 'ROUGHNESS',
      label: this.translations.instant(
        'soundscape.physcoAcustic.types.roughtness'
      ),
    },
    {
      value: 'LOUDNESS',
      label: this.translations.instant(
        'soundscape.physcoAcustic.types.loudness'
      ),
    },
    {
      value: 'FLUCTUATION_STRENGTH',
      label: this.translations.instant(
        'soundscape.physcoAcustic.types.fluctuationStrenght'
      ),
    },
  ];

  ngOnInit() {
    echarts.use([
      TitleComponent,
      TooltipComponent,
      GridComponent,
      LegendComponent,
      BarChart,
      CanvasRenderer,
    ]);
    const obsSubscription = this.observationsSubject.subscribe(
      (observations: Observations[]) => {
        try {
          this.observations = observations;
          if (this.myChart) {
            this.updateChart(observations);
          }
        } catch (error) {
          console.error(error);
          throw Error(
            'Error at temporal-evolution-sound-level-chart.component.ts: ' +
              error
          );
        }
      }
    );
    this.subscriptions.add(obsSubscription);
  }

  public updateType() {
    /*
    *   definimos la diferencia minima entre max y min para que la barra sea visible
    *   si los valores minimos y maximos son iguales en funcion del tipo de dato seleccionado
    */
    if(this.selectedType === 'LOUDNESS'){
      this.minDiff = 0.8;
    }else if(this.selectedType === 'FLUCTUATION_STRENGTH'){
      this.minDiff = 0.0001;
    }else if(this.selectedType === 'ROUGHNESS'){
      //TODO: pendiente de confirmar
    }else{
      this.minDiff = 0.05;
    }
    // actualizamos el grafico
    this.updateChart(this.observations);
  }

  private updateChart(observations: Observations[]) {
    this.myChart.showLoading('default', this.loadingOptions);
    const dataFiltered = observations.filter((observation) => {
      //Have to filter because some data is null or "null"
      const isObsAttribute = (observation.attributes as { [key: string]: any })[
        typeOfData[this.selectedType]
      ];
      const isObsAttributeNotStringNull = isObsAttribute !== 'null';
      if (isObsAttribute && isObsAttributeNotStringNull) return true;
      return false;
    });
    const data = this.groupObsByHours(dataFiltered);

    console.log(data);
    this.options = {
      ...this.options,
      yAxis: {
        name:
          this.translations.instant(typeOfDataTranslated[this.selectedType]) +
          ' (' +
          typeOfUnits[this.selectedType] +
          ')',
      },
      series: [
        {
          name: 'Placeholder',
          type: 'bar',
          stack: 'Total',
          silent: true,
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent',
          },
          emphasis: {
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent',
            },
          },
          // Si los valores son iguales, se resta el valor minimo para que la barra sea visible
          data: data.map((obsData) => obsData.min === obsData.max && obsData.numOfObs > 0 ? obsData.min - (this.minDiff/2) : obsData.min),
        },
        {
          name: this.translations.instant(
            typeOfDataTranslated[this.selectedType]
          ),
          type: 'bar',
          stack: 'Total',
          // Si los valores son iguales, se suma el valor minimo para que la barra sea visible
          data: data.map((obsData) => obsData.min === obsData.max && obsData.numOfObs > 0 ? this.minDiff/2 : obsData.max - obsData.min),
        },
      ],
    };
    this.myChart.hideLoading();
    this.myChart.setOption(this.options);
  }

  private groupObsByHours(observations: Observations[]): ObsData[] {

    const groupByHours = observations.reduce(
      (acc: { [key: number]: number[] }, observation) => {
        const hour = new Date(observation.attributes.created_at).getHours();
        const obsValue = (observation.attributes as { [key: string]: any })[
          typeOfData[this.selectedType]
        ];
        if (!acc[hour]) {
          acc[hour] = [+obsValue];
        } else {
          acc[hour].push(+obsValue);
          //Put the smallest value first
          acc[hour].sort((a, b) => a - b);
        }
        return acc;
      },
      {}
    );

    //Adding rest of the hours with empty values
    for (let hour = 1; hour <= 24; hour++) {
      if (!groupByHours.hasOwnProperty(hour)) {
        groupByHours[hour] = [];
      }
    }

    const data = Object.keys(groupByHours).map((hour) => {
      const numericHour = Number(hour);
      if (groupByHours[numericHour].length === 0)
        return {
          min: 0,
          max: 0,
          average: 0,
          standardDeviation: 0,
          numOfObs: 0,
        };
      const minimum = groupByHours[numericHour][0];
      const maximum =
        groupByHours[numericHour][groupByHours[numericHour].length - 1];
      const average =
        groupByHours[numericHour].reduce((acc, value) => {
          return +acc + +value;
        }, 0) / groupByHours[numericHour].length;
      const standardDeviation = calculateStandardDeviation(
        groupByHours[numericHour]
      );
      return {
        min: roundTwoLastDecimals(minimum),
        max: roundTwoLastDecimals(maximum),
        average: roundTwoLastDecimals(average),
        standardDeviation: roundTwoLastDecimals(standardDeviation),
        numOfObs: groupByHours[numericHour].length,
      };
    });

    this.data = data;
    return data;
  }

  ngAfterViewInit() {
    const chartDom = document.getElementById('phychoacustic-chart-container');
    this.myChart = echarts.init(chartDom);
    this.myChart.showLoading('default', this.loadingOptions);

    const hours = Array.from({ length: 24 }, (_, i) =>
      i.toString().padStart(2, '0')
    );

    const dataFiltered = this.observations.filter((observation) => {
      //Have to filter because some data is null or "null"
      const isObsAttribute = (observation.attributes as { [key: string]: any })[
        typeOfData[this.selectedType]
      ];
      const isObsAttributeNotStringNull = isObsAttribute !== 'null';
      if (isObsAttribute && isObsAttributeNotStringNull) return true;
      return false;
    });

    const data = this.groupObsByHours(dataFiltered);
    this.options = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          let values: string[] = [];
          let p = params as CallbackDataParams;
          const obsData = this.data[p.dataIndex];
          const hour = p.name + ':00';
          const html = `
            <b>${p.seriesName}</b> <br>
            ${this.translations.instant(
              'soundscape.physcoAcustic.tooltip.hour'
            )}: ${hour} <br>
            ${this.translations.instant(
              'soundscape.physcoAcustic.tooltip.numObs'
            )}: ${obsData.numOfObs} <br>
            Min: ${obsData.min} <br>
            Max: ${obsData.max} <br>
            Av: ${obsData.average} <br>
             ${this.translations.instant(
              'soundscape.physcoAcustic.tooltip.standardDeviation'
            )}: ${obsData.standardDeviation} <br>
            `;
          values.push(html);
          return values.join('<br>');
        },
      },
      xAxis: {
        data: hours,
        name: 'Hores',
        nameGap: 35,
        nameLocation: 'middle',
        nameTextStyle: {
          fontSize: 15,
          fontWeight: 600,
        },
      },
      yAxis: {
        name: this.translations.instant(typeOfDataTranslated[this.selectedType]) + ' (' +  typeOfUnits[this.selectedType] + ')',
        nameLocation: 'middle',
        nameGap: 45,
        nameTextStyle: {
          fontSize: 15,
          fontWeight: 600,
        },
      },
      series: [
        {
          name: 'Placeholder',
          type: 'bar',
          stack: 'Total',
          silent: true,
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent',
          },
          emphasis: {
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent',
            },
          },
          data: data.map((obsData) => obsData.min),
        },
        {
          name: this.translations.instant(
            typeOfDataTranslated[this.selectedType]
          ),
          type: 'bar',
          stack: 'Total',
          data: data.map((obsData) => obsData.max),
        },
      ],
    };
    this.myChart.hideLoading();
    this.myChart.setOption(this.options);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
