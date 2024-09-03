import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObservationsService } from '../observations/observations.service';
import { environment } from '../../../environments/environment';
import {
  BehaviorSubject,
  map,
  Observable,
  switchMap,
  of,
  delay,
  catchError,
  throwError,
} from 'rxjs';
import { StudyZone, StudyZoneForm } from '../../models/study-zone';

@Injectable({
  providedIn: 'root',
})
export class StudyZoneService {
  studyZones$: BehaviorSubject<StudyZone[]> = new BehaviorSubject<StudyZone[]>(
    []
  );
  studyZoneSelected$: BehaviorSubject<StudyZone | null> =
    new BehaviorSubject<StudyZone | null>(null);

  constructor(
    private http: HttpClient,
    private observationService: ObservationsService
  ) {}

  public selectStudyZone(id: number): void {
    this.studyZones$
      .pipe(
        map((studyZones) => studyZones.find((studyZone) => studyZone.id === id))
      )
      .subscribe((studyZone) => this.studyZoneSelected$.next(studyZone));
  }

  public fetchStudyZones(): void {
    this.observationService.loading$.next(true);
    this.http
      .get<{ success: string; data: StudyZone[] }>(
        `${environment.BACKEND_BASE_URL}/admin-panel/study-zone`
      )
      .subscribe({
        next: ({ data }) => {
          this.observationService.loading$.next(false);
          this.studyZones$.next(data);
        },
        error: (error) => {
          this.observationService.loading$.next(false);
          return throwError(() => error);
        },
      });
  }

  public createStudyZone(
    polygon: Number[],
    result: StudyZoneForm
  ): Observable<void> {
    return this.http
      .post<{ success: string; data: StudyZone }>(
        `${environment.BACKEND_BASE_URL}/admin-panel/study-zone`,
        {
          coordinates: polygon,
          name: result.name,
          start_date: result.start_end_dates[0],
          end_date: result.start_end_dates[1],
          ...result,
        }
      )
      .pipe(
        map(({ data }) => {
          this.observationService.loading$.next(false);
          const studyZones = [...this.studyZones$.getValue(), data];
          this.studyZones$.next(studyZones);
        }),
        catchError((error) => {
          this.observationService.loading$.next(false);
          return throwError(() => error);
        })
      );
  }

  public updateStudyZone(id: number, result: StudyZone): Observable<void> {
    this.observationService.loading$.next(true);
    const studyZone = {
      coordinates: result.boundaries.coordinates
        .flat()
        .map((coord) => coord.reverse().join(' ')),
      name: result.name,
      description: result.description,
      start_date: result.start_date,
      end_date: result.end_date,
    };
    return this.http
      .patch<{ success: string; data: StudyZone }>(
        `${environment.BACKEND_BASE_URL}/admin-panel/study-zone/${id}`,
        studyZone
      )
      .pipe(
        map(({ data }) => {
          this.observationService.loading$.next(false);
          const studyZones = this.studyZones$.getValue().map((studyZone) => {
            if (studyZone.id === id) {
              return data;
            }
            return studyZone;
          });
          this.studyZones$.next(studyZones);
        }),
        catchError((error) => {
          this.observationService.loading$.next(false);
          return throwError(() => error);
        })
      );
  }

  public deleteStudyZone(id: number): Observable<void> {
    this.observationService.loading$.next(true);
    return this.http
      .delete<{ success: string; data: StudyZone }>(
        `${environment.BACKEND_BASE_URL}/admin-panel/study-zone/${id}`
      )
      .pipe(
        map(() => {
          this.observationService.loading$.next(false);
          const studyZones = this.studyZones$
            .getValue()
            .filter((studyZone) => studyZone.id !== id);
          this.studyZones$.next(studyZones);
        }),
        catchError((error) => {
          this.observationService.loading$.next(false);
          return throwError(() => error);
        })
      );
  }
}
