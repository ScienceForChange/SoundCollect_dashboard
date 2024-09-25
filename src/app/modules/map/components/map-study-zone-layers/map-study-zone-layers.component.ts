import { StudyZone } from './../../../../models/study-zone.d';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  WritableSignal,
  inject,
} from '@angular/core';

import { MapService } from '../../service/map.service';
import { StudyZoneService } from '../../../../services/study-zone/study-zone.service';
import { Subscription } from 'rxjs';
import { ObservationsService } from '../../../../services/observations/observations.service';

@Component({
  selector: 'app-map-study-zone-layers',
  templateUrl: './map-study-zone-layers.component.html',
  styleUrl: './map-study-zone-layers.component.scss',
})
export class MapZoneStudyLayersComponent implements OnInit, OnDestroy {
  private mapService = inject(MapService);
  private studyZoneService = inject(StudyZoneService);
  private observationsService = inject(ObservationsService);
  private subscriptions = new Subscription();
  studyZones: StudyZone[] = [];
  studyZonesModel: { [key: number]: boolean }[] = [];

  @Input() showMapLayers?: WritableSignal<boolean>;

  layerId: number = 0;

  ngOnInit(): void {
    this.subscriptions.add(
      this.studyZoneService.studyZones$.subscribe((studyZones) => {
        this.studyZones = studyZones;
        this.studyZonesModel = studyZones.map((studyZone) => ({
          [studyZone.id]: false,
        }));
      })
    );
  }
  trackById(index: number, item: any): number {
    return item.id;
  }

  toggleLayerVisibility(layerId: number, e: any) {
    const studyZoneSelected:StudyZone = this.studyZones.find(
      (studyZone) => studyZone.id === layerId
    );
    if (!e.checked) {
      this.mapService.drawSZPolygonFromId(studyZoneSelected);

      this.mapService.eraseAllSZPolygons();
      console.log(studyZoneSelected);

      let poligonCoordiantes = studyZoneSelected.boundaries.coordinates.map((coo:any) => {
        return `${coo.latitude} ${coo.longitude}`;
      });

      this.observationsService.getObservationsByPolygonAndDates(poligonCoordiantes, [String(studyZoneSelected.start_date), String(studyZoneSelected.end_date)]).subscribe({
        error: (error) => {
          console.error(error);
        }
      });

      return;
    }

    this.observationsService.getAllObservations();

    this.mapService.eraseSZPolygonFromId(studyZoneSelected.id);
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
