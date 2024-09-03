import { Component, effect, inject } from '@angular/core';
import { StudyZoneMapService } from '../../service/study-zone-map.service';
import { StudyZone } from '../../../../../models/study-zone';
import { StudyZoneService } from '../../../../../services/study-zone/study-zone.service';

@Component({
  selector: 'app-study-zone-dialog',
  templateUrl: './study-zone-dialog.component.html',
  styleUrl: './study-zone-dialog.component.scss',
})
export class StudyZoneDialogComponent {
  private studyZoneMapService = inject(StudyZoneMapService);
  private studyZoneService = inject(StudyZoneService);
  visible: boolean = false;
  studyZone!: StudyZone;

  constructor() {
    effect(() => {
      this.visible = this.studyZoneMapService.studyZoneDialogVisible();
    });
    this.studyZoneService.studyZoneSelected$.subscribe((studyZone) => {
      this.studyZone = studyZone;
    })
  }

  closeDialog(): void {
    this.studyZoneMapService.studyZoneDialogVisible.update(() => false);
    this.studyZoneService.studyZoneSelected$.next(null);
  }
}
