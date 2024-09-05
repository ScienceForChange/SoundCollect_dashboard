import { Component, inject, Input } from '@angular/core';
import { StudyZoneMapService } from '../../../modules/admin/study-zone/service/study-zone-map.service';
import { StudyZoneService } from '../../../services/study-zone/study-zone.service';
import { StudyZone } from '../../../models/study-zone';

@Component({
  selector: 'app-study-zone-dialog',
  templateUrl: './study-zone-dialog.component.html',
  styleUrl: './study-zone-dialog.component.scss',
})
export class StudyZoneDialogComponent {
  private studyZoneMapService = inject(StudyZoneMapService);
  private studyZoneService = inject(StudyZoneService);
  @Input() visible: boolean = false;
  studyZone!: StudyZone;

  constructor() {
    this.studyZoneService.studyZoneSelected$.subscribe((studyZone) => {
      this.studyZone = studyZone;
    });
  }

  closeDialog(): void {
    this.studyZoneMapService.studyZoneDialogVisible.update(() => false);
    this.studyZoneService.studyZoneSelected$.next(null);
  }
}
