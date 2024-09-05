import { Component, OnInit, inject } from '@angular/core';

import { ObservationsService } from '../../../services/observations/observations.service';
import { StudyZoneService } from '../../../services/study-zone/study-zone.service';

@Component({
  selector: 'app-layout',
  templateUrl: './app.layout.component.html',
})
export class AppLayoutComponent implements OnInit {
  private observationService = inject(ObservationsService);
  private studyZoneService = inject(StudyZoneService);

  loading: boolean = false;

  async ngOnInit(): Promise<void> {
    this.observationService.loading$.subscribe((value) => {
      this.loading = value;
    });
    try {
      await this.observationService.getAllObservations();
      this.studyZoneService.fetchStudyZones();
    } catch (error) {
      console.error(error);
    }
  }
}
