import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-study-zone-form',
  templateUrl: './study-zone-form.component.html',
  styleUrl: './study-zone-form.component.scss',
})
export class StudyZoneFormComponent {
  @Input() visible: boolean = false;
  @Output() toggleStudyZoneForm: EventEmitter<void> = new EventEmitter<void>();

  studyZoneForm: FormGroup = new FormGroup({
    user_id: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    conclusion: new FormControl('', [Validators.required]),
    start_end_dates: new FormControl(
      [new Date(), new Date()],
      [Validators.required]
    ),
    documents: new FormArray([]),
    collaborators: new FormArray([]),
  });

  get documents(): FormArray {
    return this.studyZoneForm.get('documents') as FormArray;
  }
  get collaborators(): FormArray {
    return this.studyZoneForm.get('collaborators') as FormArray;
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

  onUploadFile(event: any, index: number,isDocument:boolean): void {
    const file = event.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    if(isDocument){
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

  toggleDialog() {
    this.toggleStudyZoneForm.emit();
  }
}
