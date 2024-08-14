import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObservationsService } from '../observations/observations.service';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, map, Observable, switchMap, of } from 'rxjs';
import { StudyZone, StudyZoneForm } from '../../models/study-zone';

const mockResponse = {
  success: 'Mocked success',
  data: {
    // Mocked study zone data
  }
};

@Injectable({
  providedIn: 'root',
})
export class StudyZoneService {


studyZones$: BehaviorSubject<StudyZone[]> = new BehaviorSubject<StudyZone[]>([])

  constructor(
    private http: HttpClient,
    private observationService: ObservationsService
  ) {}

  public createStudyZone(
    polygon: Number[],
    result: StudyZoneForm
  ): Observable<void> {
    this.observationService.loading$.next(true);
    return this.http
      .post<{ success: string; data: StudyZone }>(
        `${environment.BACKEND_BASE_URL}/admin-panel/study-zone`,
        {
          coordinates: polygon,
          name: result.name,
          start_date: result.start_end_dates[0],
          end_date: result.start_end_dates[1],
          ...result
        }
      )
      .pipe(
        switchMap(of(mockResponse))
        map(({ data }) => {
          this.observationService.loading$.next(false);
          const studyZones = [...this.studyZones$.getValue(),data]
          this.studyZones$.next(studyZones)
        })
      );
  }
}
