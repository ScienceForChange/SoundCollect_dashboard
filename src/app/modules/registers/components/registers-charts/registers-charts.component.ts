import { Component } from '@angular/core';
import { StudyZoneService } from '../../../../services/study-zone.service';
import { Observation } from '../../../../models/observation';
import { OdourHedonicTone, OdourIntensity, OdourTypeData } from '../../../../models/odour-related-data';

interface dataset{
  type: string,
  label: string, //name of observation
  backgroundColor: string,//color of observation
  data: number[] //number of observations of each month and type
}

@Component({
  selector: 'app-registers-charts',
  templateUrl: './registers-charts.component.html',
  styleUrl: './registers-charts.component.scss'
})
export class RegistersChartsComponent {

  public timeFilter: string = 'months'
  public dataTypeFilter: string = 'type';

  public data: {
    labels: string[],
    datasets: dataset[]
  } | null = null;

  options: any;

  private observations: Observation[] = [];
  private types: (OdourTypeData | undefined)[] = [];
  private intensities: (OdourIntensity | undefined)[] = [];
  private hedonicTones: (OdourHedonicTone | undefined)[] = [];
  private firstYear: number = new Date().getFullYear();
  private lastYear: number = 0;

  private colors: {[key: string]: string} = {
    [0]: '#000000',
    [1]: '#FF6633',
    [2]: '#FFB399',
    [3]: '#FF33FF',
    [4]: '#FFFF99',
    [5]: '#00B3E6',
    [6]: '#E6B333',
  }

  constructor( private studyZoneService: StudyZoneService,) { }

  ngOnInit() {

    this.getChartStylesAndData();

    this.studyZoneService.studyZone.subscribe((studyZone) => {
      this.observations = studyZone?.restObservations || [];
      console.log(this.observations.length);

      let episodeObs = studyZone?.episodes.map(
        episode => episode.observations.map(
          observation => observation
        )
      ).flat();
      if(episodeObs) this.observations.push(...episodeObs);
      console.log(this.observations.length);
      this.getStudyZoneTypes();
      this.getIntensities();
      this.getHedonicTones();
      this.getObservationOrderByTypeAndMonth();
    });

  }

  private getChartStylesAndData() {
    const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      this.options = {
          maintainAspectRatio: false,
          aspectRatio: 0.6,
          plugins: {
              tooltip: {
                  mode: 'index',
                  intersect: false
              },
              legend: {
                  labels: {
                      color: textColor
                  }
              }
          },
          scales: {
              x: {
                  stacked: true,
                  ticks: {
                      color: textColorSecondary
                  },
                  grid: {
                      color: surfaceBorder,
                      drawBorder: false
                  }
              },
              y: {
                  stacked: true,
                  ticks: {
                      color: textColorSecondary
                  },
                  grid: {
                      color: surfaceBorder,
                      drawBorder: false
                  }
              }
          }
      };
  }

  public getObservationOrderByTypeAndHourRange() {

    this.data = null;

    let datasets: dataset[] = [];

    let dataType = this.dataTypeFilter === 'type' ? this.types : this.dataTypeFilter === 'intensity' ? this.intensities : this.hedonicTones;

    for(let element of dataType){
      if(!element) continue;
      let dataset: dataset = {
        type: 'bar',
        label: element.name,
        backgroundColor: this.colors[element.id],
        data: Array.from({length: 24}, (x, i) => (
          this.observations.filter(
            (observation) =>
            {
              if(this.dataTypeFilter === 'type')
                return observation.relationships.odourSubType.relationships?.odourType?.id === element?.id
              else if(this.dataTypeFilter === 'intensity')
                return observation.relationships.odourIntensity?.id === element?.id
              else if(this.dataTypeFilter === 'hedonicTone')
                return observation.relationships.odourHedonicTone?.id === element?.id
              return false;
            }
            ).filter(
              observation => new Date(observation.updatedAt).getHours() === i
            ).length
        ))
      }
      datasets.push(dataset);
    }

    this.data = {
      labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      datasets: datasets
    }


  }
  public getObservationOrderByTypeAndMonth() {

    this.data = null;

    let datasets: dataset[] = [];

    let dataType = this.dataTypeFilter === 'type' ? this.types : this.dataTypeFilter === 'intensity' ? this.intensities : this.hedonicTones;

    for(let element of dataType){
      if(!element) continue;
      let dataset: dataset = {
        type: 'bar',
        label: element.name,
        backgroundColor: this.colors[element.id],
        data: Array.from([0,0,0,0,0,0,0,0,0,0,0,0], (x, i) => (
          this.observations.filter(
            (observation) =>
            {
              if(this.dataTypeFilter === 'type')
                return observation.relationships.odourSubType.relationships?.odourType?.id === element?.id
              else if(this.dataTypeFilter === 'intensity')
                return observation.relationships.odourIntensity?.id === element?.id
              else if(this.dataTypeFilter === 'hedonicTone')
                return observation.relationships.odourHedonicTone?.id === element?.id
              return false;
            }
            ).filter(
              observation => new Date(observation.updatedAt).getMonth() === i + 1
              ).length
        ))
      }
      datasets.push(dataset);
    }

    this.data = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: datasets,
    }

  }
  public getObservationOrderByTypeAndSeason(){

      this.data = null;

      let datasets: dataset[] = [];

      let dataType = this.dataTypeFilter === 'type' ? this.types : this.dataTypeFilter === 'intensity' ? this.intensities : this.hedonicTones;

      for(let element of dataType){
        if(!element) continue;
        let dataset: dataset = {
          type: 'bar',
          label: element.name,
          backgroundColor: this.colors[element.id],
          data: Array.from([0,0,0,0], (x, i) => (
            this.observations.filter(
              (observation) =>
              {
                if(this.dataTypeFilter === 'type')
                  return observation.relationships.odourSubType.relationships?.odourType?.id === element?.id
                else if(this.dataTypeFilter === 'intensity')
                  return observation.relationships.odourIntensity?.id === element?.id
                else if(this.dataTypeFilter === 'hedonicTone')
                  return observation.relationships.odourHedonicTone?.id === element?.id
                return false;
              }
              ).filter(
                (observation) => {
                  let date = new Date(observation.updatedAt);
                  let month = date.getMonth();
                  let day = date.getDate();
                  if ((month === 3 && day >= 21) || (month === 4 || month === 5) || (month === 6 && day < 21)) {
                      return i === 0; // Primavera
                  } else if ((month === 6 && day >= 21) || (month === 7 || month === 8) || (month === 9 && day < 23)) {
                      return i === 1; // Verano
                  } else if ((month === 9 && day >= 23) || (month === 10 || month === 11) || (month === 12 && day < 21)) {
                      return i === 2; // Otoño
                  } else {
                      return i === 3; // Invierno
                  }
              }).length
          ))
        }

        datasets.push(dataset);

      }

      this.data = {
        labels: ['Primavera', 'Verano', 'Otoño', 'Invierno'],
        datasets: datasets
      }
  }

  public getObservationOrderByTypeAndYear() {

    this.data = null;

    let datasets: dataset[] = [];

    let dataType = this.dataTypeFilter === 'type' ? this.types : this.dataTypeFilter === 'intensity' ? this.intensities : this.hedonicTones;

    for(let element of dataType){
      if(!element) continue;
      let dataset: dataset = {
        type: 'bar',
        label: element.name,
        backgroundColor: this.colors[element.id],
        data: Array.from({length : this.lastYear - (this.firstYear - 1)} , (x, i) => (
          this.observations.filter(
              (observation) =>
              {
                if(this.dataTypeFilter === 'type')
                  return observation.relationships.odourSubType.relationships?.odourType?.id === element?.id
                else if(this.dataTypeFilter === 'intensity')
                  return observation.relationships.odourIntensity?.id === element?.id
                else if(this.dataTypeFilter === 'hedonicTone')
                  return observation.relationships.odourHedonicTone?.id === element?.id
                return false;
              }
            ).filter(
              observation => new Date(observation.updatedAt).getFullYear() === this.firstYear + i
            ).length
        ))
      }

      datasets.push(dataset);

    }

    this.data = {
      labels: Array.from({length : this.lastYear - (this.firstYear - 1)}, (x, i) => (i + this.firstYear).toString()),
      datasets: datasets
    }

  }

  public getStudyZoneTypes(): void {

    let types = this.observations.map(
      ( observation )=> {
        let year = new Date(observation.updatedAt).getFullYear();
        this.firstYear = Math.min(this.firstYear, year);
        this.lastYear = Math.max(this.lastYear, year);
        return observation.relationships.odourSubType.relationships?.odourType
      }
    );

    this.types = types.filter(
      (v, i, a) => a.findIndex(t => (t?.id === v?.id)) === i
      )

  }

  private getIntensities(): void {
    this.intensities = this.observations.map(
      ( observation )=> observation.relationships.odourIntensity
    ).filter(
      (v, i, a) => a.findIndex(t => (t?.id === v?.id)) === i
    )
  }

  private getHedonicTones(): void {
    this.hedonicTones = this.observations.map(
      ( observation )=> observation.relationships.odourHedonicTone
    ).filter(
      (v, i, a) => a.findIndex(t => (t?.id === v?.id)) === i
    )
  }

  public changeTimeFilter(): void {
    if(this.timeFilter === 'hours'){
      this.getObservationOrderByTypeAndHourRange();
    }
    else if(this.timeFilter === 'months'){
      this.getObservationOrderByTypeAndMonth();
    }
    else if(this.timeFilter === 'seasons'){
      this.getObservationOrderByTypeAndSeason();
    }
    else if(this.timeFilter === 'years'){
      this.getObservationOrderByTypeAndYear();
    }
  }
}