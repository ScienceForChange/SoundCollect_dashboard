import { Component, inject } from '@angular/core';
import { ObservationsService } from './services/observations/observations.service';
import { StudyZoneService } from './services/study-zone/study-zone.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  private studyZoneService = inject(StudyZoneService);
  private observationService = inject(ObservationsService);

 async ngOnInit(): Promise<void> {
  try {
    await this.observationService.getAllObservations();
    this.studyZoneService.fetchStudyZones();
  } catch (error) {
    console.error(error);
  }
  }
}
