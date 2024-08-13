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
  });

  get documents(): FormArray {
    return this.studyZoneForm.get('documents') as FormArray;
  }

  addDocument(): void {
    this.documents.push(
      new FormGroup({
        name: new FormControl('', [Validators.required]),
        file: new FormControl(null, [Validators.required]),
      })
    );
  }

  onUploadFileDocument(event: any, index: number): void {
    const file = event.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.documents.controls[index].get('file').setValue(reader.result);
    };
  }

  removeDocument(index: number): void {
    this.documents.removeAt(index);
  }

  toggleDialog() {
    this.toggleStudyZoneForm.emit();
  }
}
