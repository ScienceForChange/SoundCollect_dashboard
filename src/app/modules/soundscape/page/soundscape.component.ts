import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, signal } from '@angular/core';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl, { LngLat, LngLatBounds, Map } from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';


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
  public points: [number, number][] = [];
  public selectedPolygon: any | undefined = undefined;
  public polygonFilter = signal<any | undefined>(undefined);
  public timeFilter = signal<TimeFilter>(TimeFilter.WHOLEDAY);

  public drawPolygonFilter(){
    if(this.selectedPolygon && this.polygonFilter()){
      this.draw.delete(this.selectedPolygon.id);
      this.selectedPolygon = undefined;
      this.polygonFilter.update(() => undefined)
    }
    this.draw.changeMode('draw_polygon');
  };

  public deletePolygonFilter(){
    this.draw.delete(this.selectedPolygon.id);
    this.selectedPolygon = undefined;
    this.polygonFilter.update(() => undefined)
  }
  constructor() {
    effect(() => {
      if(this.polygonFilter()) console.log(this.timeFilter());
    });
  }
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
            'line-color':selectionColor,
            'line-width': [
              "case",
              ['==', ['get', "user_class_id"], 2], 2,
              2
            ],
            'line-dasharray':[
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

    //Llamada a la función markerCreated cuando se termina de dibujar un marcador

    //La función updatedSubareaPolygon se llama cuando se actualiza un polígono
    this.map.on('draw.update', this.onDrawUpdated.bind(this));
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
    console.log('getFilteredObservations');
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

  ngOnDestroy(): void {}
}

