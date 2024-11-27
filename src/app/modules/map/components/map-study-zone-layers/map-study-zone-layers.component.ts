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

  layerId: number | null = null;

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

  toggleLayerVisibility(layerId: number | null, e: any) {

    let studyZoneSelected:StudyZone | undefined = undefined;

    this.mapService.eraseSZPolygonFromId();
    this.mapService.eraseAllSZPolygons();

    if (layerId === null) {
      this.mapService.getAllMapObservations();
      this.mapService.flyToDefaultBbox();
      return;
    }

    this.layerId = layerId;

    studyZoneSelected = this.studyZones.find(
      (studyZone) => studyZone.id === layerId
    );

    this.mapService.drawSZPolygonFromId(studyZoneSelected);
    // fly to study zone polygon
    const bbox = this.getBboxFromPolygon(studyZoneSelected.boundaries.coordinates[0]);
    this.mapService.map.fitBounds(bbox, { padding: { top: 20, bottom: 20, left: 20, right: 20 } });

    let poligonCoordiantes = studyZoneSelected.boundaries.coordinates[0].map((coo:any) => {
      return `${coo[1]} ${coo[0]}`;
    });
    this.mapService.getObservationsByPolygonAndDates(poligonCoordiantes, [String(studyZoneSelected.start_date), String(studyZoneSelected.end_date)]);
  }

  private getBboxFromPolygon(polygon: Number[][]): [[number, number], [number, number]] {
    const points = polygon.map((p: any) => [p[1], p[0]]);
    let minX: number = 0,
      maxX: number = 0,
      minY: number = 0,
      maxY: number = 0;

    points.forEach((p, i) => {
      if (i === 0) {
        minX = maxX = p[0];
        minY = maxY = p[1];
      } else {
        minX = Math.min(p[0], minX);
        minY = Math.min(p[1], minY);
        maxX = Math.max(p[0], maxX);
        maxY = Math.max(p[1], maxY);
      }
    });

    return [
      [minX, minY],
      [maxX, maxY],
    ];
  }

  showModal(id:number){
    this.mapService.showStudyZoneModal(id);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.mapService.mapLayers.next([]);
  }
}
