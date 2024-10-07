import { Component, Input, OnInit, WritableSignal, inject } from '@angular/core';

import { MapService } from '../../service/map.service';
import { Feature } from '@turf/turf';

import { environment } from './../../../../../environments/environment.development';
import { MapLayer } from '../../../../models/map';



@Component({
  selector: 'app-map-layers',
  templateUrl: './map-layers.component.html',
  styleUrl: './map-layers.component.scss',
})
export class MapLayersComponent implements OnInit {
  private mapService = inject(MapService);

  environment = environment;

  mapLayers : MapLayer[] = [];

  ngOnInit(): void {
    this.mapService.mapLayers.subscribe({
      next: (mapLayers) => {
        this.mapLayers = mapLayers;
      }
    }
    );
  }

  @Input() showMapLayers?: WritableSignal<boolean>;
  layerId: string = 'light-v10';

  toggleLayerVisibility(layerId: string) {
    this.mapService.map.setStyle('mapbox://styles/mapbox/' + layerId);
  }

  addGPGKLayers(event: any): void {
    this.mapService.addGeoJson(event.originalEvent.body as {type: string; features: Feature<GeoJSON.Geometry, { [name: string]: any; }>[], name: string}[]);
  }

  toggleGPGKLayerVisibility(id: number): void {
    alert('toggleLayerVisibility');
  }
}
