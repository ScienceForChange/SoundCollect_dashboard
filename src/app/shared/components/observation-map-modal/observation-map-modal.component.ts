import { AfterViewInit, Component, effect, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal, ViewChild } from '@angular/core';
import { Observations } from '../../../models/observations';
import mapboxgl, { IControl, LngLat, LngLatBounds, Map, MapEvent, } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { GeoJSONObject } from '@turf/turf';
import { ObservationsService } from '../../../services/observations/observations.service';

export interface Feature<G extends GeoJSON.Geometry | null = GeoJSON.Geometry, P = { [name: string]: any } | null> extends GeoJSONObject {
  type: "Feature";
  geometry: G;
  id?: string | number | undefined;
  properties: P;
}

@Component({
  selector: 'app-observation-map-modal',
  templateUrl: './observation-map-modal.component.html',
  styleUrl: './observation-map-modal.component.scss'
})
export class ObservationMapModalComponent implements AfterViewInit, OnDestroy {

  private observations: Observations[] = [];
  private observationsService: ObservationsService = inject(ObservationsService);

  private _observationSelected: Observations | null = null;
  @Input() set observationSelected(value: Observations | null) {
      this.observations = value ? [value] : [];
      this.polylines.update(() => this.observationsService.getLineStringFromObservations(this.observations));
      this.startPoints.update(() => this.observationsService.getStartPointsFromObservations(this.observations));
      this.updateMapSource();
      this._observationSelected = value;
  }
  get observationSelected() {
    return this._observationSelected;
  }

  @Input() isOpen: boolean = false;
  @Output() hideModal: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('map') mapContainer!: ElementRef;

  private map!: Map;
  private language: string = localStorage.getItem('locale') || 'ca';
  public polylines = signal<Feature[]>([]);
  public startPoints = signal<Feature[]>([]);
  public mapSettings: {
    zoom: number;
    mapStyle: string;
    centerMapLocation: [number, number] | undefined;
    minZoom?: number;
    maxZoom?: number;
    bounds: LngLatBounds;
    clusterMaxZoom: number;
  } = {
    zoom: 10,
    mapStyle: 'mapbox://styles/mapbox/light-v11',
    centerMapLocation: [2.1487613, 41.3776589],
    minZoom: 2,
    maxZoom: 17,
    bounds: new LngLatBounds(new LngLat(-90, 90), new LngLat(90, -90)),
    clusterMaxZoom: 17,
  };

  closeModal(): void {
    this.hideModal.emit();
  }

  ngAfterViewInit(): void {
    this.map = new Map({
      container: this.mapContainer.nativeElement, // container ID
      style: this.mapSettings.mapStyle, // style URL
      center: this.mapSettings.centerMapLocation, // starting position [lng, lat]
      zoom: this.mapSettings.zoom, // starting zoom
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      language: this.language,
      limit: 5,
      marker: false,
      zoom: 17,
    });

    this.map.on('styledata', () => {
      //Update language
      this.map.setLayoutProperty('country-label', 'text-field', [
        'get',
        `name_${this.language}`,
      ]);
    })

    //Added the obs to map when the style is loaded or toggled
    this.map.on('style.load', () => {
      this.addObservationsToMap();
    });
  }

  private addObservationsToMap(observations: Observations[] = [this.observationSelected]) {

    //Añadir la fuente de datos para las lineas de atributo path
    this.map.addSource('polylines', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.polylines()
      }
    });

    this.map.addSource('startPoints', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.startPoints()
      }
    });

    // Agregar capa para los paths individuales
    this.map.addLayer({
      id: 'LineString',
      type: 'line',
      //filtramos si es zoom es mayor que 14
      //minzoom: 14,
      source: 'polylines',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color':
        [
          'case',
          ['==', ['get', 'pause'], true],
          '#FFF', // Dasharray si pause es 1
          ['get', 'color'] // Sin dasharray si pause no es 1
        ]
       ,
        'line-width': ['get', 'width'],
        "line-dasharray":  [
          'case',
          ['==', ['get', 'pause'], true],
          [2, 3], // Dasharray si pause es 1
          [1, 0] // Sin dasharray si pause no es 1
        ]
      }
    });

    // Agregar icono de inicio
    this.map.addLayer({
      id: 'start',
      type: 'circle',
      source: 'startPoints',
      paint: {
        'circle-radius': 3,
        'circle-color': '#6D6',
        'circle-pitch-scale': 'viewport',
        'circle-stroke-color': '#333',
        'circle-stroke-width': 2,
      }
    });

  };

  private updateMapSource() {

    this.polylines.update(() => this.observationsService.getLineStringFromObservations(this.observations));
    this.startPoints.update(() => this.observationsService.getStartPointsFromObservations(this.observations));

    if (!this.map || !this.map.getSource('polylines')) return;
    let source = this.map.getSource('polylines') as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features: this.polylines()
    });

    let sourceStartPoints = this.map.getSource('startPoints') as mapboxgl.GeoJSONSource;

    sourceStartPoints.setData({
      type: 'FeatureCollection',
      features: this.startPoints()
    });


  }
  //recargamos el mapa al abrir el modal
  public onShow(event: Event) {
    this.map.resize();
    // movemos el mapa para mostrar la observacion
    if (this.observationSelected) {
      this.map.flyTo({
        center: ([Number(this.observationSelected.attributes.longitude), Number(this.observationSelected.attributes.latitude)]),
        zoom: 15
      });
    }
  }

  ngOnDestroy(): void {
    this.map.remove();
  }
}
