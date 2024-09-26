import { StudyZoneMapService } from './../../service/study-zone-map.service';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { StudyZoneService } from '../../../../../services/study-zone/study-zone.service';
import { StudyZone } from '../../../../../models/study-zone';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-study-zone-list',
  templateUrl: './study-zone-list.component.html',
  styleUrl: './study-zone-list.component.scss',
})
export class StudyZoneListComponent {
  private mapService = inject(StudyZoneMapService);
  private studyZoneService = inject(StudyZoneService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private isStudyZoneDisplayed : boolean = false;
  public studyZoneSelected: StudyZone | null = null;
  

  @Output() toggleStudyZoneForm: EventEmitter<number> =
    new EventEmitter<number>();

  studyZonesIdsDisplayed: number[] = [];
  studyZones: StudyZone[] = [];

  ngOnInit() {
    this.studyZoneService.studyZones$.subscribe((studyZones) => {
      this.studyZones = studyZones;
    });
    this.mapService.studyZoneSelected$.subscribe((studyZone) => {
      this.studyZoneSelected = studyZone ? studyZone : null;
    });
  }

  getIcon(studyZoneId: number): string {
    return this.studyZonesIdsDisplayed.some((zoneId) => zoneId === studyZoneId)
      ? 'pi pi-eye-slash'
      : 'pi pi-eye';
  }

  viewStudyZone(studyZone: StudyZone) {

    if(studyZone.id === this.studyZoneSelected?.id) {
      return;
    }

    this.isStudyZoneDisplayed = this.studyZonesIdsDisplayed.some(
      (zoneId) => zoneId === studyZone.id
    );
    this.mapService.selectedPolygonFromId(studyZone.id);
  }

  previewStudyZone(id: number | null = null) {

    this.mapService.previewStudyZone(id);

  }

  confirmDeleteStudyZone(event: Event, id: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: "Estás segur d'eliminar aquesta zona d'estudi?",
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancel·lar',
      accept: () => {
        this.deleteStudyZone(id);
      },
      reject: () => {
        return;
      },
    });
  }

  toggleEnableStudyZone(id: number) {
    this.studyZoneService.toggleEnableStudyZone(id).subscribe({
      next: (isVisible) => {
        this.messageService.add({
          severity: 'success',
          summary: isVisible ? "Zona d'estudi visible" : "Zona d'estudi oculta",
          detail: isVisible
            ? "Els usuaris podrán veure la zona d'estudi"
            : "Els usuaris no podrán veure la zona d'estudi",
        });
        return;
      },
    });
  }

  deleteStudyZone(id: number) {
    this.studyZoneService.deleteStudyZone(id).subscribe();
  }

  editStudyZone(id: number) {
    this.studyZoneService.selectStudyZone(id);
    this.toggleStudyZoneForm.emit();
  }
}
