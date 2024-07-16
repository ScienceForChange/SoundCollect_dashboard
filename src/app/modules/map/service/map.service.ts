import { Injectable } from '@angular/core';

import mapboxgl, { LngLat, LngLatBounds, Map } from 'mapbox-gl';

import { FeatureCollection, Geometry } from 'geojson';

import { BehaviorSubject } from 'rxjs';

import { Feature } from '@turf/turf';

import { ObservationsService } from '../../../services/observations/observations.service';
import { MapObservation } from '../../../models/map';
import { FormFilterValues } from '../../../models/forms';
import { Observations } from '../../../models/observations';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public map!: Map;

  get isMapReady(): boolean {
    return !!this.map;
  }

  public isFilterActive: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private mapObservations: MapObservation[] = [];
  private filteredFeatures: Feature[] = [];
  public features$: BehaviorSubject<Feature[]> = new BehaviorSubject<Feature[]>(
    []
  );
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
    mapStyle: 'mapbox://styles/mapbox/light-v10',
    centerMapLocation: [2.1487613, 41.3776589],
    minZoom: 2,
    maxZoom: 17,
    bounds: new LngLatBounds(new LngLat(-90, 90), new LngLat(90, -90)),
    clusterMaxZoom: 17,
  };
  public observationSelected!: Observations;
  public isOpenObservationInfoModal: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  constructor(private observationsService: ObservationsService) {
    //Subscribe to know if the filter is active
    this.isFilterActive.subscribe((isFilterActive) => {
      if (!this.map) return;
      if (isFilterActive) {
        //update the geojson
        this.updateSourceObservations(this.filteredFeatures);
      } else {
        //update the geojson
        this.updateSourceObservations(this.features$.getValue());
      }
    });
  }

  //Conseguir todos los olores en el constructor
  public getAllMapObservations(): void {
    if (this.mapObservations.length > 0) {
      this.updateSourceObservations(this.features$.getValue());
      return;
    }
    this.observationsService.observations$.subscribe((data) => {
      const features =
        this.observationsService.getLineStringFromObservations(data);
      if (features.length === 0) return;
      this.mapObservations = data.map((obs) => ({
        id: obs.id,
        user_id: obs.relationships.user.id,
        user_level: obs.relationships.user.attributes.level,
        latitude: obs.attributes.latitude,
        longitude: obs.attributes.longitude,
        created_at: new Date(obs.attributes.created_at),
        types: obs.relationships.types.map((type) => type.id),
        Leq: obs.attributes.Leq,
        userType: obs.relationships.user.type,
        quiet: obs.attributes.quiet,
        path: obs.relationships.segments,
      }));
      this.features$.next(features as Feature[]);
      this.updateSourceObservations(features as Feature[]);
    });
  }

  public updateSourceObservations(features: Feature[]): void {
    let isSource = !!this.map.getSource('observations');
    let geoJson = {
      type: 'FeatureCollection' as const,
      features: features,
    };
    if (isSource) {
      let source = this.map.getSource('observations') as mapboxgl.GeoJSONSource;
      source.setData(geoJson as FeatureCollection<Geometry>);
    } else {
      this.map.on('load', () => {
        let source = this.map.getSource(
          'observations'
        ) as mapboxgl.GeoJSONSource;
        source.setData(geoJson as FeatureCollection<Geometry>);
      });
    }
  }

  public setMap(map: Map): void {
    this.map = map;
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
    let mapObs = this.mapObservations;
    const { type, days, soundPressure, hours, typeUser } = values;
    const {
      typeFilter,
      daysFilter,
      soundPressureFilter,
      hoursFilter,
      typeUsers,
    } = values;
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
    if (typeUser) {
      const usersMaxAndMin = typeUsers.map((user) => {
        return { min: user.min, max: user.max };
      });

      mapObs = mapObs.filter((obs) => {
        const userLevel = obs.user_level;
        return usersMaxAndMin.some((user) => user.min <= userLevel && user.max >= userLevel);
      });

    }
    if (days) {
      const isOneDate =
        !daysFilter[1] || daysFilter[0].getDate() === daysFilter[1]?.getDate();

      if (!isOneDate) {
        mapObs = mapObs.filter((obs) => {
          const obsDate = new Date(obs.created_at);
          return (
            obsDate.getDate() >= daysFilter[0].getDate() &&
            obsDate.getDate() <= daysFilter[1].getDate()
          );
        });
      } else {
        mapObs = mapObs.filter((obs) => {
          const obsDate = new Date(obs.created_at);
          return obsDate.getDate() === daysFilter[0].getDate();
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
    const features =
      this.observationsService.getLineStringFromObservations(observations);

    this.filteredFeatures = features as Feature[];

    //update the geojson
    this.updateSourceObservations(features as Feature[]);
  }

  private buildClustersAndLayers(features: Feature[]): void {
    //Añadir la fuente de datos para las lineas de atributo path
    this.map.addSource('observations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features as Feature<
          Geometry,
          {
            [name: string]: any;
          }
        >[],
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
        'line-width': 3,
        'line-gap-width': 5,
      },
      filter: ['==', 'id', ''], // Filtro vacío para iniciar
    });

    // Agregar capa para los paths individuales
    this.map.addLayer({
      id: 'LineString',
      type: 'line',
      source: 'observations',
      //minzoom: 20,
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
        'line-width': ['get', 'width'],
        'line-dasharray': [
          'case',
          ['==', ['get', 'pause'], true],
          [2, 3], // Dasharray si pause es 1
          [1, 0], // Sin dasharray si pause no es 1
        ],
      },
    });
  }
  //TODO MAKE A LOADING FOR MAP
  public initializeMap(): void {
    if (!this.isMapReady) return;

    this.map.on('load', () => {
      //Change map language to ES
      //Catalan does not exist in mapbox
      this.map.setLayoutProperty('country-label', 'text-field', [
        'get',
        `name_es`,
      ]);
    });

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
    });

    // // Add event listeners for 'zoomstart' and 'touchstart' events
    // this.map.on('zoomstart', this.deletePointsSpiderfy.bind(this));
    // this.map.on('touchstart', this.deletePointsSpiderfy.bind(this));

    // // Add event listeners for 'click' events on layers
    // this.map.on('click', 'clusters', this.centerZoomCluster.bind(this));

    // Add event listeners for 'mouseenter' and 'mouseleave' events on layers
    this.map.on('mouseenter', 'LineString', this.mouseEvent.bind(this));
    this.map.on('mouseleave', 'LineString', this.mouseEvent.bind(this));

    this.map.on('click', 'LineString', (e) => {
      const feature = e.features[0];

      const obs = this.observationsService.observations$
        .getValue()
        .find((obs) => obs.id === feature.properties['id']);
      this.observationSelected = obs;
      this.isOpenObservationInfoModal.next(true);
    });
  }
}
