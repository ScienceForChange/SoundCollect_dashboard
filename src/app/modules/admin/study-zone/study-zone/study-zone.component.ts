import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-study-zone',
  templateUrl: './study-zone.component.html',
  styleUrl: './study-zone.component.scss',
})
export class StudyZoneComponent {
  studyZoneFormVisible = signal<boolean>(false);
  studyZoneIdSelected = signal<number | null>(null);

  toggleStudyZoneForm(id?: number) {
    if (id) {
      this.studyZoneIdSelected.update(() => id);
    }
    this.studyZoneFormVisible.update(() => !this.studyZoneFormVisible());
  }
}
