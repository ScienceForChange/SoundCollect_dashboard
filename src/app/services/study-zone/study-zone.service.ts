import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObservationsService } from '../observations/observations.service';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, map, Observable, switchMap, of, delay } from 'rxjs';
import { StudyZone, StudyZoneForm } from '../../models/study-zone';

@Injectable({
  providedIn: 'root',
})
export class StudyZoneService {
  studyZones$: BehaviorSubject<StudyZone[]> = new BehaviorSubject<StudyZone[]>(
    []
  );

  constructor(
    private http: HttpClient,
    private observationService: ObservationsService
  ) {}

  public createStudyZone(
    polygon: Number[],
    result: StudyZoneForm
  ): Observable<void> {
    this.observationService.loading$.next(true);
    return of({
      coordinates: polygon,
      name: result.name,
      start_date: result.start_end_dates[0],
      end_date: result.start_end_dates[1],
      id: 1,
      deleted: 0, 
      created_at: new Date(), 
      updated_at: new Date(),
      ...result,
    } as StudyZone).pipe(
      delay(1500),
      map((data) => {
        this.observationService.loading$.next(false);
        const studyZones = [...this.studyZones$.getValue(), data];
        this.studyZones$.next(studyZones);
      })
    );
    // return this.http
    //   .post<{ success: string; data: StudyZone }>(
    //     `${environment.BACKEND_BASE_URL}/admin-panel/study-zone`,
    //     {
    //       coordinates: polygon,
    //       name: result.name,
    //       start_date: result.start_end_dates[0],
    //       end_date: result.start_end_dates[1],
    //       ...result
    //     }
    //   )
    //   .pipe(
    //     map(({ data }) => {
    //       this.observationService.loading$.next(false);
    //       const studyZones = [...this.studyZones$.getValue(),data]
    //       this.studyZones$.next(studyZones)
    //     })
    //   );
  }
}
