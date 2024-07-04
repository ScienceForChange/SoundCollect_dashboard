import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Observations } from '../../../../models/observations';



@Component({
  selector: 'app-observation-info-modal',
  templateUrl: './observation-info-modal.component.html',
  styleUrl: './observation-info-modal.component.scss',
})
export class ObservationInfoModalComponent {
  @Input() observationSelected!: Observations;
  @Input() isOpen: boolean = false;
  @Output() hideModal: EventEmitter<void> = new EventEmitter<void>();

  closeModal(): void {
    this.hideModal.emit();
  }
}
