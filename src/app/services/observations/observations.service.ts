import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { BehaviorSubject, Observable, map, filter, switchMap } from 'rxjs';
import { Observations, ObservationsDataChart } from '../../models/observations';
import { Feature, MapObservation } from '../../models/map';
import * as turf from '@turf/turf';

@Injectable({
  providedIn: 'root',
})
export class ObservationsService {
  observations$: BehaviorSubject<Observations[]> = new BehaviorSubject<
    Observations[]
  >([]);

  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private http: HttpClient) {}

  public getAllObservations(): void {
    this.http
      .get<{ success: string; data: Observations[] }>(
        `${environment.BACKEND_BASE_URL}/observations`
      )
      .subscribe(({ data }) => {
        this.observations$.next(data);
        this.loading$.next(false);
      });
  }

  public getAllObservationsNumbers(): Observable<any> {
    return this.observations$.pipe(
      filter((value) => value.length > 0),
      map((observations) => {
        const observationsByUser: { [key: string]: number } =
          observations.reduce((acc, obs) => {
            const userId = obs.relationships.user.id;
            if (!acc[userId]) {
              acc[userId] = 0;
            }
            acc[userId]++;
            return acc;
          }, {} as { [key: string]: number });
        const observationsByGender: { [key: string]: number } =
          observations.reduce((acc, obs) => {
            const gender = obs.relationships.user.attributes.profile.gender;
            if (!acc[gender]) {
              acc[gender] = 0;
            }
            acc[gender]++;
            return acc;
          }, {} as { [key: string]: number });

        const numberOfDifferentUsers = Object.keys(observationsByUser).length;
        const totalObservations = Object.values(observationsByUser).reduce(
          (a, b) => a + b,
          0
        );
        const averageObservationsPerUser =
          totalObservations / numberOfDifferentUsers;
        const observationsByAge = {
          '<18': 0,
          '18-30': 0,
          '30-40': 0,
          '40-50': 0,
          '>50': 0,
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
        return {
          numberOfDifferentUsers,
          totalObservations,
          averageObservationsPerUser,
          observationsByGender: Object.entries(observationsByGender).map(
            ([genre, value]) => ({ genre, value })
          ),
          observationsByAge: Object.entries(observationsByAge).map(
            ([age, value]) => ({ age, value })
          ),
        };
      })
    );
  }

  public getAllMapObservations(): Observable<MapObservation[]> {
    return this.observations$.pipe(
      filter((value) => value.length > 0),
      map((observations) =>
        observations.map((obs) => ({
          id: obs.id,
          user_id: obs.relationships.user.id,
          latitude: obs.attributes.latitude,
          longitude: obs.attributes.longitude,
          created_at: new Date(obs.attributes.created_at),
          types: obs.relationships.types.map((type) => type.id),
          Leq: obs.attributes.Leq,
          userType: obs.relationships.user.type,
          quiet: obs.attributes.quiet,
        }))
      )
    );
  }

  public getAllObservationsFormated(): Observable<ObservationsDataChart[]> {
    return this.observations$.pipe(
      filter((value) => value.length > 0),
      map((observations) => {
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
            allDays.push({ ...dayValue, date: dayValue.date.split(' ')[0] });
          } else {
            const day = currentDate.toISOString().split('T')[0];
            allDays.push({
              date: day,
              count: 0,
              obs: [],
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return allDays;
      })
    );
  }

  public getAllObservationsByRegion(): Observable<{
    geojson: any;
    values: { name: string; value: number }[];
  }> {
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
  }
}