import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { StudyZoneService } from '../../../../services/study-zone/study-zone.service';

@Component({
  selector: 'app-study-zone',
  templateUrl: './study-zone.component.html',
  styleUrl: './study-zone.component.scss',
})
export class StudyZoneComponent {
  studyZoneFormVisible = signal<boolean>(false);

  toggleStudyZoneForm() {
    this.studyZoneFormVisible.update(() => !this.studyZoneFormVisible());
  }
}
