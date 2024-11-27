import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import mapboxgl, { IControl, LngLat, LngLatBounds, Map, MapEvent, } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import { Subscription } from 'rxjs';

import { GeoJSONObject } from '@turf/turf';

import { Observations } from '../../../models/observations';
import { ObservationsService } from '../../../services/observations/observations.service';

export interface Feature<G extends GeoJSON.Geometry | null = GeoJSON.Geometry, P = { [name: string]: any } | null> extends GeoJSONObject {
  type: "Feature";
  geometry: G;
  id?: string | number | undefined;
  properties: P;
}

//time filter enum
enum TimeFilter {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night',
  WHOLEDAY = 'wholeDay',
}

@Component({
  selector: 'app-soundscape',
  templateUrl: './soundscape.component.html',
  styleUrl: './soundscape.component.scss'
})

export class SoundscapeComponent implements AfterViewInit, OnDestroy {

  @ViewChild('map') mapContainer!: ElementRef;

  private translations = inject(TranslateService);

  private map!: Map;
  private draw!: MapboxDraw;
  private observationsService = inject(ObservationsService);
  private observations$!: Subscription;
  private language: string = localStorage.getItem('locale') || 'ca';

  public observations!: Observations[];
  public observationSelected: Observations | null = null;
  public points: [number, number][] = [];
  public polylines = signal<Feature[]>([]);
  public startPoints = signal<Feature[]>([]);
  public showMapLayers?: boolean;
  public selectedPolygon: any | undefined = undefined;
  public polygonFilter = signal<any | undefined>(undefined);
  public filterActive: boolean = false;
  public timeFilter = signal<TimeFilter>(TimeFilter.WHOLEDAY);
  public layerId: string = 'light-v10';
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
  private defaultBbox:[[number, number], [number, number]] = [[0.048229834542042, 40.416428760865], [3.3736729893935, 42.914194523824]]; // Catalonia bbox
  private hourRage:{[key: string]: string[] | null[]} = {
    [TimeFilter.MORNING]:   ["07:00:00", "19:00:00"],
    [TimeFilter.AFTERNOON]: ["19:00:00", "23:59:59"],
    [TimeFilter.NIGHT]:     ["00:00:00", "07:00:00"],
    [TimeFilter.WHOLEDAY]:  ["00:00:00", "23:59:59"],
  };
  public items = [
    {
      label: this.translations.instant('soundscape.map.gpkgDownload'),
      command: () => {
          this.downloadFile('GPKG');
      }
    },
    {
      label: this.translations.instant('soundscape.map.kmlDownload'),
      command: () => {
        this.downloadFile('KML');
      }
    },
  ];
  constructor() {

    this.observations = this.observationsService.observations$.value;
    if(this.observations.length === 0){
      this.observations$ = this.observationsService.observations$.subscribe((observations) => {
        this.observations = observations;
        this.polylines.update(() => this.observationsService.getLineStringFromObservations(this.observations));
        this.startPoints.update(() => this.observationsService.getStartPointsFromObservations(this.observations));
        this.updateMapSource();
      }) 
    }
    else{
      this.polylines.update(() => this.observationsService.getLineStringFromObservations(this.observations));
      this.startPoints.update(() => this.observationsService.getStartPointsFromObservations(this.observations));
      this.updateMapSource();
    }


    effect(() => {

      if (this.polygonFilter()){
        this.filterActive = true;
        this.getFilteredObservationsByPolygon();
      }

    });

  }

  public drawPolygonFilter() {
    if (this.polygonFilter()) {
      this.deletePolygonFilter();
    }
    this.draw.changeMode('draw_polygon');
  };

  public deletePolygonFilter() {
    this.draw.delete(this.polygonFilter().id);
    this.selectedPolygon = undefined;
    this.polygonFilter.update(() => undefined);
    this.observations = this.observationsService.observations$.value;
    this.polylines.update(() => this.observationsService.getLineStringFromObservations(this.observations));
    this.startPoints.update(() => this.observationsService.getStartPointsFromObservations(this.observations));
    this.updateMapSource();
    this.filterActive = false;
    this.unsellectObservation();
  }

  public toggleShowMapLayers(): void {
    this.showMapLayers = !this.showMapLayers;
  }

  public toggleLayerVisibility(layerId: string) {
    this.map.setStyle('mapbox://styles/mapbox/' + layerId);
  }

  ngAfterViewInit(): void {
    this.map = new Map({
      container: this.mapContainer.nativeElement, // container ID
      style: this.mapSettings.mapStyle, // style URL
      center: this.mapSettings.centerMapLocation, // starting position [lng, lat]
      zoom: this.mapSettings.zoom, // starting zoom
      cooperativeGestures: true
    });

    this.map.on('load', () => this.onMapLoad());

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      language: this.language,
      limit: 5,
      marker: false,
      zoom: 17,
    });

    this.map.addControl(geocoder, 'top-left');

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
  /*
  * Evento de carga del mapa
  */
  public onMapLoad() {

    //agregamos controles de zoom al mapa
    this.map.addControl(new mapboxgl.NavigationControl(),'bottom-right');

    const selectionColor = '#C19FD9';

    this.flyToDefaultBbox();

    this.draw = new MapboxDraw({
      userProperties: true,
      displayControlsDefault: false,
      styles: [
        {
          'id': 'gl-draw-polygon-fill-inactive',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static'],
            ['!=', 'user_type', 'subarea']
          ],
          'paint': {
            'fill-color': selectionColor,
            'fill-outline-color': selectionColor,
            'fill-opacity': 0.3
          }
        },
        {
          'id': 'gl-draw-polygon-fill-active',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'true'],
            ['==', '$type', 'Polygon']
          ],
          'paint': {
            'fill-color': selectionColor,
            'fill-outline-color': selectionColor,
            'fill-opacity': 0.3
          }
        },
        {
          'id': 'gl-draw-polygon-midpoint',
          'type': 'circle',
          'filter': ['all', ['==', '$type', 'Point'],
            ['==', 'meta', 'midpoint']
          ],
          'paint': {
            'circle-radius': 3,
            'circle-color': "#191919"
          }
        },
        {
          'id': 'gl-draw-polygon-stroke-inactive',
          'type': 'line',
          'filter': ['all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static']
          ],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': selectionColor,
            'line-width': [
              "case",
              ['==', ['get', "user_class_id"], 2], 2,
              2
            ],
            'line-dasharray': [
              "case",
              ['==', ['get', "user_class_id"], 2], ["literal", [2, 0]],
              ["literal", [0.2, 2]],
            ],
          }
        },
        {
          'id': 'gl-draw-polygon-stroke-active',
          'type': 'line',
          'filter': ['all',
            ['==', 'active', 'true'],
            ['==', '$type', 'Polygon']
          ],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': selectionColor,
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        {
          'id': 'gl-draw-line-inactive',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'LineString'],
            ['!=', 'mode', 'static']
          ],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': selectionColor,
            'line-width': 2
          }
        },
        {
          'id': 'gl-draw-line-active',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString'],
            ['==', 'active', 'true']
          ],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': selectionColor,
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        {
          'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static']
          ],
          'paint': {
            'circle-radius': 5,
            'circle-color': '#fff'
          }
        },
        {
          'id': 'gl-draw-polygon-and-line-vertex-inactive',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static']
          ],
          'paint': {
            'circle-radius': 5,
            'circle-color': "#191919"
          }
        },
        {
          'id': 'gl-draw-point-point-stroke-inactive',
          'type': 'circle',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['!=', 'mode', 'static']
          ],
          'paint': {
            'circle-radius': 8,
            'circle-opacity': 1,
            'circle-color': '#fff'
          }
        },
        {
          'id': 'gl-draw-point-inactive',
          'type': 'circle',
          'filter': ['all', ['==', 'active', 'false'],
            ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['!=', 'mode', 'static']
          ],
          'paint': {
            'circle-radius': 5,
            'circle-color': selectionColor
          }
        },
        {
          'id': 'gl-draw-point-stroke-active',
          'type': 'circle',
          'filter': ['all', ['==', '$type', 'Point'],
            ['==', 'active', 'true'],
            ['!=', 'meta', 'midpoint']
          ],
          'paint': {
            'circle-radius': 7,
            'circle-color': '#fff'
          }
        },
        {
          'id': 'gl-draw-point-active',
          'type': 'circle',
          'filter': ['all', ['==', '$type', 'Point'],
            ['!=', 'meta', 'midpoint'],
            ['==', 'active', 'true']
          ],
          'paint': {
            'circle-radius': 8,
            'circle-color': "#191919"
          }
        },
        {
          'id': 'gl-draw-polygon-fill-static',
          'type': 'fill',
          'filter': ['all', ['==', 'mode', 'static'],
            ['==', '$type', 'Polygon']
          ],
          'paint': {
            'fill-color': '#404040',
            'fill-outline-color': '#404040',
            'fill-opacity': 0.1
          }
        },
        {
          'id': 'gl-draw-polygon-stroke-static',
          'type': 'line',
          'filter': ['all', ['==', 'mode', 'static'],
            ['==', '$type', 'Polygon']
          ],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#404040',
            'line-width': 2
          }
        },
        {
          'id': 'gl-draw-line-static',
          'type': 'line',
          'filter': ['all', ['==', 'mode', 'static'],
            ['==', '$type', 'LineString']
          ],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#404040',
            'line-width': 2
          }
        },
        {
          'id': 'gl-draw-point-static',
          'type': 'circle',
          'filter': ['all', ['==', 'mode', 'static'],
            ['==', '$type', 'Point']
          ],
          'paint': {
            'circle-radius': 5,
            'circle-color': '#404040'
          }
        },
      ]

    });
    this.map.addControl(this.draw as IControl);

    //Llamada a la función onPolygonSelect cuando se selecciona un polígono
    this.map.on('draw.selectionchange' as MapEvent, this.onDrawSelect.bind(this));

    //Llamada a la función polygonCreated cuando se termina de dibujar un polígono
    this.map.on('draw.create' as MapEvent, this.onDrawCreated.bind(this));

    //La función updatedSubareaPolygon se llama cuando se actualiza un polígono
    this.map.on('draw.update' as MapEvent, this.onDrawUpdated.bind(this));

  }

  private onDrawSelect(event: any) {
    this.selectedPolygon = event.features[0] ? event.features[0] : undefined;
  }

  private onDrawCreated(event: any) {
    this.unsellectObservation();
    this.getFilteredObservations(event);
  }

  private onDrawUpdated(event: any) {
    this.unsellectObservation();
    this.getFilteredObservations(event);
  }

  private getFilteredObservations(event: any) {
    this.unsellectObservation();
    this.polygonFilter.update(() => event.features[0]);
  }

  private addObservationsToMap(observations: Observations[] = this.observations) {

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
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // resaltar la línea a la que se hace hover de color negro
    this.map.addLayer({
      id: 'lineLayer-hover',
      type: 'line',
      source: 'polylines',
      minzoom: 15,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#FF7A1F',
        'line-opacity': 0.5,
        'line-width': 16,
        'line-gap-width': 0,
      },
      filter: ['==', 'id', '']  // Filtro vacío para iniciar
    });

    // resaltar la línea seleccionada de color naranja
    this.map.addLayer({
      id: 'lineLayer-select',
      type: 'line',
      source: 'polylines',
      minzoom: 15,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#333',
        'line-width': 16,
        'line-gap-width': 0,
      },
      filter: ['==', 'id', '']  // Filtro vacío para iniciar
    });

    // Agregar capa para los paths individuales
    this.map.addLayer({
      id: 'LineString',
      type: 'line',
      source: 'polylines',
      minzoom: 15,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': [
          'case',
          ['==', ['get', 'pause'], true],
          '#FFF', // Dasharray si pause es 1
          ['get', 'color'], // Sin dasharray si pause no es 1
        ],
        'line-width': 10,//['get', 'width'],
        'line-dasharray': [
          0,1.15
          // 'case',
          // ['==', ['get', 'pause'], true],
          // [2, 3], // Dasharray si pause es 1
          // [1, 0], // Sin dasharray si pause no es 1
        ],
      },
    });

    // cluster de los puntos de inicio
    this.map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'startPoints',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40
        ]
      }
    });

    // cluster count
    this.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'startPoints',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    // cluster de los puntos de inicio
    this.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'startPoints',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 6,
        'circle-color': '#6D6',
        'circle-pitch-scale': 'viewport',
        'circle-stroke-color': '#333',
        'circle-stroke-width': 2,
      }
    });

    this.map.on('click', 'clusters', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties['cluster_id'];
      (this.map.getSource('startPoints') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;

          this.map.easeTo({
              center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
              zoom: zoom
          });
        }
      );
    });
    
    this.map.on('mouseenter', 'LineString', (e:any) => {
      this.map.getCanvas().style.cursor = 'pointer';
      const id = e.features[0].properties.id;
      this.map.setFilter('lineLayer-hover', ['==', 'id', id]);
    });

    this.map.on('click', 'LineString', (e:any) => {
      this.map.getCanvas().style.cursor = 'inherit';
      if(!this.observationSelected || this.observationSelected.id !== e.features[0].properties.id){
        this.observationSelected = this.observationsService.observations$.value.find((obs) => obs.id === e.features[0].properties.id);
        this.observations = [this.observationSelected];
        const id = e.features[0].properties.id;
        this.map.setFilter('lineLayer-select', ['==', 'id', id]);
      }
      else{
        if(this.polygonFilter()){
          this.filterActive = true;
          this.getFilteredObservationsByPolygon();
        }
        this.observations = this.observationsService.observations$.value;

        this.observationSelected = null
        this.map.setFilter('lineLayer-select', ['==', 'id', '']);
      }
    });

    this.map.on('mouseleave', 'LineString', (e:any) => {
      this.map.getCanvas().style.cursor = 'inherit';
      this.map.setFilter('lineLayer-hover', ['==', 'id', '']);
    });

  };

  private getFilteredObservationsByPolygon() {

    let initalHour = this.hourRage[this.timeFilter()][0] ? String(this.hourRage[this.timeFilter()][0]) : "00:00:00";
    let finalHour = this.hourRage[this.timeFilter()][1] ? String(this.hourRage[this.timeFilter()][1]) : "23:59:59";
    this.observationsService.getObservationsByPolygonAndHours(
      this.polygonFilter().geometry.coordinates[0].map((coo:number) => String(coo).replace(',', ' ')),
      [initalHour, finalHour]
    ).subscribe({
      next: (observations) => {
        this.observations = observations;
        this.updateMapSource();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
  
  private unsellectObservation() {
    this.observationSelected = null
    this.map.setFilter('lineLayer-select', ['==', 'id', '']);
  }

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

  public downloadFile (option: string) {
    if(option === 'CSV'){
      this.observationsService.downloadObservations(this.observations)
    }
    if(option === 'KML'){
      this.observationsService.downloadKML();
    }
    if(option === 'GPKG'){
      this.observationsService.downloadGPKG()
    }
  }

  public flyToDefaultBbox() {
    this.map.fitBounds(this.defaultBbox, { padding: { top: 10, bottom: 10, left: 10, right: 10 } });
  }

  ngOnDestroy(): void {
    if (this.observations$) this.observations$.unsubscribe();
    if (this.map) {
      this.map.remove();
    }
  }
}

