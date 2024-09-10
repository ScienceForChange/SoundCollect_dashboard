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
import { StudyZone } from '../../../../models/study-zone';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map-study-zone-layers',
  templateUrl: './map-study-zone-layers.component.html',
  styleUrl: './map-study-zone-layers.component.scss',
})
export class MapZoneStudyLayersComponent implements OnInit, OnDestroy {
  private mapService = inject(MapService);
  private studyZoneService = inject(StudyZoneService);
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
    const studyZoneSelected = this.studyZones.find(
      (studyZone) => studyZone.id === layerId
    );
    if (!e.checked) {
      this.mapService.drawSZPolygonFromId(studyZoneSelected);
      return;
    }
    this.mapService.eraseSZPolygonFromId(studyZoneSelected.id);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
