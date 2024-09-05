import { Component, inject, Input } from '@angular/core';
import { StudyZoneMapService } from '../../../modules/admin/study-zone/service/study-zone-map.service';
import { StudyZoneService } from '../../../services/study-zone/study-zone.service';
import { StudyZone } from '../../../models/study-zone';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-study-zone-dialog',
  templateUrl: './study-zone-dialog.component.html',
  styleUrl: './study-zone-dialog.component.scss',
})
export class StudyZoneDialogComponent {
  translateService = inject(TranslateService);
  private studyZoneMapService = inject(StudyZoneMapService);
  private studyZoneService = inject(StudyZoneService);
  @Input() studyZone!: StudyZone
  @Input() visible: boolean = false;

  closeDialog(): void {
    this.studyZoneMapService.studyZoneDialogVisible.update(() => false);
    this.studyZoneService.studyZoneSelected$.next(null);
  }
}
