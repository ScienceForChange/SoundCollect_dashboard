import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { StudyZoneMapService } from '../service/study-zone-map.service';
import { StudyZone } from '../../../../models/study-zone';
import { StudyZoneService } from '../../../../services/study-zone/study-zone.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-study-zone',
  templateUrl: './study-zone.component.html',
  styleUrl: './study-zone.component.scss',
})
export class StudyZoneComponent implements OnDestroy {
  private studyZoneService = inject(StudyZoneService);
  private studyZoneMapService = inject(StudyZoneMapService);
  private subscriptions = new Subscription();
  studyZoneFormVisible = signal<boolean>(false);
  visibleDialog: boolean = false;
  studyZoneSelected!: StudyZone;

  constructor() {
    effect(() => {
      this.visibleDialog = this.studyZoneMapService.studyZoneDialogVisible();
    });
    this.subscriptions.add(
      this.studyZoneService.studyZoneSelected$.subscribe((value) => {
        this.studyZoneSelected = value;
      })
    );
  }

  toggleStudyZoneForm() {
    this.studyZoneFormVisible.update(() => !this.studyZoneFormVisible());
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.studyZoneFormVisible.update(() => false);
  }
}
