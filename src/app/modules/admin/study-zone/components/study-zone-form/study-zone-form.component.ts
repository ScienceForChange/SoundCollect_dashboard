import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-study-zone-form',
  templateUrl: './study-zone-form.component.html',
  styleUrl: './study-zone-form.component.scss'
})
export class StudyZoneFormComponent {
  @Input() visible: boolean = false;
  @Output() toggleStudyZoneForm: EventEmitter<void> = new EventEmitter<void>();

  toggleDialog() {
    console.log('toggleDialof')
    this.toggleStudyZoneForm.emit();
  }
}
