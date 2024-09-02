import { Component, inject, OnInit, signal } from '@angular/core';
import { StudyZoneService } from '../../../../services/study-zone/study-zone.service';

@Component({
  selector: 'app-study-zone',
  templateUrl: './study-zone.component.html',
  styleUrl: './study-zone.component.scss',
})
export class StudyZoneComponent implements OnInit {
  private studyZoneService = inject(StudyZoneService);
  studyZoneFormVisible = signal<boolean>(false);

  ngOnInit(): void {
    this.studyZoneService.fetchStudyZones().subscribe();
  }

  toggleStudyZoneForm() {
    this.studyZoneFormVisible.update(() => !this.studyZoneFormVisible());
  }
}
