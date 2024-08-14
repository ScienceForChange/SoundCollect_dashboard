import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-study-zone',
  templateUrl: './study-zone.component.html',
  styleUrl: './study-zone.component.scss'
})
export class StudyZoneComponent {
  studyZoneFormVisible = signal<boolean>(false);
  polygonFilter = signal<any | null>(null);

  toggleStudyZoneForm() {
    this.studyZoneFormVisible.update(() => !this.studyZoneFormVisible());
  }

}
