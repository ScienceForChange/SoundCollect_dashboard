import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  CollaboratorsStudyZone,
  DocumentsStudyZones,
  StudyZone,
  StudyZoneForm,
} from '../../../../../models/study-zone';
import { StudyZoneService } from '../../../../../services/study-zone/study-zone.service';
import { StudyZoneMapService } from '../../service/study-zone-map.service';

import compareObjectsValues from '../../../../../../utils/compareObjects';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-study-zone-form',
  templateUrl: './study-zone-form.component.html',
  styleUrl: './study-zone-form.component.scss',
})
export class StudyZoneFormComponent {
  private messageService = inject(MessageService);
  private studyZoneService = inject(StudyZoneService);
  private studyZoneMapService = inject(StudyZoneMapService);
  private translations = inject(TranslateService);

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
  studyZoneSelected: StudyZoneForm | null = null;

  get documents(): FormArray {
    return this.studyZoneForm.get('documents') as FormArray;
  }
  get collaborators(): FormArray {
    return this.studyZoneForm.get('collaborators') as FormArray;
  }

  ngOnInit(): void {
    this.polygon = this.studyZoneMapService.polygonFilter;
    this.studyZoneService.studyZoneSelected$.subscribe((studyZoneSelected) => {
      const isUpdate = !!studyZoneSelected;
      if (isUpdate) {
        const studyZoneForm: StudyZoneForm = {
          ...studyZoneSelected,
          collaborators: studyZoneSelected.relationships.collaborators.map(
            (col) => {
              //Delete logo key as backend only works with logo_data
              const { logo, ...rest } = col;
              return {
                ...rest,
                logo_data: col.logo,
              };
            }
          ),
          documents: studyZoneSelected.relationships.documents.map((doc) => {
            //Delete logo key as backend only works with file_data
            const { file, ...rest } = doc;
            return {
              ...rest,
              file_data: doc.file,
            };
          }),
          start_end_dates: [
            new Date(studyZoneSelected.start_date),
            new Date(studyZoneSelected.end_date),
          ],
        };

        this.studyZoneSelected = studyZoneForm;

        //Update the form with the values of the selected studyZone when
        this.studyZoneForm.patchValue(studyZoneForm);

        //Create the form controls for the collaborators and documents
        this.addCollaborator(studyZoneSelected.relationships.collaborators);
        this.addDocument(studyZoneSelected.relationships.documents);
      }
    });
  }

  addCollaborator(collaborators?: CollaboratorsStudyZone[]): void {
    const isUpdating = !!collaborators;
    if (isUpdating) {
      collaborators.forEach((collaborator) => {
        this.collaborators.push(
          new FormGroup({
            collaborator_name: new FormControl(collaborator.collaborator_name, [
              Validators.required,
            ]),
            logo_data: new FormControl(collaborator.logo, [
              Validators.required,
            ]),
            contact_name: new FormControl(collaborator.contact_name, []),
            contact_email: new FormControl(collaborator.contact_email, [
              Validators.email,
            ]),
            contact_phone: new FormControl(collaborator.contact_phone, []),
            id: new FormControl(collaborator.id, []),
          })
        );
      });
      return;
    }
    //Creating new collaborator
    this.collaborators.push(
      new FormGroup({
        collaborator_name: new FormControl('', [Validators.required]),
        logo_data: new FormControl(null, [Validators.required]),
        contact_name: new FormControl('', []),
        contact_email: new FormControl('', [Validators.email]),
        contact_phone: new FormControl('', []),
      })
    );
  }

  addDocument(documents?: DocumentsStudyZones[]): void {
    const isUpdating = !!documents;
    if (isUpdating) {
      documents.forEach((document) => {
        this.documents.push(
          new FormGroup({
            name: new FormControl(document.name, [Validators.required]),
            file_data: new FormControl(document.file, [Validators.required]),
            id: new FormControl(document.id, []),
          })
        );
      });
      return;
    }
    //Creating new document
    this.documents.push(
      new FormGroup({
        name: new FormControl('', [Validators.required]),
        file_data: new FormControl(null, [Validators.required]),
      })
    );
  }

  onUploadFile(event: any, index: number, isDocument: boolean): void {
    const file = event.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    if (isDocument) {
      reader.onload = () => {
        this.documents.controls[index].get('file_data').setValue(reader.result);
      };
    } else {
      reader.onload = () => {
        this.collaborators.controls[index]
          .get('logo_data')
          .setValue(reader.result);
      };
    }
  }

  removeDocument(index: number): void {
    this.documents.removeAt(index);
  }

  removeCollaboratorsLogo(index: number): void {
    this.collaborators.controls[index].get('logo_data').setValue(null);
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
      summary: this.translations.instant(
        'admin.studyZone.form.messages.errorSummary'
      ),
      detail: this.translations.instant(
        'admin.studyZone.form.messages.errorDetail'
      ),
    });
  }

  showSuccess(isUpdate?: boolean): void {
    if (!isUpdate) {
      this.messageService.add({
        severity: 'success',
        summary: this.translations.instant(
          'admin.studyZone.form.messages.createSummary'
        ),
        detail: this.translations.instant(
          'admin.studyZone.form.messages.createDetail'
        ),
      });
      return;
    }
    this.messageService.add({
      severity: 'success',
      summary: this.translations.instant(
        'admin.studyZone.form.messages.updateSummary'
      ),
      detail: this.translations.instant(
        'admin.studyZone.form.messages.updateDetail'
      ),
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
        collaborators: this.studyZoneForm.value.collaborators,
        documents: this.studyZoneForm.value.documents,
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

    const studyZoneFormValues = this.studyZoneForm.value;

    //Update collaborators and documents values to send to the backend
    Object.keys(studyZoneFormValues).forEach((key) => {
      if (key === 'collaborators') {
        studyZoneFormValues.collaborators.forEach(
          (collaborator: CollaboratorsStudyZone, index: number) => {
            const SZSelectedCol = this.studyZoneSelected.collaborators.find(
              (collaboratorSelected) => {
                return collaboratorSelected.id === collaborator.id;
              }
            );
            const isNewCollaborator = !!SZSelectedCol;
            const isLogoDeleted = !collaborator.logo_data;
            if (isNewCollaborator) {
              const { areEqual } = compareObjectsValues(
                SZSelectedCol,
                collaborator
              );
              if (isLogoDeleted) {
                studyZoneFormValues[key][index].logo = null;
              }
              if (areEqual) {
                studyZoneFormValues[key][index].logo =
                  studyZoneFormValues[key][index].logo_data;
                studyZoneFormValues[key][index].logo_data = null;
              }
            }
          }
        );
      }
      if (key === 'documents') {
        studyZoneFormValues.documents.forEach(
          (document: DocumentsStudyZones, index: number) => {
            const SZSelectedDoc = this.studyZoneSelected.documents.find(
              (documentSelected) => documentSelected.id === document.id
            );
            const isNewDocument = !!SZSelectedDoc;
            if (isNewDocument) {
              const { areEqual } = compareObjectsValues(
                SZSelectedDoc,
                document
              );
              if (areEqual) {
                studyZoneFormValues[key][index].file =
                  studyZoneFormValues[key][index].file_data;
                studyZoneFormValues[key][index].file_data = null;
              }
            }
          }
        );
      }
    });

    this.studyZoneService
      .updateStudyZone(
        this.studyZoneSelected.id,
        studyZoneFormValues,
        this.studyZoneSelected.boundaries
      )
      .subscribe({
        next: () => {
          this.showSuccess(true);
          this.toggleStudyZoneForm.emit();
          this.studyZoneService.studyZoneSelected$.next(null);
        },
        error: (error) => {
          this.showWarn();
        },
      });
  }
}
