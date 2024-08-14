import { Component, effect, ElementRef, EventEmitter, inject, Input, Output, signal, ViewChild } from '@angular/core';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl, { IControl, LngLat, LngLatBounds, Map, MapEvent } from 'mapbox-gl';
import { Observations } from '../../../../../models/observations';
import { ObservationsService } from '../../../../../services/observations/observations.service';
import { Subscription } from 'rxjs';
import { GeoJSONObject } from '@turf/turf';
import { StudyZoneMapService } from '../../service/study-zone-map.service';


interface Feature<G extends GeoJSON.Geometry | null = GeoJSON.Geometry, P = { [name: string]: any } | null> extends GeoJSONObject {
  type: "Feature";
  geometry: G;
  id?: string | number | undefined;
  properties: P;
}

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

  private map!: Map;

  public layerId: string = 'light-v10';

  public showMapLayers?: boolean;
  public selectedPolygon: any | undefined = undefined;
  public filterActive: boolean = false;


  public toggleShowMapLayers(): void {
    this.showMapLayers = !this.showMapLayers;
  }

  public toggleLayerVisibility(layerId: string) {
    this.map.setStyle('mapbox://styles/mapbox/' + layerId);
  }

  ngOnInit(): void {
    this.polygonFilter = this.studyZoneMapService.polygonFilter
  }

  drawPolygonFilter() {
    this.studyZoneMapService.drawPolygonFilter();
  }

  deletePolygonFilter() {
    this.studyZoneMapService.deletePolygonFilter();
  } 


  ngAfterViewInit(): void {
    const mapSettings = this.studyZoneMapService.mapSettings

    this.studyZoneMapService.map = new Map({
      container: this.mapContainer.nativeElement, // container ID
      style: mapSettings.mapStyle, // style URL
      center: mapSettings.centerMapLocation, // starting position [lng, lat]
      zoom: mapSettings.zoom, // starting zoom
      cooperativeGestures: true,
    });

    this.studyZoneMapService.map.on('load', () => this.studyZoneMapService.onMapLoad());

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      language: 'ca',
      limit: 5,
      marker: false,
      zoom: 17,
    });

    this.studyZoneMapService.map.addControl(geocoder, 'top-left');

    this.studyZoneMapService.map.on('style.load', () => {
      this.studyZoneMapService.addObservationsToMap();
    });
  }
}
