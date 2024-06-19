import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, inject, signal } from '@angular/core';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl, { LngLat, LngLatBounds, Map } from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Observations } from '../../../models/observations';
import { ObservationsService } from '../../../services/observations/observations.service';
import { Subscription } from 'rxjs';
import { MapService } from '../../../services/map/map.service';


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

  private map!: Map;
  private draw!: MapboxDraw;
  private observationsService = inject(ObservationsService);
  private observations: Observations[] = [];
  private observations$!: Subscription
  private observationSelectedId: string = '';

  public points: [number, number][] = [];
  public polylines = signal<any[]>([]);
  public selectedPolygon: any | undefined = undefined;
  public polygonFilter = signal<any | undefined>(undefined);
  public timeFilter = signal<TimeFilter>(TimeFilter.WHOLEDAY);
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

  constructor() {

    this.observations$ = this.observationsService.observations$.subscribe((observations) => {
      this.observations = observations;


      function getColor(value: number): string{
        switch (true) {
          case value <= 35:
            return '#B7CE8E';
          case value > 35 && value <= 40:
            return '#1D8435';
          case value > 40 && value <= 45:
            return '#0E4C3C';
          case value > 45 && value <= 50:
            return '#ECD721';
          case value > 50 && value <= 55:
            return '#9F6F2C';
          case value > 55 && value <= 60:
            return '#EF7926';
          case value > 60 && value <= 65:
            return '#C71932';
          case value > 65 && value <= 70:
            return '#8D1A27';
          case value > 70 && value <= 75:
            return '#88497B';
          case value > 75 && value <= 80:
            return '#18558C';
          case value > 80:
            return '#134367';
          default:
            return '#333';

        }
      }

      //Crear polilineas para las observaciones, esto añade el borde negro a las observaciones para mejorar la visibilidad

      let linestrings = this.observations.map((obs) => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: obs.attributes.path.map((value) => { return value.start })
        },
        properties: {
          id:     obs.id,
          type:   'LineString',
          color:  '#333',
          width:  6
        }
      }));

      //Obtener los segmentos de las polilineas
      linestrings = linestrings.concat(
        this.observations.map((obs) => {
          let segments:any = [];
          for (let i = 0; i < obs.attributes.path.length - 1; i++) {
            segments.push({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [obs.attributes.path[i].start, obs.attributes.path[i].end]
              },
              properties: {
                type:   'Line',
                color: getColor(obs.attributes.path[i].parameters.LAeq),
                width: 3,
                pause: obs.attributes.path[i].parameters.pause
              }
            });
          }
          return segments;
        }).flat()
      );

      this.polylines.update(() => linestrings);
      this.updateMapSource();
    })

    effect(() => {
      if (this.polygonFilter()) console.log(this.timeFilter());
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
    this.polygonFilter.update(() => undefined)
    this.observationsService.getAllObservations();
  }


  ngAfterViewInit(): void {
    this.map = new Map({
      container: this.mapContainer.nativeElement, // container ID
      style: this.mapSettings.mapStyle, // style URL
      center: this.mapSettings.centerMapLocation, // starting position [lng, lat]
      zoom: this.mapSettings.zoom, // starting zoom
    });

    this.map.on('load', () => this.onMapLoad());

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      language: 'ca',
      limit: 5,
      mapboxgl: mapboxgl,
      marker: false,
      zoom: 17,
    });

    this.map.addControl(geocoder, 'top-left');
  }
  /*
  * Evento de carga del mapa
  */
  public onMapLoad() {

    const selectionColor = '#C19FD9';

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
            'fill-opacity': 0.1
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
            'fill-opacity': 0.1
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
    this.map.addControl(this.draw);

    //Llamada a la función onPolygonSelect cuando se selecciona un polígono
    this.map.on('draw.selectionchange', this.onDrawSelect.bind(this));

    //Llamada a la función polygonCreated cuando se termina de dibujar un polígono
    this.map.on('draw.create', this.onDrawCreated.bind(this));

    //La función updatedSubareaPolygon se llama cuando se actualiza un polígono
    this.map.on('draw.update', this.onDrawUpdated.bind(this));

    this.addObservationsToMap();

  }
  private onDrawSelect(event: any) {
    this.selectedPolygon = event.features[0] ? event.features[0] : undefined;
  }

  private onDrawCreated(event: any) {
    this.getFilteredObservations(event)
  }

  private onDrawUpdated(event: any) {
    this.getFilteredObservations(event)
  }

  private getFilteredObservations(event: any) {
    this.polygonFilter.update(() => event.features[0])
    this.observationsService.getFilteredObservationsForSoundscape(null, null, this.polygonFilter().geometry.coordinates[0]);
  }

  private getBboxFromPoints(): [[number, number], [number, number]] {
    let points = this.points;

    let minX: number = 0,
      maxX: number = 0,
      minY: number = 0,
      maxY: number = 0;

    points.forEach((p, i) => {
      if (i === 0) {
        minX = maxX = p[0];
        minY = maxY = p[1];
      } else {
        minX = Math.min(p[0], minX);
        minY = Math.min(p[1], minY);
        maxX = Math.max(p[0], maxX);
        maxY = Math.max(p[1], maxY);
      }
    });

    return [
      [minX, minY],
      [maxX, maxY],
    ];
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

    this.map.addLayer({
      id: 'lineLayer-hover',
      type: 'line',
      source: 'polylines',
      layout: {

        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
          'line-color': '#333',
          'line-width': 3,
          'line-gap-width': 5,
      },
      filter: ['==', 'id', '']  // Filtro vacío para iniciar
    });
    this.map.addLayer({
      id: 'lineLayer-select',
      type: 'line',
      source: 'polylines',
      layout: {

        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
          'line-color': '#FF7A1F',
          'line-width': 4,
          'line-gap-width': 5,
      },
      filter: ['==', 'id', '']  // Filtro vacío para iniciar
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

    this.map.on('mouseenter', 'LineString', (e:any) => {
      this.map.getCanvas().style.cursor = 'pointer';
      for( let feature of e.features) {
        if (feature.properties.type === 'LineString' && feature.properties.id !== undefined) {
          this.map.setFilter('lineLayer-hover', ['==', 'id', feature.properties.id]);
          return;
        }
      };
    });

    this.map.on('click', 'LineString', (e:any) => {
      this.map.getCanvas().style.cursor = 'inherit';
      for( let feature of e.features) {
        if (feature.properties.type === 'LineString' && feature.properties.id !== undefined) {
          this.observationSelectedId = feature.properties.id;
          this.map.setFilter('lineLayer-select', ['==', 'id', feature.properties.id]);
          return;
        }
      };
    });

    this.map.on('mouseleave', 'LineString', (e:any) => {
      this.map.getCanvas().style.cursor = 'inherit';
      this.map.setFilter('lineLayer-hover', ['==', 'id', '']);
    });

  };

  updateMapSource() {
    if (!this.map || !this.map.isSourceLoaded('polylines')) return;
    let source = this.map.getSource('polylines') as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features: this.polylines()
    });
  }

  ngOnDestroy(): void {
    this.observations$.unsubscribe();
  }
}

