import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { StudyZone, StudyZoneForm } from '../../../../../models/study-zone';
import { StudyZoneService } from '../../../../../services/study-zone/study-zone.service';
import { StudyZoneMapService } from '../../service/study-zone-map.service';

@Component({
  selector: 'app-study-zone-form',
  templateUrl: './study-zone-form.component.html',
  styleUrl: './study-zone-form.component.scss',
})
export class StudyZoneFormComponent {
  private messageService = inject(MessageService);
  private translations = inject(TranslateService);
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
    start_end_dates: new FormControl(
      [new Date(), new Date()],
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
      this.studyZoneSelected = studyZoneSelected;
      console.log('studyZoneSelected', studyZoneSelected)
      this.studyZoneForm.patchValue(studyZoneSelected);
    });
  }

  addCollaborator(): void {
    this.collaborators.push(
      new FormGroup({
        collaborator_name: new FormControl('', [Validators.required]),
        logo: new FormControl(null, [Validators.required]),
        contact_name: new FormControl('', []),
        contact_email: new FormControl('', []),
        contact_phone: new FormControl('', []),
      })
    );
  }

  addDocument(): void {
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
    this.studyZoneForm.reset();
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
