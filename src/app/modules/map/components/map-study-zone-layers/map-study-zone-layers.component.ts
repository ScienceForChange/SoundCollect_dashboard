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

  @Input() showMapLayers?: WritableSignal<boolean>;

  layerId: number = 0;

  ngOnInit(): void {
    this.subscriptions.add(
      this.studyZoneService.studyZones$.subscribe((studyZones) => {
        this.studyZones = studyZones;
        console.log('studyZones', studyZones)
      })
    );
  }
  trackById(index: number, item: any): number {
    return item.id;
  }

  toggleLayerVisibility(layerId: number) {
    const studyZoneSelected = this.studyZones.find((studyZone) => studyZone.id === layerId);
    console.log('studyZoneSelected', studyZoneSelected)
    // this.mapService.map.setStyle('mapbox://styles/mapbox/' + layerId);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
