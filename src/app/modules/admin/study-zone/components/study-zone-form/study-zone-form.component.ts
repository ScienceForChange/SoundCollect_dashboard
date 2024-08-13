import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-study-zone-form',
  templateUrl: './study-zone-form.component.html',
  styleUrl: './study-zone-form.component.scss'
})
export class StudyZoneFormComponent {
  @Input() visible: boolean = false;

  showDialog() {
      this.visible = true;
  }
}
