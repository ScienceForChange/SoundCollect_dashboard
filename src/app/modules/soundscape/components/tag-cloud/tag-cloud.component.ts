import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Observations } from '../../../../models/observations';
import { ObservationsService } from '../../../../services/observations/observations.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import 'chartjs-chart-wordcloud';
import { Chart } from 'chart.js';
import { WordCloudController, WordElement } from 'chartjs-chart-wordcloud';

Chart.register(WordCloudController, WordElement);

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
  public tags!: {key: string; value: number;}[];
  public chart!: Chart;
  public stopWords!: string[];

  ngOnInit() {

    fetch('assets/stopWords/ca.json').then(response => response.json()).then(data => {
      this.stopWords = data;
      this.observations$ = this.observationsService.observations$.subscribe((observations: Observations[]) => {
        this.observations = observations;
        this.getTagsFromObservations();
        this.getWordFrequency();
        this.tags = this.tags.sort((a, b) => b.value - a.value).slice(0, 40);
        if(this.tags.length > 0) this.updateCloud();
      });
    });
  }

  private updateCloud(): void {
    const canvas = document.getElementById('tagCloud') as HTMLCanvasElement;
    if(this.chart) this.chart.destroy();
    this.chart = new Chart(canvas.getContext("2d") , {
      type: "wordCloud",
      data: {
        labels: this.tags.map((d) => d.key),
        datasets: [
          {
            label: "",
            data: this.tags.map((d) => d.value * 8)
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    // Update the tag cloud
  }

  private getTagsFromObservations(): void{
    this.observations.forEach((obs: Observations) => {
      this.text = this.text + " " + obs.attributes.protection.toLocaleLowerCase();
    })
  }

  private getWordFrequency(): void {


    const wordsArray = _.words(this.text);
    const wordCount:[string, number][] = Object.entries(
      _.countBy(
        wordsArray
        .filter((word: string) => isNaN(Number(word)))
        .filter((word: string) => !this.stopWords.includes(word))
      )
    );

    this.tags = wordCount.map((word: [string, number]) => {
      return { key: word[0], value: word[1] };
    });
  }

  ngOnDestroy() {
    this.observations$.unsubscribe();
  }

}