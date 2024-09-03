import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  CollaboratorsStudyZone,
  DocumentsStudyZones,
  StudyZone,
  StudyZoneForm,
} from '../../../../../models/study-zone';
import { StudyZoneService } from '../../../../../services/study-zone/study-zone.service';
import { StudyZoneMapService } from '../../service/study-zone-map.service';

@Component({
  selector: 'app-study-zone-form',
  templateUrl: './study-zone-form.component.html',
  styleUrl: './study-zone-form.component.scss',
})
export class StudyZoneFormComponent {
  private messageService = inject(MessageService);
  private studyZoneService = inject(StudyZoneService);
  private studyZoneMapService = inject(StudyZoneMapService);

  @Input() visible: boolean = false;
  @Output() toggleStudyZoneForm: EventEmitter<void> = new EventEmitter<void>();

  private polygon: any = null;

  studyZoneForm: FormGroup = new FormGroup({
    user_id: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    conclusion: new FormControl(''),
    start_end_dates: new FormControl<Date[] | null[]>(
      [new Date(), new Date()] as Date[] | null[],
      [Validators.required]
    ),
    documents: new FormArray([]),
    collaborators: new FormArray([]),
  });
  studyZoneSelected: StudyZone | null = null;

  get documents(): FormArray {
    return this.studyZoneForm.get('documents') as FormArray;
  }
  get collaborators(): FormArray {
    return this.studyZoneForm.get('collaborators') as FormArray;
  }

  ngOnInit(): void {
    this.polygon = this.studyZoneMapService.polygonFilter;
    this.studyZoneService.studyZoneSelected$.subscribe((studyZoneSelected) => {
      if (studyZoneSelected) {
        const studyZoneForm = {
          ...studyZoneSelected,
          collaborators: studyZoneSelected.relationships.collaborators,
          documents: studyZoneSelected.relationships.documents,
          start_end_dates: [
            new Date(studyZoneSelected.start_date),
            new Date(studyZoneSelected.end_date),
          ],
        };
        delete studyZoneForm.relationships;
        delete studyZoneForm.start_date;
        delete studyZoneForm.end_date;

        this.studyZoneSelected = studyZoneForm;
        this.studyZoneForm.patchValue(studyZoneForm);
        this.addCollaborator(studyZoneSelected.relationships.collaborators)
        this.addDocument(studyZoneSelected.relationships.documents)
      }
    });
  }

  addCollaborator(collaborators?: CollaboratorsStudyZone[]): void {
    if(!!collaborators) {
      collaborators.forEach(collaborator => {
        this.collaborators.push(
          new FormGroup({
            collaborator_name: new FormControl(collaborator.collaborator_name, [Validators.required]),
            logo: new FormControl(collaborator.logo, [Validators.required]),
            contact_name: new FormControl(collaborator.contact_name, []),
            contact_email: new FormControl(collaborator.contact_email, [Validators.email]),
            contact_phone: new FormControl(collaborator.contact_phone, []),
          })
        );
      }); 
      return      
    }
    this.collaborators.push(
      new FormGroup({
      collaborator_name: new FormControl('', [Validators.required]),
      logo: new FormControl(null, [Validators.required]),
      contact_name: new FormControl('', []),
      contact_email: new FormControl('', [Validators.email]),
      contact_phone: new FormControl('', []),
      })
    );
  }

  addDocument(documents?: DocumentsStudyZones[]): void {
    if(!!documents) {
      documents.forEach(document => {
        this.documents.push(
          new FormGroup({
            name: new FormControl(document.name, [Validators.required]),
            file: new FormControl(document.file, [Validators.required]),
          })
        );
      }); 
      return      
    }
    this.documents.push(
      new FormGroup({
        name: new FormControl('', [Validators.required]),
        file: new FormControl(null, [Validators.required]),
      })
    );
  }

  onUploadFile(event: any, index: number, isDocument: boolean): void {
    const file = event.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    if (isDocument) {
      reader.onload = () => {
        this.documents.controls[index].get('file').setValue(reader.result);
      };
    } else {
      reader.onload = () => {
        this.collaborators.controls[index].get('logo').setValue(reader.result);
      };
    }
  }

  removeDocument(index: number): void {
    this.documents.removeAt(index);
  }

  removeCollaborator(index: number): void {
    this.collaborators.removeAt(index);
  }

  toggleDialog(): void {
    this.toggleStudyZoneForm.emit();
    this.studyZoneService.studyZoneSelected$.next(null);
  }

  showWarn(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Ha succeit un error',
      detail: 'Tenca el formulari i torna a intentar-ho',
    });
  }

  showSuccess(isUpdate?: boolean): void {
    if (!isUpdate) {
      this.messageService.add({
        severity: 'success',
        summary: "Zona d'estudi creada",
        detail: 'Ara ja la podrás visualitzar al llistat',
      });
      return;
    }
    this.messageService.add({
      severity: 'success',
      summary: "Zona d'estudi actualitzada",
      detail: "Has actualitzat la zona d'estudi amb exit",
    });
  }

  submit() {
    const isNewZone = !this.studyZoneSelected;
    if (isNewZone) {
      const userId = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')).id
        : null;
      const result: StudyZoneForm = {
        ...this.studyZoneForm.value,
        user_id: userId,
      };
      const polygon = this.polygon().geometry.coordinates[0].map(
        (coo: number) => String(coo).replace(',', ' ')
      );
      this.studyZoneService.createStudyZone(polygon, result).subscribe({
        next: () => {
          this.showSuccess();
          this.toggleStudyZoneForm.emit();
          this.studyZoneForm.reset();
          this.studyZoneMapService.deletePolygonFilter();
        },
        error: (error) => {
          this.showWarn();
        },
      });
      return;
    }
    const studyZoneUpdated = {
      ...this.studyZoneSelected,
      ...this.studyZoneForm.value,
      start_date: this.studyZoneForm.value.start_end_dates[0],
      end_date: this.studyZoneForm.value.start_end_dates[1],
    };

    this.studyZoneService
      .updateStudyZone(this.studyZoneSelected.id, studyZoneUpdated)
      .subscribe({
        next: () => {
          this.showSuccess(true);
          this.toggleStudyZoneForm.emit();
          this.studyZoneForm.reset();
        },
        error: (error) => {
          this.showWarn();
        },
      });
  }
}
