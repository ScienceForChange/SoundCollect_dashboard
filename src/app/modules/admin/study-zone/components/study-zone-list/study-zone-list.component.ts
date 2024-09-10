import { Component, EventEmitter, inject, Output } from '@angular/core';
import { StudyZoneService } from '../../../../../services/study-zone/study-zone.service';
import { StudyZone } from '../../../../../models/study-zone';
import { StudyZoneMapService } from '../../service/study-zone-map.service';
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    this.mapService.erasePolygonFromId(id);
    this.studyZonesIdsDisplayed = this.studyZonesIdsDisplayed.filter(
      (zoneId) => zoneId !== id
    );
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
