import { Component, EventEmitter, inject, Output } from '@angular/core';
import { StudyZoneService } from '../../../../../services/study-zone/study-zone.service';
import { StudyZone } from '../../../../../models/study-zone';
import { StudyZoneMapService } from '../../service/study-zone-map.service';

@Component({
  selector: 'app-study-zone-list',
  templateUrl: './study-zone-list.component.html',
  styleUrl: './study-zone-list.component.scss',
})
export class StudyZoneListComponent {
  private mapService = inject(StudyZoneMapService);
  private studyZoneService = inject(StudyZoneService);

  @Output() toggleStudyZoneForm: EventEmitter<number> =
    new EventEmitter<number>();

  studyZonesIdsDisplayed: number[] = [];
  studyZones: StudyZone[] = [];

  ngOnInit() {
    this.studyZoneService.studyZones$.subscribe((studyZones) => {
      this.studyZones = studyZones;
    });
  }

  getIcon(studyZoneId: number): string {
    return this.studyZonesIdsDisplayed.some((zoneId) => zoneId === studyZoneId)
      ? 'pi pi-eye-slash'
      : 'pi pi-eye';
  }

  viewStudyZone(id: number) {
    const isStudyZoneDisplayed = this.studyZonesIdsDisplayed.some(
      (zoneId) => zoneId === id
    );
    if (!isStudyZoneDisplayed) {
      this.mapService.drawPolygonFromId(id);
      this.studyZonesIdsDisplayed.push(id);
      return;
    }
    this.mapService.erasePolygonFromId(id)
    this.studyZonesIdsDisplayed = this.studyZonesIdsDisplayed.filter(
      (zoneId) => zoneId !== id
    );
  }

  enableStudyZone(id: number) {
    console.log(id);
  }

  deleteStudyZone(id: number) {
    this.studyZoneService.deleteStudyZone(id).subscribe();
  }

  editStudyZone(id: number) {
    this.studyZoneService.selectStudyZone(id);
    this.toggleStudyZoneForm.emit();
  }
}
