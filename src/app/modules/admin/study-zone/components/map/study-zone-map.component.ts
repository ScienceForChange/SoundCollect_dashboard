import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl, {
  Map,
} from 'mapbox-gl';
import { StudyZoneMapService } from '../../service/study-zone-map.service';


@Component({
  selector: 'app-study-zone-map',
  templateUrl: './study-zone-map.component.html',
  styleUrl: './study-zone-map.component.scss',
})
export class StudyZoneMapComponent {
  private studyZoneMapService = inject(StudyZoneMapService);

  @ViewChild('map') mapContainer!: ElementRef;

  @Output() toggleStudyZoneForm: EventEmitter<void> = new EventEmitter<void>();

  polygonFilter = signal<any | undefined>(undefined);

  private language: string = localStorage.getItem('locale') || 'ca';

  public layerId: string = 'light-v10';

  public showMapLayers?: boolean;
  public filterActive: boolean = false;

  public toggleShowMapLayers(): void {
    this.showMapLayers = !this.showMapLayers;
  }

  public toggleLayerVisibility(layerId: string) {
    this.studyZoneMapService.map.setStyle('mapbox://styles/mapbox/' + layerId);
  }

  ngOnInit(): void {
    this.polygonFilter = this.studyZoneMapService.polygonFilter;

  }

  drawPolygonFilter() {
    this.studyZoneMapService.drawPolygonFilter();
  }

  deletePolygonFilter() {
    this.studyZoneMapService.deletePolygonFilter();
  }

  ngAfterViewInit(): void {
    const mapSettings = this.studyZoneMapService.mapSettings;

    this.studyZoneMapService.map = new Map({
      container: this.mapContainer.nativeElement, // container ID
      style: mapSettings.mapStyle, // style URL
      center: mapSettings.centerMapLocation, // starting position [lng, lat]
      zoom: mapSettings.zoom, // starting zoom
    });

    this.studyZoneMapService.map.on('load', () =>
      this.studyZoneMapService.onMapLoad()
    );

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      language: this.language,
      limit: 5,
      marker: false,
      zoom: 17,
    });

    this.studyZoneMapService.map.addControl(geocoder, 'top-left');

    this.studyZoneMapService.map.on('style.load', () => {
      this.studyZoneMapService.addObservationsToMap();
    });

    this.studyZoneMapService.map.on('styledata', () => {
      //Update language
      this.studyZoneMapService.map.setLayoutProperty(
        'country-label',
        'text-field',
        ['get', `name_${this.language}`]
      );
    });
  }
}
