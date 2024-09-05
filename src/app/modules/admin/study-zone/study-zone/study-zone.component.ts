import { Component, effect, inject, signal } from '@angular/core';
import { StudyZoneMapService } from '../service/study-zone-map.service';
import { StudyZone } from '../../../../models/study-zone';
import { StudyZoneService } from '../../../../services/study-zone/study-zone.service';

@Component({
  selector: 'app-study-zone',
  templateUrl: './study-zone.component.html',
  styleUrl: './study-zone.component.scss',
})
export class StudyZoneComponent {
  private studyZoneService = inject(StudyZoneService);
  private studyZoneMapService = inject(StudyZoneMapService);

  studyZoneFormVisible = signal<boolean>(false);
  visibleDialog: boolean = false;
  studyZoneSelected!: StudyZone;

  constructor() {
    effect(() => {
      this.visibleDialog = this.studyZoneMapService.studyZoneDialogVisible();
    });
    this.studyZoneService.studyZoneSelected$.subscribe((value) => {
      this.studyZoneSelected = value;
    });
  }

  toggleStudyZoneForm() {
    this.studyZoneFormVisible.update(() => !this.studyZoneFormVisible());
  }
}
