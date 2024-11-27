import { inject, Injectable } from '@angular/core';

import mapboxgl, { LngLat, LngLatBounds, Map } from 'mapbox-gl';

import { FeatureCollection, Geometry } from 'geojson';

import { BehaviorSubject } from 'rxjs';


import { ObservationsService } from '../../../services/observations/observations.service';
import { MapLayer, MapObservation } from '../../../models/map';
import { FormFilterValues } from '../../../models/forms';
import { Observations } from '../../../models/observations';
import { StudyZone } from '../../../models/study-zone';
import { StudyZoneService } from '../../../services/study-zone/study-zone.service';
import { MessageService } from 'primeng/api';
import { GeoJSONObject } from '@turf/turf';

export interface Feature<G extends GeoJSON.Geometry | null = GeoJSON.Geometry, P = { [name: string]: any } | null> extends GeoJSONObject {
  type: "Feature";
  geometry: G;
  id?: string | number | undefined;
  properties: P;
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public map!: Map;

  get isMapReady(): boolean {
    return !!this.map;
  }

  private messageService = inject(MessageService);

  public isFilterActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isFilterBtnDisbaled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public mapLayers: BehaviorSubject<MapLayer[]> = new BehaviorSubject<MapLayer[]>([]);


  private mapObservations: MapObservation[] = [];
  private filteredFeatures: Feature[] = [];
  private filteredStartPointsFeature: Feature[] = [];
  public features$: BehaviorSubject<Feature[]> = new BehaviorSubject<Feature[]>([]);
  public startPointsFeatures$: BehaviorSubject<Feature[]> = new BehaviorSubject<Feature[]>([]);
  private language: string = localStorage.getItem('locale') || 'ca';
  public initialGeoJson: { type: string; features: Feature[] } = {
    type: 'FeatureCollection',
    features: [],
  };

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
  public observationSelected!: Observations;

  public isOpenObservationInfoModal: BehaviorSubject<boolean>   = new BehaviorSubject<boolean>(false);
  public studyZoneSelected$: BehaviorSubject<StudyZone | null>  = new BehaviorSubject<StudyZone | null>(null);
  public studyZoneDialogVisible$: BehaviorSubject<boolean>      = new BehaviorSubject<boolean>(false);

  private defaultBbox:[[number, number], [number, number]] = [[0.048229834542042, 40.416428760865], [3.3736729893935, 42.914194523824]]; // Catalonia bbox

  constructor(
    private observationsService: ObservationsService,
    private studyZoneService: StudyZoneService,
  ) {
    //Subscribe to know if the filter is active
    this.isFilterActive.subscribe((isFilterActive) => {
      if (!this.map) return;
      if (isFilterActive) {
        //update the geojson
        this.updateSourceObservations(this.filteredFeatures, this.filteredStartPointsFeature);
      } else {
        //update the geojson
        this.updateSourceObservations(this.features$.getValue(), this.startPointsFeatures$.getValue());
      }
    });
  }

  //Conseguir todos los sonidos en el constructor
  public getAllMapObservations(): void {
    if(this.observationsService.observations$.getValue().length === 0) {      
      this.observationsService.observations$.subscribe((data) => {
        this.prepareDataForMap(data);
      })
      return;
    }
      
    this.prepareDataForMap(this.observationsService.observations$.getValue());
    
  }

  private prepareDataForMap(data: Observations[]): void {
    try {
      const features = this.observationsService.getLineStringFromObservations(data);
      const startPoints = this.observationsService.getStartPointsFromObservations(data);
      this.mapObservations = data.map((obs) => ({
        id:         obs.id,
        user_id:    obs.relationships.user.id,
        user_level: obs.relationships.user.attributes.level,
        latitude:   obs.attributes.latitude,
        longitude:  obs.attributes.longitude,
        created_at: new Date(obs.attributes.created_at),
        types:      obs.relationships.types.map((type) => type.id),
        Leq:        obs.attributes.Leq,
        userType:   obs.relationships.user.type,
        quiet:      obs.attributes.quiet,
        influence:  +obs.attributes.influence,
        path:       obs.relationships.segments,
      }));
      this.features$.next(features as Feature[]);
      this.updateSourceObservations(features as Feature[], startPoints as Feature[]);
    } catch (error) {
      console.error(error);
      throw Error(`Error getting all observations ${error}`);
    }
  }
    

  public updateSourceObservations(features: Feature[], startPointFeatures: Feature[]): void {
    if (!this.isMapReady) return;
    let isSource = !!this.map.getSource('observations');
    let geoJson = {
      type: 'FeatureCollection' as const,
      features: features,
    };
    let startPointsGeoJson = {
      type: 'FeatureCollection' as const,
      features: startPointFeatures,
    };

    if (isSource) {
      let source = this.map.getSource('observations') as mapboxgl.GeoJSONSource;
      let sourceStartPoints = this.map.getSource('startPoints') as mapboxgl.GeoJSONSource;
      source.setData(geoJson as FeatureCollection<Geometry>);
      sourceStartPoints.setData(startPointsGeoJson as FeatureCollection<Geometry>);
    } else {
      this.map.on('load', () => {
        let source = this.map.getSource('observations') as mapboxgl.GeoJSONSource;
        let sourceStartPoints = this.map.getSource('startPoints') as mapboxgl.GeoJSONSource;
        source.setData(geoJson as FeatureCollection<Geometry>);
        sourceStartPoints.setData(startPointsGeoJson as FeatureCollection<Geometry>);
      });
    }
  }
  
  public setMap(map: Map): void {
    this.map = map;
    //agregamos controles de zoom al mapa
    this.map.addControl(new mapboxgl.NavigationControl(),'bottom-right');
    this.flyToDefaultBbox();
  }

  //Add mouse pointer on cluster hover
  private mouseEvent(evt: any) {
    if (evt.type === 'mouseenter' && evt.features.length === 1) {
      const featureId = evt.features[0].properties.id;
      this.map.getCanvas().style.cursor = 'pointer';
      this.map.setFilter('lineLayer-hover', ['==', 'id', featureId]);
      return;
    }
    // if (!this.featureIdSelected) return;
    this.map.getCanvas().style.cursor = '';
    this.map.setFilter('lineLayer-hover', ['==', 'id', '']);
  }

  //Filter obs
  public filterMapObservations(values: FormFilterValues) {
    //He de valorar los que son booleanos primero
    //El valor de si se aplican los filtros estará aquí.
    try {
      let mapObs = this.mapObservations;
      const { type, days, soundPressure, hours, typeUser, positivePlace } =
        values;
      const {
        typeFilter,
        daysFilter,
        soundPressureFilter,
        hoursFilter,
        typeUsers,
        positivePlaces,
      } = values;

      if (type || days || soundPressure || hours || typeUser || positivePlace) {
        this.isFilterBtnDisbaled.next(false);
      } else {
        this.isFilterBtnDisbaled.next(true);
      }

      if (type) {
        const typesToFilter = Object.keys(typeFilter).filter(
          (key) => typeFilter[Number(key) as keyof typeof typeFilter]
        );
        mapObs = mapObs.filter((obs) =>
          obs.types.some((obsType) =>
            typesToFilter.some((type) => Number(type) === Number(obsType))
          )
        );
      }
      if (positivePlace) {
        const typesToFilter = Object.keys(positivePlaces).filter(
          (key) => positivePlaces[Number(key) as keyof typeof positivePlaces]
        );
        mapObs = mapObs.filter((obs) =>
          typesToFilter.some((type) => obs.influence === Number(type))
        );
      }
      if (typeUser) {
        const usersMaxAndMin = typeUsers.map((user) => {
          return { min: user.min, max: user.max };
        });

        mapObs = mapObs.filter((obs) => {
          const userLevel = obs.user_level;
          return usersMaxAndMin.some(
            (user) => user.min <= userLevel && user.max >= userLevel
          );
        });
      }
      if (days) {
        daysFilter[0].setHours(0, 0, 0, 0);

        const isOneDate =
          !daysFilter[1] ||
          daysFilter[0].getTime() === daysFilter[1]?.getTime();

        if (!isOneDate) {
          mapObs = mapObs.filter((obs) => {
            const obsDate = new Date(obs.created_at);
            obsDate.setHours(0, 0, 0, 0);
            daysFilter[1].setHours(0, 0, 0, 0);
            return (
              obsDate.getTime() >= daysFilter[0].getTime() &&
              obsDate.getTime() <= daysFilter[1].getTime()
            );
          });
        } else {
          mapObs = mapObs.filter((obs) => {
            const obsDate = new Date(obs.created_at);
            obsDate.setHours(0, 0, 0, 0);
            return obsDate.getTime() === daysFilter[0].getTime();
          });
        }
      }
      if (soundPressure) {
        mapObs = mapObs.filter(
          (obs) =>
            Number(obs.Leq) <= soundPressureFilter[1] &&
            Number(obs.Leq) >= soundPressureFilter[0]
        );
      }
      if (hours) {
        mapObs = mapObs.filter((obs) => {
          const obsDate = new Date(obs.created_at);
          return (
            obsDate.getHours() >= hoursFilter[0] &&
            obsDate.getHours() <= hoursFilter[1]
          );
        });
      }

      const observations = this.observationsService.observations$
        .getValue()
        .filter((obs) => {
          return mapObs.some((mapObs) => mapObs.id === obs.id);
        });

      //Get all features
      const features = this.observationsService.getLineStringFromObservations(observations);
      const startPoints = this.observationsService.getStartPointsFromObservations(observations);

      this.filteredFeatures = features as Feature[];

      //update the geojson
      this.updateSourceObservations(features as Feature[], startPoints as Feature[]);
    } catch (error) {
      console.error(error);
      throw Error(`Error filtering map observations ${error}`);
    }
  }

  private buildClustersAndLayers(features: Feature[]): void {

    //Añadir la fuente de datos para las lineas de atributo path
    this.map.addSource('observations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features as Feature<Geometry,{[name: string]: any;}>[],
      },
    });

    //Añadir source para los polygonos de las zonas de estudio
    this.map.addSource('studyZone', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    //Añadir source para los puntos de inicio de las rutas
    this.map.addSource('startPoints', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    //Relleno zona de estudio
    this.map.addLayer({
      id: 'studyZone',
      type: 'fill',
      source: 'studyZone',
      paint: {
        'fill-color': '#FF7A1F',
        'fill-opacity': 0.2,
      },
    });
    //Borde de la zona de estudio
    this.map.addLayer({
      id: 'studyZoneLines',
      type: 'line',
      source: 'studyZone',
      paint: {
        'line-color': '#FF7A1F',
        'line-width': 2,
      },
    });

    // resaltar la línea a la que se hace hover de color negro
    this.map.addLayer({
      id: 'lineLayer-hover',
      type: 'line',
      source: 'observations',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#333',
        'line-width': 16,
        'line-gap-width': 0,
      },
      filter: ['==', 'id', ''], // Filtro vacío para iniciar
    });

    // Agregar capa para los paths individuales
    this.map.addLayer({
      id: 'LineString',
      type: 'line',
      source: 'observations',
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

    this.map.moveLayer('studyZoneLines', 'lineLayer-hover');
    this.map.moveLayer('studyZone', 'lineLayer-hover');
  }

  public drawSZPolygonFromId(studyZone: StudyZone): void {
    let source = this.map.getSource('studyZone') as mapboxgl.GeoJSONSource;

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
    //Add the new feature to the studyZone source
    const data = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    data.features.push(newFeature);

    source.setData(data);
  }

  public eraseSZPolygonFromId() {
    let source = this.map.getSource('studyZone') as mapboxgl.GeoJSONSource;
    const { features, ...rest } = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    source.setData({ features: [], ...rest });
  }

  public eraseAllSZPolygons() {
    let source = this.map.getSource('studyZone') as mapboxgl.GeoJSONSource;
    source.setData({ features: [], type: 'FeatureCollection' });
  }

  public selectStudyZone(id: number): void {
    const SZselected = this.studyZoneService.studyZones$
      .getValue()
      .find((studyZone) => studyZone.id === id);
    this.studyZoneSelected$.next(SZselected);
  }

  public initializeMap(): void {
    if (!this.isMapReady) return;

    //Build all clusters and layers after the style is loaded
    //Usefull when toggling between style map layers
    this.map.on('style.load', () => {
      //I want to detect if the layer with id observations exists
      if (this.isFilterActive.getValue()) {
        //update the geojson
        this.buildClustersAndLayers(this.filteredFeatures);
      } else {
        //update the geojson
        this.buildClustersAndLayers(this.features$.getValue());
      }

      this.map.on('styledata', () => {
        //Update language
        this.map.setLayoutProperty('country-label', 'text-field', [
          'get',
          `name_${this.language}`,
        ]);
      })
    });

    // Add event listeners for 'mouseenter' and 'mouseleave' events on layers
    this.map.on('mouseenter', 'LineString', this.mouseEvent.bind(this));
    this.map.on('mouseleave', 'LineString', this.mouseEvent.bind(this));
    /*this.map.on('mouseenter', 'studyZone', (e: any) => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'studyZone', (e: any) => {
      this.map.getCanvas().style.cursor = 'inherit';
    });*/

    this.map.on('click', 'LineString', (e) => {
      const feature = e.features[0];

      const obs = this.observationsService.observations$
        .getValue()
        .find((obs) => obs.id === feature.properties['id']);
      this.observationSelected = obs;
      this.isOpenObservationInfoModal.next(true);
    });

    /*this.map.on('click', 'studyZone', (e: any) => {
      this.map.getCanvas().style.cursor = 'inherit';
      if (e.features.length > 0) {
        this.showStudyZoneModal(e.features[0].properties.id);
      }
    });*/
  }

  public flyToDefaultBbox() {
    this.map.fitBounds(this.defaultBbox, { padding: { top: 10, bottom: 10, left: 10, right: 10 } });
  }

  public addGeoJson(layers:{type: string; features: Feature<Geometry, { [name: string]: any; }>[], name: string}[]) {

    if (!this.isMapReady) return;

    let mapLayers: MapLayer[] = [];

    let loadedMapLayers = this.mapLayers.getValue();

    let countMapLayers = loadedMapLayers.length ;

    layers.forEach((layer, index) => {
      let id = countMapLayers + 1 + index;
      let name = layer.name && layer.name !== "" ? layer.name : `Unnamed layer`;
      let slug = name.toLowerCase() + ` ${id}`.replace(/ /g, '_').replace(/[^\w-]+/g,'');
      let color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      while(color.length < 7) {
        color = color + '0';
      }
      mapLayers.push({
        id: id,
        name: name,
        slug: slug,
        color: color,
        show: true,
        features: layer.features,
      });
    });

    loadedMapLayers = [...loadedMapLayers, ...mapLayers];

    this.mapLayers.next(loadedMapLayers);

    mapLayers.forEach((layer, index) => {

      const name = 'waterway-label';

      let polygons: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
        type: 'FeatureCollection',
        features: [],
      };
      let lines: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
        type: 'FeatureCollection',
        features: [],
      };
      let points: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
        type: 'FeatureCollection',
        features: [],
      };

      // Añadir la capa dependiendo del tipo de geometría
      layer.features.forEach((feature) => {
        const geometryType = feature.geometry.type;

        if(geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
          polygons.features.push(feature);
        }
        else if(geometryType === 'LineString' || geometryType === 'MultiLineString') {
          lines.features.push(feature);
        }
        else if(geometryType === 'Point' || geometryType === 'MultiPoint') {
          points.features.push(feature);
        }
      });

      if(polygons.features.length > 0) {

        // Añadir fuente de polígonos
        this.map.addSource(layer.slug + '-polygons', {
          type: 'geojson',
          data: polygons,
        });

        // Añadir capa de polígonos
        this.map.addLayer({
          id: layer.slug + '-polygons',
          type: 'fill',
          source: layer.slug + '-polygons',
          paint: {
            'fill-color': layer.color,
            'fill-opacity': 0.2,
          },
          filter: ['==', '$type', 'Polygon'],
        });

        // Añadir capa de líneas para los polígonos
        this.map.addLayer({
          id: layer.slug + '-polygons-lines',
          type: 'line',
          source: layer.slug + '-polygons',
          paint: {
            'line-color': layer.color,
            'line-width': 2,
          },
          filter: ['==', '$type', 'Polygon'],
        });

        this.map.moveLayer(layer.slug + '-polygons-lines', name);
        this.map.moveLayer(layer.slug + '-polygons', name);
        // Añadimos evento de click
        // this.map.on('click', 'gpkg-polygons', (e) => {
        //   const feature = e.features[0];
        //   this.messageService.add({
        //     severity: 'info',
        //     summary: 'Polígono seleccionado',
        //     detail: this.getAllFeatureProperties(feature),
        //   });
        // });

      }

      if(lines.features.length > 0) {

        // Añadir fuente de líneas
        this.map.addSource(layer.slug + '-lines', {
          type: 'geojson',
          data: lines,
        });

        // Añadir capa de líneas
        this.map.addLayer({
          id: layer.slug + '-lines',
          type: 'line',
          source: layer.slug + '-lines',
          paint: {
            'line-color': layer.color,
            'line-width': 2,
          },
          filter: ['==', '$type', 'LineString'],
        });

        this.map.moveLayer(layer.slug + '-lines', name);

        // Añadimos evento de click
        // this.map.on('click', 'gpkg-lines', (e) => {
        //   const feature = e.features[0];
        //   this.messageService.add({
        //     severity: 'info',
        //     summary: 'Linea seleccionada',
        //     detail: this.getAllFeatureProperties(feature),
        //   });
        // });

      }

      if(points.features.length > 0) {

        // Añadir fuente de puntos
        this.map.addSource(layer.slug + '-points', {
          type: 'geojson',
          data: points,
        });

        // Añadir capa de puntos
        this.map.addLayer({
          id: layer.slug + '-points',
          type: 'circle',
          source: layer.slug + '-points',
          paint: {
            'circle-radius': 5,
            'circle-color': layer.color,
          },
          filter: ['==', '$type', 'Point'],
        });

        this.map.moveLayer(layer.slug + '-points', name);

        // Añadimos evento de click
        // this.map.on('click', 'gpkg-points', (e) => {
        //   const feature = e.features[0];
        //   this.messageService.add({
        //     severity: 'info',
        //     summary: 'Punto seleccionada',
        //     detail: this.getAllFeatureProperties(feature),
        //   });
        // });
      }
    });
  }

  private getAllFeatureProperties(feature: any): string {
    let properties = '';
    for (const key in feature.properties) {
      properties += `${key}: ${feature.properties[key]} \n \n`;
    }
    return properties;
  }

  public toggleLayerVisibility(layerId: number) {
    this.mapLayers.getValue().forEach((layer) => {
      if(layer.id === layerId) {
        if(this.map.getLayer(layer.slug + '-polygons')) {
          if(this.map.getLayoutProperty(layer.slug + '-polygons', 'visibility') === 'visible' || !this.map.getLayoutProperty(layer.slug + '-polygons', 'visibility')){
            this.map.setLayoutProperty(layer.slug + '-polygons', 'visibility', 'none');
            this.map.setLayoutProperty(layer.slug + '-polygons-lines', 'visibility', 'none');
          }
          else{
            this.map.setLayoutProperty(layer.slug + '-polygons', 'visibility', 'visible');
            this.map.setLayoutProperty(layer.slug + '-polygons-lines', 'visibility', 'visible');
          }
        }
        if(this.map.getLayer(layer.slug + '-lines')) {
          if(this.map.getLayoutProperty(layer.slug + '-lines', 'visibility') === 'visible' || !this.map.getLayoutProperty(layer.slug + '-lines', 'visibility'))
            this.map.setLayoutProperty(layer.slug + '-lines', 'visibility', 'none');
          else
            this.map.setLayoutProperty(layer.slug + '-lines', 'visibility', 'visible');
        }
        if(this.map.getLayer(layer.slug + '-points')) {
          if(this.map.getLayoutProperty(layer.slug + '-points', 'visibility') === 'visible' || !this.map.getLayoutProperty(layer.slug + '-points', 'visibility'))
            this.map.setLayoutProperty(layer.slug + '-points', 'visibility', 'none');
          else
            this.map.setLayoutProperty(layer.slug + '-points', 'visibility', 'visible');
        }

      }
    });
  }

  deleteLayer(layerId: number) {
    let mapLayers = this.mapLayers.getValue();
    let layer = mapLayers.find((layer) => layer.id === layerId);

    if(this.map.getLayer(layer.slug + '-polygons')) this.map.removeLayer(layer.slug + '-polygons');
    if(this.map.getLayer(layer.slug + '-polygons-lines')) this.map.removeLayer(layer.slug + '-polygons-lines');
    if(this.map.getLayer(layer.slug + '-lines')) this.map.removeLayer(layer.slug + '-lines');
    if(this.map.getLayer(layer.slug + '-points')) this.map.removeLayer(layer.slug + '-points');

    this.mapLayers.next(mapLayers.filter((layer) => layer.id !== layerId));
  }

  changeLayerColor(layerId: number, color: string) {
    let mapLayers = this.mapLayers.getValue();
    let layer = mapLayers.find((layer) => layer.id === layerId);

    if(this.map.getLayer(layer.slug + '-polygons')) this.map.setPaintProperty(layer.slug + '-polygons', 'fill-color', color);
    if(this.map.getLayer(layer.slug + '-polygons-lines')) this.map.setPaintProperty(layer.slug + '-polygons-lines', 'line-color', color);
    if(this.map.getLayer(layer.slug + '-lines')) this.map.setPaintProperty(layer.slug + '-lines', 'line-color', color);
    if(this.map.getLayer(layer.slug + '-points')) this.map.setPaintProperty(layer.slug + '-points', 'circle-color', color);
  }


  showStudyZoneModal(id:number){
    if(this.isOpenObservationInfoModal.getValue()) return;
    this.selectStudyZone(id);
    this.studyZoneDialogVisible$.next(true);
  }

  getObservationsByPolygonAndDates( polygon: string[], hourDates: [string, string] ){
    this.observationsService.getObservationsByPolygonAndDates( polygon, hourDates ).subscribe((data) => {
      this.prepareDataForMap(data);
    });
  }
}
