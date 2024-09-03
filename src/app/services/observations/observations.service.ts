import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  map,
  filter,
  switchMap,
} from 'rxjs';

import * as turf from '@turf/turf';

import { Parser } from '@json2csv/plainjs';

import { saveAs } from 'file-saver';

import tokml from "@maphubs/tokml"

import { environment } from '../../../environments/environment';
import { Observations, ObservationsDataChart } from '../../models/observations';
import { Json2CSVBaseOptions } from '@json2csv/plainjs/dist/mjs/BaseParser';

export interface Feature<
  G extends GeoJSON.Geometry | null = GeoJSON.Geometry,
  P = { [name: string]: any } | null
> extends turf.GeoJSONObject {
  type: 'Feature';
  geometry: G;
  id?: string | number | undefined;
  properties: P;
}
export interface Tag {
  key: string;
  value: number;
}
@Injectable({
  providedIn: 'root',
})
export class ObservationsService {
  observations$: BehaviorSubject<Observations[]> = new BehaviorSubject<
    Observations[]
  >([]);
  tags: Tag[] = [];

  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private http: HttpClient) {}

  public getAllObservations(): void {
    this.loading$.next(true);
    this.http
      .get<{ success: string; data: Observations[] }>(
        `${environment.BACKEND_BASE_URL}/observations?with-levels=true`
      )
      .pipe(
        map((res) => {
          try {
            const observationsBetween20and80 = res.data.filter(
              (obs) => +obs.attributes.Leq >= 20 && +obs.attributes.Leq <= 80
            );
            return observationsBetween20and80;
          } catch (error) {
            console.error(error);
            throw Error('Error filtering observations', error);
          }
        })
      )
      .subscribe({
        next: (data) => {
          this.observations$.next(data);
          this.loading$.next(false);
        },
        error: (error) => {
          console.error(error);
          this.loading$.next(false);
        },
      });
  }

  public getAllObservationsNumbers(): Observable<any> {
    return this.observations$.pipe(
      filter((value) => value.length > 0),
      map((observations) => {
        try {
          const observationsByUser: {
            [key: string]: { [key: number]: number };
          } = observations.reduce((acc, obs) => {
            const userId = obs.relationships.user.id;
            if (!acc[userId]) {
              acc[userId] = Array.from({ length: 12 }, (_, i) => i + 1).reduce(
                (acc, month) => ({ ...acc, [month]: 0 }),
                {}
              );
            }
            const month = new Date(obs.attributes.created_at).getMonth() + 1;
            acc[userId][month]++;
            return acc;
          }, {} as { [key: string]: { [key: number]: number } });

          const numberOfDifferentUsers = Object.keys(observationsByUser).length;
          const totalObservations = observations.length;

          const averageObservationsPerUserPerMonth =
            totalObservations / 12 / numberOfDifferentUsers;

          const observationsByAge = {
            '<18': 0,
            '18-30': 0,
            '30-40': 0,
            '40-50': 0,
            '>50': 0,
          };
          const observationsByUserGender = {
            male: 0,
            female: 0,
            others: 0,
            'non-binary': 0,
            'prefer-not-to-say': 0,
            // null: 0,
          };

          const uniqueUserProfiles = Object.keys(observationsByUser).map(
            (userId) => {
              const userProfile = observations.find(
                (obs) => obs.relationships.user.id === userId
              )?.relationships.user.attributes.profile;
              const birthYear = userProfile?.birthYear as number;
              const year = new Date().getFullYear();
              const yearsOld = year - birthYear;
              return { ...userProfile, yearsOld };
            }
          );

          uniqueUserProfiles.forEach((user) => {
            if (user.yearsOld < 18) {
              observationsByAge['<18']++;
            } else if (user.yearsOld >= 18 && user.yearsOld < 30) {
              observationsByAge['18-30']++;
            } else if (user.yearsOld >= 30 && user.yearsOld < 40) {
              observationsByAge['30-40']++;
            } else if (user.yearsOld >= 40 && user.yearsOld < 50) {
              observationsByAge['40-50']++;
            } else {
              observationsByAge['>50']++;
            }
          });
          uniqueUserProfiles.forEach((user) => {
            switch (user.gender) {
              case 'male':
                observationsByUserGender.male++;
                break;
              case 'female':
                observationsByUserGender.female++;
                break;
              case 'others':
                observationsByUserGender.others++;
                break;
              case 'prefer-not-to-say':
                observationsByUserGender['prefer-not-to-say']++;
                break;
              case 'non-binary':
                observationsByUserGender['non-binary']++;
                break;
              default:
                // observationsByUserGender.null++;
                break;
            }
          });

          return {
            numberOfDifferentUsers,
            totalObservations,
            averageObservationsPerUserPerMonth,
            observationsByGender: Object.entries(observationsByUserGender).map(
              ([genre, value]) => ({ genre, value })
            ),
            observationsByAge: Object.entries(observationsByAge).map(
              ([age, value]) => ({ age, value })
            ),
          };
        } catch (error) {
          console.error(error);
          throw Error('Error getting observations numbers', error);
        }
      })
    );
  }

  public getAllObservationsFormated(): Observable<ObservationsDataChart[]> {
    return this.observations$.pipe(
      filter((value) => value.length > 0),
      map((observations) => {
        try {
          const arrOfDaysObservationsCout = observations
            .sort(
              (a, b) =>
                new Date(a.attributes.created_at).getTime() -
                new Date(b.attributes.created_at).getTime()
            )
            .reduce(
              (
                acc: {
                  [key: string]: {
                    date: string;
                    obs: Observations[];
                    count: number;
                  };
                },
                obs
              ) => {
                const key = obs.attributes.created_at.split(' ')[0];
                if (!acc[key]) {
                  acc[key] = {
                    date: obs.attributes.created_at,
                    obs: [],
                    count: 0,
                  };
                }
                acc[key].obs.push(obs);
                acc[key].count++;
                return acc;
              },
              {}
            );

          const arrOfDays = Object.values(arrOfDaysObservationsCout);
          let firstDay = new Date(arrOfDays[0].date);
          let lastDay = new Date(arrOfDays[arrOfDays.length - 1].date);

          let currentDate = new Date(firstDay.setHours(0, 0, 0, 0));
          let endDay = new Date(lastDay.setHours(0, 0, 0, 0));
          let allDays = [];

          while (currentDate <= endDay) {
            const dayValue = arrOfDays.find((value) => {
              const valueDate = new Date(value.date).setHours(0, 0, 0, 0);
              return valueDate === currentDate.getTime();
            });
            if (!!dayValue) {
              const date = new Date(dayValue.date);
              const day = new Intl.DateTimeFormat('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(date);
              //set to 00:00:00 to be able to compare them correctly
              const currentDateHours0 = new Date(dayValue.date);
              currentDateHours0.setHours(0, 0, 0, 0);
              allDays.push({
                ...dayValue,
                completeDay: currentDateHours0,
                date: day,
              });
            } else {
              const day = new Intl.DateTimeFormat('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(currentDate);
              //set to 00:00:00 to be able to compare them correctly

              const currentDateHours0 = new Date(currentDate);
              currentDateHours0.setHours(0, 0, 0, 0);
              allDays.push({
                count: 0,
                obs: [],
                completeDay: currentDateHours0,
                date: day,
              });
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          return allDays;
        } catch (error) {
          console.error(error);
          throw Error('Error formatting observations', error);
        }
      })
    );
  }

  public getAllObservationsByRegion(): Observable<{
    geojson: any;
    values: { name: string; value: number }[];
  }> {
    try {
      return this.observations$.pipe(
        filter((value) => value.length > 0),
        switchMap((observations) => {
          const catalunyaGeoJsonUrl =
            '../../../assets/shapefiles_catalunya_comarcas.geojson';
          return this.http.get<any>(catalunyaGeoJsonUrl).pipe(
            map((catalunyaGeoJson) => {
              const values = catalunyaGeoJson.features.map((comarca: any) => {
                const obsCount = observations.filter((obs) => {
                  let point = turf.point([
                    Number(obs.attributes.longitude),
                    Number(obs.attributes.latitude),
                  ]);
                  const isInside = turf.booleanPointInPolygon(point, comarca);
                  return isInside;
                }).length;
                return {
                  name: comarca.properties.name,
                  value: obsCount,
                };
              });
              return {
                geojson: catalunyaGeoJson,
                values: values,
              };
            })
          );
        })
      );
    } catch (error) {
      console.error(error);
      throw Error('Error getting observations by region', error);
    }
  }

  /*
   * Función que recibe un array de observaciones y devuelve un array de polilineas con los segmentos de las observaciones para mostrar en el mapa
   */
  public getLineStringFromObservations(
    observations: Observations[] = this.observations$.getValue()
  ): Feature[] | null {
    try {
      if (observations.length == 0) return [];

      function getColor(value: number): string {
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
            return '#134367';
          default:
            return '#333';
        }
      }

      //Crear polilineas para las observaciones, esto añade el borde negro a las observaciones para mejorar la visibilidad
      let linestrings: Feature[] = observations.map((obs) => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          //hacemos un reduce de sengments para combertirlos en un Linestring
          coordinates: obs.relationships.segments.reduce(
            (
              acc: turf.Position[],
              segment: any,
              index: number
            ): turf.Position[] => {
              acc.push([
                Number(segment.start_longitude),
                Number(segment.start_latitude),
              ]);
              if (index + 1 === obs.relationships.segments.length)
                acc.push([
                  Number(segment.end_longitude),
                  Number(segment.end_latitude),
                ]);
              return acc;
            },
            []
          ),
        },
        properties: {
          id: obs.id,
          type: 'LineString',
          color: '#333',
          width: 6,
        },
      }));

      //Obtener los segmentos de las polilineas
      linestrings = linestrings.concat(
        observations
          .map((obs) => {
            let segments: Feature[] = [];
            for (let i = 0; i <= obs.relationships.segments.length - 1; i++) {
              segments.push({
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [
                      Number(obs.relationships.segments[i].start_longitude),
                      Number(obs.relationships.segments[i].start_latitude),
                    ],
                    [
                      Number(obs.relationships.segments[i].end_longitude),
                      Number(obs.relationships.segments[i].end_latitude),
                    ],
                  ],
                },
                properties: {
                  id: obs.id,
                  type: 'Line',
                  color: obs.relationships.segments[i].LAeq
                    ? getColor(obs.relationships.segments[i].LAeq)
                    : null,
                  width: 3,
                  pause: obs.relationships.segments[i].LAeq ? false : true, //TODO: Añadir el valor de pause
                },
              });
            }
            return segments;
          })
          .flat()
      );

      return linestrings;
    } catch (error) {
      console.error(error);
      throw Error('Error getting line string from observations', error);
    }
  }

  public getStartPointsFromObservations(
    observations: Observations[] = this.observations$.getValue()
  ): Feature[] | null {
    try {
      observations = observations.filter(
        (obs) => obs.relationships.segments.length > 0
      );

      if (observations.length == 0) return [];

      let points: Feature[] = observations.map((obs) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            Number(obs.relationships.segments[0].start_longitude),
            Number(obs.relationships.segments[0].start_latitude),
          ],
        },
        properties: {
          id: obs.id,
          type: 'Point',
          color: '#333',
          width: 6,
        },
      }));

      return points;
    } catch (error) {
      console.error(error);
      throw Error('Error getting start points from observations', error);
    }
  }

  public getObservationsByPolygonAndHours(
    polygon: Number[],
    hourInterval: [string, string]
  ): Observable<Observations[]> {
    this.loading$.next(true);
    return this.http
      .post<{ success: string; data: Observations[] }>(
        `${environment.BACKEND_BASE_URL}/observations/in-polygon`,
        {
          concern: 'inside',
          polygon: polygon,
          interval: {
            start: `${hourInterval[0]}`,
            end: `${hourInterval[1]}`,
          },
        }
      )
      .pipe(
        map(({ data }) => {
          this.observations$.next(data);
          this.loading$.next(false);
          return data;
        })
      );
  }


  private convertToCSV(objArray: Observations[]): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const opts: Json2CSVBaseOptions<object, object> = {
          fields: [
            {
              label: 'ID_Observation',
              value: 'id',
            },
            {
              label: 'ID_User',
              value: 'relationships.user.id',
            },
            {
              label: 'Date_Time',
              value: 'attributes.created_at',
            },
            {
              label: 'Latitude',
              value: 'attributes.latitude',
            },
            {
              label: 'Longitude',
              value: 'attributes.longitude',
            },
            {
              label: 'LAeq',
              value: 'attributes.Leq',
            },
            {
              label: 'LAeq,t',
              value: 'attributes.LAeqT',
            },
            {
              label: 'LAmax',
              value: 'attributes.LAmax',
            },
            {
              label: 'LAmin',
              value: 'attributes.LAmin',
            },
            {
              label: 'L90',
              value: 'attributes.L90',
            },
            {
              label: 'L10',
              value: 'attributes.L10',
            },
            {
              label: 'Sharpness',
              value: 'attributes.sharpness_S',
            },
            {
              label: 'Loudness',
              value: 'attributes.loudness_N',
            },
            {
              label: 'Roughtness',
              value: 'attributes.roughtness_R',
            },
            {
              label: 'Fluctuation strength',
              value: 'attributes.fluctuation_strength_F',
            },
            {
              label: 'Type of sound',
              value: (row:any) => row.relationships.types.map((type:any) => type.name).join(','),
            },
            {
              label: 'Quiet',
              value: 'attributes.quiet',
            },
            {
              label: 'Cleanliness',
              value: 'attributes.cleanliness',
            },
            {
              label: 'Accessibility',
              value: 'attributes.accessibility',
            },
            {
              label: 'Safety',
              value: 'attributes.safety',
            },
            {
              label: 'Influence',
              value: 'attributes.influence',
            },
            {
              label: 'Action_protections',
              value: 'attributes.protection',
            },
            {
              label: 'Pleasant',
              value: 'attributes.pleasant',
            },
            {
              label: 'Chaotic',
              value: 'attributes.chaotic',
            },
            {
              label: 'Vibrant',
              value: 'attributes.vibrant',
            },
            {
              label: 'Uneventful',
              value: 'attributes.uneventful',
            },
            {
              label: 'Calm',
              value: 'attributes.calm',
            },
            {
              label: 'Annoying',
              value: 'attributes.annoying',
            },
            {
              label: 'Eventful',
              value: 'attributes.eventful',
            },
            {
              label: 'Monotonous',
              value: 'attributes.monotonous',
            },
            {
              label: 'Appropriateness',
              value: 'attributes.overall',
            },
            {
              label: 'wind_speed_m/s',
              value: 'attributes.wind_speed',
            },
            {
              label: 'humidity_%',
              value: 'attributes.humidity',
            },
            {
              label: 'temperature_Cº',
              value: 'attributes.temperature',
            },
            {
              label: 'pressure_hPa',
              value: 'attributes.pressure',
            },
          ],
        };
        const parser = new Parser(opts);
        const csv = parser.parse(objArray);
        resolve(csv);
      } catch (err) {
        console.error(err);
      }
    });
  }
  private convertTagsToCSV(objArray: object[]): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const opts: Json2CSVBaseOptions<object, object> = {
          transforms: [],
          fields: ['key', 'value'],
        };
        const parser = new Parser(opts);
        const csv = parser.parse(objArray);
        resolve(csv);
      } catch (err) {
        console.error(err);
      }
    });
  }

  public async downloadObservations(observations: Observations[]) {
    try {
      this.loading$.next(true);

      let csvTags = await this.convertTagsToCSV(this.tags);
      let csvData = await this.convertToCSV(observations);

      if (!csvData || !csvTags) {
        this.loading$.next(false);
        throw Error('Error converting data to CSV');
      }

      let file = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
      let fileTags = new Blob([csvTags], { type: 'text/csv;charset=utf-8' });

      await new Promise((res, rej) => res(saveAs(file, 'observacions.csv')));
      await new Promise((res, rej) => res(saveAs(fileTags, 'paraules.csv')));

      this.loading$.next(false);
    } catch (error) {
      this.loading$.next(false);
      console.error(error);
      throw Error('Error downloading observations', error);
    }
  }

  public downloadKML() {
    try {
      this.loading$.next(true);

      const observations = this.observations$.getValue();
      const features: Feature[] = observations.map((obs) => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: obs.relationships.segments.reduce(
            (
              acc: turf.Position[],
              segment: any,
              index: number
            ): turf.Position[] => {
              acc.push([
                Number(segment.start_longitude),
                Number(segment.start_latitude),
              ]);
              if (index + 1 === obs.relationships.segments.length)
                acc.push([
                  Number(segment.end_longitude),
                  Number(segment.end_latitude),
                ]);
              return acc;
            },
            []
          ),
        },
        properties: {
          ID_Observation: obs.id,
          LAeq: Number(obs.attributes.Leq).toFixed(1),
          LAmax: Number(obs.attributes.LAmax).toFixed(1),
          LAmin: Number(obs.attributes.LAmin).toFixed(1),
          L90: Number(obs.attributes.L90).toFixed(1),
          L10: Number(obs.attributes.L10).toFixed(1),
        },
      }));
      let geoJson = {
        type: 'FeatureCollection' as const,
        features: features,
      };

      this.loading$.next(false);
      this.http.post<Blob>(
        `${environment.BACKEND_BASE_URL}/kml`,
        {
          geojson: geoJson
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/binary',
          },
          withCredentials: true,
          responseType: 'blob' as 'json'
        }
      )
      .subscribe({
        next: (resp:any) => {
          this.loading$.next(false);
          const blob = new Blob([resp], { type: "text/csv;charset=utf-8" });
          const fileURL = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = fileURL;
          const date = new Date();
          const dateSlug = `${date.toISOString().slice(0,10)}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
          link.download = `observacions-${ dateSlug }.kml`;
          link.click();
          link.remove();
        },
        error: (err) => {
          this.loading$.next(false);
          console.error(err);
        }
      });

    } catch (error) {
      this.loading$.next(false);
      console.error(error);
      throw Error('Error downloading KMZ', error);
    }
  }
  public downloadGPKG() {
    try {
      this.loading$.next(true);

      const observations = this.observations$.getValue();
      const features: Feature[] = observations.map((obs) => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: obs.relationships.segments.reduce(
            (
              acc: turf.Position[],
              segment: any,
              index: number
            ): turf.Position[] => {
              acc.push([
                Number(segment.start_longitude),
                Number(segment.start_latitude),
              ]);
              if (index + 1 === obs.relationships.segments.length)
                acc.push([
                  Number(segment.end_longitude),
                  Number(segment.end_latitude),
                ]);
              return acc;
            },
            []
          ),
        },
        properties: {
          ID_Observation: obs.id,
          LAeq: Number(obs.attributes.Leq).toFixed(1),
          LAmax: Number(obs.attributes.LAmax).toFixed(1),
          LAmin: Number(obs.attributes.LAmin).toFixed(1),
          L90: Number(obs.attributes.L90).toFixed(1),
          L10: Number(obs.attributes.L10).toFixed(1),
        },
      }));
      let geoJson = {
        type: 'FeatureCollection' as const,
        features: features,
      };

      this.loading$.next(false);
      this.http.post<Blob>(
        `${environment.BACKEND_BASE_URL}/geopackage`,
        {
          geojson: geoJson
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/binary',
          },
          withCredentials: true,
          responseType: 'blob' as 'json'
        }
      )
      .subscribe({
        next: (resp:any) => {
          this.loading$.next(false);
          const blob = new Blob([resp], { type: "text/csv;charset=utf-8" });
          const fileURL = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = fileURL;
          const date = new Date();
          const dateSlug = `${date.toISOString().slice(0,10)}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
          link.download = `observacions-${ dateSlug }.gpkg`;
          link.click();
          link.remove();
        },
        error: (err) => {
          this.loading$.next(false);
          console.error(err);
        }
      });

    } catch (error) {
      this.loading$.next(false);
      console.error(error);
      throw Error('Error downloading GPKG', error);
    }
  }
}
