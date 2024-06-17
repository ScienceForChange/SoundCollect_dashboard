import { Component, EventEmitter, Input, Output, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-map-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrl: './tool-bar.component.scss',
})
export class MapToolBarComponent {
  @Input() showFilters?: WritableSignal<boolean>;
  @Input() showMapLayers?: WritableSignal<boolean>;
  @Input() isFilterActive: boolean = false;
  
  @Output() toggleActiveFilters: EventEmitter<void> = new EventEmitter<void>();

  activeFilters(): void {
    this.toggleActiveFilters.emit();
  }

  toggleShowMapLayers(): void {
    this.showMapLayers.set(!this.showMapLayers());
  }

  toggleShowFilters(): void {
    this.showFilters.set(!this.showFilters());
  }
}
