import { Component, Input, WritableSignal, inject } from '@angular/core';

import { MapService } from '../../service/map.service';

@Component({
  selector: 'app-map-layers',
  templateUrl: './map-layers.component.html',
  styleUrl: './map-layers.component.scss',
})
export class MapLayersComponent {
  private mapService = inject(MapService);

  @Input() showMapLayers?: WritableSignal<boolean>;
  layerId: string = 'light-v10';

  toggleLayerVisibility(layerId: string) {
    this.mapService.map.setStyle('mapbox://styles/mapbox/' + layerId);
  }
}
