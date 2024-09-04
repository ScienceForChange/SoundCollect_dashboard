import {Component, effect, inject, signal } from '@angular/core';
import { StudyZoneMapService } from '../service/study-zone-map.service';

@Component({
  selector: 'app-study-zone',
  templateUrl: './study-zone.component.html',
  styleUrl: './study-zone.component.scss',
})
export class StudyZoneComponent {
  private studyZoneMapService = inject(StudyZoneMapService);
  studyZoneFormVisible = signal<boolean>(false);
  visibleDialog: boolean = false;

  constructor() {
    effect(() => {
      this.visibleDialog = this.studyZoneMapService.studyZoneDialogVisible();
    });
  }

  toggleStudyZoneForm() {
    this.studyZoneFormVisible.update(() => !this.studyZoneFormVisible());
  }
}
