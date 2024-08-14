import { Component, EventEmitter, inject, Output } from '@angular/core';
import { StudyZoneService } from '../../../../../services/study-zone/study-zone.service';
import { StudyZone } from '../../../../../models/study-zone';

@Component({
  selector: 'app-study-zone-list',
  templateUrl: './study-zone-list.component.html',
  styleUrl: './study-zone-list.component.scss'
})
export class StudyZoneListComponent {
  private studyZoneService = inject(StudyZoneService);

  @Output() toggleStudyZoneForm: EventEmitter<number> = new EventEmitter<number>();

  studyZones: StudyZone[] = []

  ngOnInit() {
    this.studyZoneService.studyZones$.subscribe((studyZones) => {
      this.studyZones = studyZones;
    });
  }

  viewStudyZone(id: number) {
    console.log(id);
  }
  enableStudyZone(id: number) {
    console.log(id);
  }

  editStudyZone(id: number) {
    this.studyZoneService.selectStudyZone(id);
    this.toggleStudyZoneForm.emit();
  }
}
