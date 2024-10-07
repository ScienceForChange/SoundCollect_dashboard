import { Event } from '@angular/router';
import { Component, EventEmitter, inject, Input, OnInit, Output, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MapService } from '../../service/map.service';
import { FeatureCollection, Geometry } from 'geojson';
import { Feature } from '@turf/turf';

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
}
