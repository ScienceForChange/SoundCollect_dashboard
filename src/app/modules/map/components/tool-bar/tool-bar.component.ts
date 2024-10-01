import { environment } from './../../../../../environments/environment.development';
import { Component, EventEmitter, inject, Input, Output, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MapService } from '../../service/map.service';
import { FeatureCollection, Geometry } from 'geojson';

@Component({
  selector: 'app-map-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrl: './tool-bar.component.scss',
})
export class MapToolBarComponent {
  @Input() showFilters?: WritableSignal<boolean>;
  @Input() showMapLayers?: WritableSignal<boolean>;
  @Input() showMapStudyZonesLayers?: WritableSignal<boolean>;
  @Input() isFilterActive: boolean = false;
  @Input() isStudyZonesBtnDisbaled: boolean = false;
  @Input() isFilterBtnDisbaled: boolean = true;

  public environment = environment;

  @Output() toggleActiveFilters: EventEmitter<void> = new EventEmitter<void>();

  http = inject(HttpClient);
  mapService = inject(MapService);

  activeFilters(): void {
    this.toggleActiveFilters.emit();
  }

  toggleShowMapLayers(): void {
    this.hideAll();
    this.showMapLayers.set(!this.showMapLayers());
  }

  toggleShowMapStudyZonesLayers(): void {
    this.hideAll();
    this.showMapStudyZonesLayers.set(!this.showMapStudyZonesLayers());
  }

  toggleShowFilters(): void {
    this.hideAll();
    this.showFilters.set(!this.showFilters());
  }

  hideAll(): void {
    this.showFilters.set(false);
    this.showMapLayers.set(false);
    this.showMapStudyZonesLayers.set(false);
  }

  addGPGKLayers(event: any): void {
    // pintamos las capas en el mapa
    this.mapService.addGeoJson(event.originalEvent.body as FeatureCollection<Geometry>);
  }
}
