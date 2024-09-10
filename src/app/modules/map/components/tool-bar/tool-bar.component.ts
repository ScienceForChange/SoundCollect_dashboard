import { Component, EventEmitter, Input, Output, WritableSignal } from '@angular/core';

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

  
  @Output() toggleActiveFilters: EventEmitter<void> = new EventEmitter<void>();

  activeFilters(): void {
    this.toggleActiveFilters.emit();
  }

  toggleShowMapLayers(): void {
    this.showMapLayers.set(!this.showMapLayers());
    this.showFilters.set(false);
  }

  toggleShowMapStudyZonesLayers(): void {
    this.showMapStudyZonesLayers.set(!this.showMapStudyZonesLayers());
  }

  toggleShowFilters(): void {
    this.showFilters.set(!this.showFilters());
    this.showMapLayers.set(false);

  }
}
