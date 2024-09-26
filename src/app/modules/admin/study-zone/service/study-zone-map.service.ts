import { inject, Injectable, signal } from '@angular/core';
import { ObservationsService } from '../../../../services/observations/observations.service';
import { Observations } from '../../../../models/observations';
import { IControl, LngLat, LngLatBounds, Map, MapEvent } from 'mapbox-gl';
import { GeoJSONObject } from '@turf/turf';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { StudyZoneService } from '../../../../services/study-zone/study-zone.service';
import { StudyZone } from '../../../../models/study-zone';
import { BehaviorSubject } from 'rxjs';

interface Feature<G extends GeoJSON.Geometry | null = GeoJSON.Geometry,P = { [name: string]: any } | null> extends GeoJSONObject {
  type: 'Feature';
  geometry: G;
  id?: string | number | undefined;
  properties: P;
}

@Injectable({
  providedIn: 'root',
})
export class StudyZoneMapService {
  private observationsService = inject(ObservationsService);
  private studyZoneService = inject(StudyZoneService);

  public polygonFilter = signal<any | undefined>(undefined);
  public polylines = signal<Feature[]>([]);
  public startPoints = signal<Feature[]>([]);
  public studyZones = signal<Feature[]>([]);
  public pointStudyZones = signal<Feature[]>([]);

  public studyZoneSelected$: BehaviorSubject<StudyZone | null> = new BehaviorSubject<StudyZone>(null);

  public studyZoneDialogVisible = signal<boolean>(false);


  public observations!: Observations[];
  public allStudyZones!: StudyZone[];
  public map!: Map;
  private draw!: MapboxDraw;

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

  public layerId: string = 'light-v10';
  public selectedPolygon: any | undefined = undefined;

  constructor() {
    this.observationsService.observations$.subscribe((observations) => {
      this.observations = observations;
      this.polylines.update(() => this.observationsService.getLineStringFromObservations(this.observations));
      this.startPoints.update(() => this.observationsService.getStartPointsFromObservations(this.observations));
      this.updateMapSource();
    });
    this.studyZoneService.studyZones$.subscribe((studyZones) => {
      this.allStudyZones = studyZones;
      this.studyZones.update(() => this.getPolygonFromStudyZones(this.allStudyZones));
      this.pointStudyZones.update(() => this.getPointFromStudyZones(this.allStudyZones));
      this.updateMapSource();
    });
    this.studyZoneSelected$.subscribe((studyZone) => {
      
      if (studyZone) this.selectedStudyZone(studyZone.id);
    });
  }

  public drawPolygonFilter() {
    this.toggleObservationsVisibility();
    this.toggleStudyZonesVisibility();
    if (this.polygonFilter()) {
      this.deletePolygonFilter();
    }
    this.draw.changeMode('draw_polygon');
  }

  public deletePolygonFilter() {
    this.toggleObservationsVisibility();
    this.toggleStudyZonesVisibility();
    this.draw.delete(this.polygonFilter().id);
    this.selectedPolygon = undefined;
    this.polygonFilter.update(() => undefined);
  }

  private getFilteredObservations(event: any) {
    this.polygonFilter.update(() => event.features[0]);
  }

  private onDrawSelect(event: any) {
    this.selectedPolygon = event.features[0] ? event.features[0] : undefined;
  }

  private onDrawCreated(event: any) {
    this.getFilteredObservations(event);
  }

  private onDrawUpdated(event: any) {
    this.getFilteredObservations(event);
  }

  private updateMapSource() {

    if(this.observations){
      this.polylines.update(() => this.observationsService.getLineStringFromObservations(this.observations));
      this.startPoints.update(() => this.observationsService.getStartPointsFromObservations(this.observations));
    }
    if(this.allStudyZones){
      this.studyZones.update(() => this.getPolygonFromStudyZones(this.allStudyZones));
      this.pointStudyZones.update(() => this.getPointFromStudyZones(this.allStudyZones));
    }


    if (!this.map || !this.map.getSource('polylines')) return;

    let source = this.map.getSource('polylines') as mapboxgl.GeoJSONSource;
    source.setData({type: 'FeatureCollection', features: this.polylines()});

    let sourceStartPoints = this.map.getSource('startPoints') as mapboxgl.GeoJSONSource;
    sourceStartPoints.setData({ type: 'FeatureCollection', features: this.startPoints()});

    let sourceStudyZones = this.map.getSource('allStudyZones') as mapboxgl.GeoJSONSource;
    sourceStudyZones.setData({ type: 'FeatureCollection', features: this.studyZones()});

    let sourcePointStudyZones = this.map.getSource('allStudyZonesPoints') as mapboxgl.GeoJSONSource;
    sourcePointStudyZones.setData({ type: 'FeatureCollection', features: this.pointStudyZones()});

  }

  public onMapLoad() {
    const selectionColor = '#C19FD9';

    this.draw = new MapboxDraw({
      userProperties: true,
      displayControlsDefault: false,
      styles: [
        {
          id: 'gl-draw-polygon-fill-inactive',
          type: 'fill',
          filter: [
            'all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static'],
            ['!=', 'user_type', 'subarea'],
          ],
          paint: {
            'fill-color': selectionColor,
            'fill-outline-color': selectionColor,
            'fill-opacity': 0.1,
          },
        },
        {
          id: 'gl-draw-polygon-fill-active',
          type: 'fill',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': selectionColor,
            'fill-outline-color': selectionColor,
            'fill-opacity': 0.1,
          },
        },
        {
          id: 'gl-draw-polygon-midpoint',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
          paint: {
            'circle-radius': 3,
            'circle-color': '#191919',
          },
        },
        {
          id: 'gl-draw-polygon-stroke-inactive',
          type: 'line',
          filter: [
            'all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static'],
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': selectionColor,
            'line-width': ['case', ['==', ['get', 'user_class_id'], 2], 2, 2],
            'line-dasharray': [
              'case',
              ['==', ['get', 'user_class_id'], 2],
              ['literal', [2, 0]],
              ['literal', [0.2, 2]],
            ],
          },
        },
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': selectionColor,
            'line-dasharray': [0.2, 2],
            'line-width': 2,
          },
        },
        {
          id: 'gl-draw-line-inactive',
          type: 'line',
          filter: [
            'all',
            ['==', 'active', 'false'],
            ['==', '$type', 'LineString'],
            ['!=', 'mode', 'static'],
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': selectionColor,
            'line-width': 2,
          },
        },
        {
          id: 'gl-draw-line-active',
          type: 'line',
          filter: [
            'all',
            ['==', '$type', 'LineString'],
            ['==', 'active', 'true'],
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': selectionColor,
            'line-dasharray': [0.2, 2],
            'line-width': 2,
          },
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
          type: 'circle',
          filter: [
            'all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static'],
          ],
          paint: {
            'circle-radius': 5,
            'circle-color': '#fff',
          },
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-inactive',
          type: 'circle',
          filter: [
            'all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static'],
          ],
          paint: {
            'circle-radius': 5,
            'circle-color': '#191919',
          },
        },
        {
          id: 'gl-draw-point-point-stroke-inactive',
          type: 'circle',
          filter: [
            'all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['!=', 'mode', 'static'],
          ],
          paint: {
            'circle-radius': 8,
            'circle-opacity': 1,
            'circle-color': '#fff',
          },
        },
        {
          id: 'gl-draw-point-inactive',
          type: 'circle',
          filter: [
            'all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['!=', 'mode', 'static'],
          ],
          paint: {
            'circle-radius': 5,
            'circle-color': selectionColor,
          },
        },
        {
          id: 'gl-draw-point-stroke-active',
          type: 'circle',
          filter: [
            'all',
            ['==', '$type', 'Point'],
            ['==', 'active', 'true'],
            ['!=', 'meta', 'midpoint'],
          ],
          paint: {
            'circle-radius': 7,
            'circle-color': '#fff',
          },
        },
        {
          id: 'gl-draw-point-active',
          type: 'circle',
          filter: [
            'all',
            ['==', '$type', 'Point'],
            ['!=', 'meta', 'midpoint'],
            ['==', 'active', 'true'],
          ],
          paint: {
            'circle-radius': 8,
            'circle-color': '#191919',
          },
        },
        {
          id: 'gl-draw-polygon-fill-static',
          type: 'fill',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': '#404040',
            'fill-outline-color': '#404040',
            'fill-opacity': 0.1,
          },
        },
        {
          id: 'gl-draw-polygon-stroke-static',
          type: 'line',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#404040',
            'line-width': 2,
          },
        },
        {
          id: 'gl-draw-line-static',
          type: 'line',
          filter: [
            'all',
            ['==', 'mode', 'static'],
            ['==', '$type', 'LineString'],
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#404040',
            'line-width': 2,
          },
        },
        {
          id: 'gl-draw-point-static',
          type: 'circle',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
          paint: {
            'circle-radius': 5,
            'circle-color': '#404040',
          },
        },
      ],
    });
    this.map.addControl(this.draw as IControl);

    //Llamada a la función onPolygonSelect cuando se selecciona un polígono
    this.map.on('draw.selectionchange' as MapEvent, this.onDrawSelect.bind(this));

    //Llamada a la función polygonCreated cuando se termina de dibujar un polígono
    this.map.on('draw.create' as MapEvent, this.onDrawCreated.bind(this));

    //La función updatedSubareaPolygon se llama cuando se actualiza un polígono
    this.map.on('draw.update' as MapEvent, this.onDrawUpdated.bind(this));

    this.flyToDefaultBbox();

  }

  
  // Funcion para dibujar un polígono en la capa de zonas de estudio seleccionada
  public drawPolygonFromId(id: number) {
    this.toggleStudyZonesVisibility()
    const studyZone = this.studyZoneService.studyZones$.getValue().find((studyZone) => studyZone.id === id);

    let source = this.map.getSource('studyZoneSelected') as mapboxgl.GeoJSONSource;

    const newFeature: GeoJSON.Feature<GeoJSON.Polygon> = {
      type: 'Feature',
      properties: {
        id: studyZone.id,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          studyZone.boundaries.coordinates[0].map((coordinate) => [
            coordinate[1],
            coordinate[0],
          ]),
        ],
      },
    };


  }

  public selectedPolygonFromId(id: number) {
    this.studyZoneSelected$.next(this.allStudyZones.find((studyZone) => studyZone.id === id));
    this.toggleStudyZonesVisibility()
    this.drawPolygonFromId(id);
  }

  public addObservationsToMap(observations: Observations[] = this.observations) {

    //Añadir source para los polygonos de todas las zonas de estudio
    this.map.addSource('allStudyZones', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.studyZones(),
      },
    });

    //Añadir source de punto medio de todas las zonas de estudio
    this.map.addSource('allStudyZonesPoints', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.pointStudyZones(),
      },
    });

    //Añadir la fuente de datos para las lineas de atributo path
    this.map.addSource('polylines', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.polylines(),
      },
    });

    this.map.addSource('startPoints', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.startPoints(),
      },
    });

    //Relleno zona de estudio
    this.map.addLayer({
      id: 'allStudyZone',
      type: 'fill',
      source: 'allStudyZones',
      minzoom: 10,
      paint: {
        'fill-color': [
          "case",
          ['==', ['get', "status"], 'preview'], "#0AA",
          ['==', ['get', "status"], 'selected'], "#0AA",
          "#FF7A1F"
        ],
        'fill-opacity': 0.2,
      },
      layout: {
        'visibility': 'visible'
      },
    });

    //Borde de la zona de estudio
    this.map.addLayer({
      id: 'allStudyZoneLines',
      type: 'line',
      source: 'allStudyZones',
      minzoom: 10,
      paint: {
        'line-color':[
          "case",
          ['==', ['get', "status"], 'preview'], "#0AA",
          ['==', ['get', "status"], 'selected'], "#0AA",
          "#FF7A1F"
        ],
        'line-width': 1,
      },
      layout: {
        'visibility': 'visible'
      },
    });

    //Representamos las zonas de estudio como puntos al estar en zoom 12
    this.map.addLayer({
      id: 'allStudyZonesPoints',
      type: 'circle',
      source: 'allStudyZonesPoints',
      maxzoom: 10,
      paint: {
        'circle-radius': 5,
        'circle-color': [
          "case",
          ['==', ['get', "status"], 'preview'], "#FFF",
          ['==', ['get', "status"], 'selected'], "#0AA",
          "#FFF"
        ],
        'circle-pitch-scale': 'viewport',
        'circle-stroke-color': [
          "case",
          ['==', ['get', "status"], 'preview'], "#0AA",
          ['==', ['get', "status"], 'selected'], "#0AA",
          "#FF7A1F"
        ],
        'circle-stroke-width': 5,
      },
      layout: {
        'visibility': 'visible'
      },
    });

    // Agregar capa para los paths individuales
    this.map.addLayer({
      id: 'LineString',
      type: 'line',
      //filtramos si es zoom es mayor que 14
      //minzoom: 14,
      source: 'polylines',
      layout: {
        'visibility': 'none',
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
        'line-width': ['get', 'width'],
        'line-dasharray': [
          'case',
          ['==', ['get', 'pause'], true],
          [2, 3], // Dasharray si pause es 1
          [1, 0], // Sin dasharray si pause no es 1
        ],
      },
    });

    // Agregar icono de inicio
    this.map.addLayer({
      id: 'start',
      type: 'circle',
      source: 'startPoints',
      layout: {
        'visibility': 'none'
      },
      paint: {
        'circle-radius': 3,
        'circle-color': '#6D6',
        'circle-pitch-scale': 'viewport',
        'circle-stroke-color': '#333',
        'circle-stroke-width': 2,
      },
    });

    this.map.on('click', ['allStudyZone', 'allStudyZonesPoints'], (e: any) => {
      this.selectedPolygonFromId(e.features[0].properties.id);
    });
    this.map.on('mouseenter', ['allStudyZone', 'allStudyZonesPoints'], (e: any) => {
      this.previewStudyZone(e.features[0].properties.id);
      this.map.getCanvas().style.cursor = 'pointer';
     // this.(e.features[0].properties.id);
    });

    this.map.on('mouseleave', ['allStudyZone', 'allStudyZonesPoints'], (e: any) => {
      this.previewStudyZone();
      this.map.getCanvas().style.cursor = 'inherit';
    });

  }

  public toggleObservationsVisibility() {
    let studyZonesLayers : string[] = ['LineString', 'start'];
    for (let layer of studyZonesLayers) {
      let visibility = this.map.getLayoutProperty(layer, 'visibility');
      this.map.setLayoutProperty(layer, 'visibility', visibility === 'visible' ? 'none' : 'visible');
    }
  }

  public toggleStudyZonesVisibility() {
    let studyZonesLayers : string[] = ['allStudyZone', 'allStudyZoneLines', 'allStudyZonesPoints'];
    for (let layer of studyZonesLayers) {
      let visibility = this.map.getLayoutProperty(layer, 'visibility');
      this.map.setLayoutProperty(layer, 'visibility', visibility === 'visible' ? 'none' : 'visible');
    }
  }

  // Función para obtener el polígono de las zonas de estudio
  private getPolygonFromStudyZones(studyZones: StudyZone[]):any {
    return studyZones.map((studyZone) => {
      return {
        type: 'Feature',
        properties: {
          id: studyZone.id,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            studyZone.boundaries.coordinates[0].map((coordinate) => [
              coordinate[1],
              coordinate[0],
            ]),
          ],
        },
      };
    });
  }

  // Función para obtener la media de geolocalizacion de las zonas de estudio
  private getPointFromStudyZones(studyZones: StudyZone[]):any {
    return studyZones.map((studyZone) => {
      return {
        type: 'Feature',
        properties: {
          id: studyZone.id,
        },
        geometry: {
          type: 'Point',
          coordinates: [
            studyZone.boundaries.coordinates[0].reduce((acc, coordinate) => acc + coordinate[1], 0) / studyZone.boundaries.coordinates[0].length,
            studyZone.boundaries.coordinates[0].reduce((acc, coordinate) => acc + coordinate[0], 0) / studyZone.boundaries.coordinates[0].length,
          ],
        },
      };
    });
  }


  //buscamos la id de la feature seleccionada de la capa de puntos de las zonas de estudio
  //y le añadimos la propiedad status con el valor preview
  previewStudyZone(id: number | null = null) {
    let sourcePoints = this.map.getSource('allStudyZonesPoints') as mapboxgl.GeoJSONSource;

    // Eliminamos la propiedad status preview de todos los puntos
    if (id === null) {
      const { features, ...rest } = sourcePoints._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
      const newFeatures = features.map((feature) => {
        //si la feature tiene la propiedad status preview la eliminamos
        if (feature.properties['status'] === 'preview') {
          return { ...feature, properties: { ...feature.properties, status: null } };
        }
        return feature;
      });
      sourcePoints.setData({ features: newFeatures, ...rest });
    }
    const { features, ...rest } = sourcePoints._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    let previewFeature: GeoJSON.Feature<GeoJSON.Geometry> | null = null;
    const newFeatures = features.map((feature) => {
      if (feature.properties['id'] === id) {
        // Ponemos la feature en preview si status no es selected
        if (feature.properties['status'] === 'selected') {
          return feature;
        }
        previewFeature = { ...feature, properties: { ...feature.properties, status: 'preview' } };
        return null; // Eliminamos temporalmente la feature del array
      }
      return feature;
    }).filter(feature => feature !== null) as GeoJSON.Feature<GeoJSON.Geometry>[];

    // Añadimos la feature con preview al final del array
    if (previewFeature) {
      newFeatures.push(previewFeature);
    }

    sourcePoints.setData({ features: newFeatures, ...rest });



    // hacemos lo mismo con los poligonos
    let source = this.map.getSource('allStudyZones') as mapboxgl.GeoJSONSource;

    // Eliminamos la propiedad status preview de todos los poligonos
    if (id === null) {
      const { features, ...rest } = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
      const newFeatures = features.map((feature) => {
        //si la feature tiene la propiedad status preview la eliminamos
        if (feature.properties['status'] === 'preview') {
          return { ...feature, properties: { ...feature.properties, status: null } };
        }
        return feature;
      });
      source.setData({ features: newFeatures, ...rest });
      return;
    }
    const { features: featuresPolygons, ...restPolygons } = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    let previewFeaturePolygon: GeoJSON.Feature<GeoJSON.Geometry> | null = null;
    const newFeaturesPolygons = featuresPolygons.map((feature) => {
      if (feature.properties['id'] === id) {
        // Ponemos la feature en preview si status no es selected
        if (feature.properties['status'] === 'selected') {
          return feature;
        }
        // Ponemos la feature en preview
        previewFeaturePolygon = { ...feature, properties: { ...feature.properties, status: 'preview' } };
        return null; // Eliminamos temporalmente la feature del array
      }
      return feature;
    }).filter(feature => feature !== null) as GeoJSON.Feature<GeoJSON.Geometry>[];

    // Añadimos la feature con preview al final del array
    if (previewFeaturePolygon) {
      newFeaturesPolygons.push(previewFeaturePolygon);
    }

    source.setData({ features: newFeaturesPolygons, ...restPolygons });

  }

  //cambiamos el status y el color de la zona de estudio seleccionada
  //demos primero todos los status en null y luego añadimos el status selected a la zona seleccionada
  selectedStudyZone(id: number | null = null) {
    let sourcePoints = this.map.getSource('allStudyZonesPoints') as mapboxgl.GeoJSONSource;

    // Eliminamos la propiedad status selected de todos los puntos
    const { features, ...rest } = sourcePoints._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    const newFeatures = features.map((feature) => {
      //si la feature tiene la propiedad status selected la eliminamos
      if (feature.properties['status'] === 'selected') {
        return { ...feature, properties: { ...feature.properties, status: null } };
      }
      return feature;
    });
    sourcePoints.setData({ features: newFeatures, ...rest });

    // Eliminamos la propiedad status selected de todos los poligonos
    let source = this.map.getSource('allStudyZones') as mapboxgl.GeoJSONSource;
    const { features: featuresPolygons, ...restPolygons } = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    const newFeaturesPolygons = featuresPolygons.map((feature) => {
      //si la feature tiene la propiedad status selected la eliminamos
      if (feature.properties['status'] === 'selected') {
        return { ...feature, properties: { ...feature.properties, status: null } };
      }
      return feature;
    });
    source.setData({ features: newFeaturesPolygons, ...restPolygons });

    if (id === null) {
      return;
    }

    // Añadimos la propiedad status selected a la feature con la id seleccionada
    const newFeature = newFeatures.find((feature) => feature.properties['id'] === id);
    if (newFeature) {
      newFeature.properties['status'] = 'selected';
    }
    sourcePoints.setData({ features: newFeatures, ...rest });

    // Añadimos la propiedad status selected a la feature con la id seleccionada
    const newFeaturePolygon = newFeaturesPolygons.find((feature) => feature.properties['id'] === id);
    if (newFeaturePolygon) {
      newFeaturePolygon.properties['status'] = 'selected';
    }
    source.setData({ features: newFeaturesPolygons, ...restPolygons });
  
  }


  public flyToDefaultBbox() {
    this.map.fitBounds(this.defaultBbox, { padding: { top: 10, bottom: 10, left: 10, right: 10 } });
  }
}
