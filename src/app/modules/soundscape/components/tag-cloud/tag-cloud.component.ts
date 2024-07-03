import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Observations } from '../../../../models/observations';
import { ObservationsService } from '../../../../services/observations/observations.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import 'chartjs-chart-wordcloud';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-tag-cloud',
  templateUrl: './tag-cloud.component.html',
  styleUrl: './tag-cloud.component.scss'
})
export class TagCloudComponent implements OnInit, OnDestroy{

  private observations!: Observations[];
  private observationsService = inject(ObservationsService);
  private observations$!: Subscription;
  public text!: string;
  public tags!: { [word: string]: number };
  public chart!: Chart;
  ngOnInit() {
    this.observations$ = this.observationsService.observations$.subscribe((observations: Observations[]) => {
      this.observations = observations;
      this.updateCloud();
      this.getTagsFromObservations();
      this.tags = this.getWordFrequency();
      //ordenamos tags por el valor de la frecuencia
      this.tags = _.fromPairs(_.toPairs(this.tags).sort((a:any, b:any) => b[1] - a[1]));
      let canvas = document.getElementById('tagCloud') as HTMLCanvasElement;
      this.chart = new Chart(canvas, {
        type: 'wordCloud',
        data: {
          labels: _.fromPairs(_.toPairs(this.tags).map((value:number, key:string) => key)),
          datasets: [{
            data: _.fromPairs(_.toPairs(this.tags).map((value:number) => value)),
          }]
        },
        options: {
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    });
  }

  private updateCloud(): void {
    // Update the tag cloud
  }

  private getTagsFromObservations(): void{
    this.observations.forEach((obs: Observations) => {
      this.text = this.text + " " + obs.attributes.protection.toLocaleLowerCase();
    })
  }
  getWordFrequency(): { [word: string]: number } {
    const wordsArray = _.words(this.text);

    const wordCount = _.countBy(wordsArray.filter((word: string) => isNaN(Number(word))));
    return wordCount;
  }

  ngOnDestroy() {
    this.observations$.unsubscribe();
  }

}
