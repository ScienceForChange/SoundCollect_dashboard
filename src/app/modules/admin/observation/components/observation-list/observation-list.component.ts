import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Observations, User } from '../../../../../models/observations';
import { ObservationsService } from '../../../../../services/observations/observations.service';

@Component({
  selector: 'app-observation-list',
  templateUrl: './observation-list.component.html',
  styleUrl: './observation-list.component.scss'
})
export class ObservationListComponent {

  activatedRoute:ActivatedRoute             = inject(ActivatedRoute);
  observationsService: ObservationsService  = inject(ObservationsService);
  confirmationService: ConfirmationService  = inject(ConfirmationService);
  messageService: MessageService            = inject(MessageService);

  private activatedRoute$!: Subscription;
  private deleteAppUser$!: Subscription;
  private getUsers$!: Subscription;


  userLogged: User = JSON.parse(localStorage.getItem('user') as string);

  router = inject(Router);

  observations: Observations[] = [];
  showTrashedObservations:boolean = false;

  ngOnInit(): void {

    this.showTrashedObservations = this.activatedRoute.snapshot.data['trashedUsers'] ? this.activatedRoute.snapshot.data['trashedUsers'] : false;

    this.observationsService.observations$.subscribe({
      next: (response) => {
        this.observations = response;
        console.log(this.observations);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error getting Observations'
        });
      }
    });
  }

  public deleteObservation(observation: Observations, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      icon: 'pi pi-exclamation-circle',
      acceptIcon: 'pi pi-check mr-1',
      rejectIcon: 'pi pi-times mr-1',
      acceptLabel: 'Confirm',
      rejectLabel: 'Cancel',
      rejectButtonStyleClass: 'p-button-outlined p-button-sm',
      acceptButtonStyleClass: 'p-button-sm',
      accept: () => {
        this.deleteAppUser$ = this.observationsService.deleteObservation(observation.id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User deleted successfully'
            });
            this.observations = this.observations.filter((obs) => obs.id !== observation.id);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error deleting User'
            });
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if(this.activatedRoute$) this.activatedRoute$.unsubscribe();
    if(this.deleteAppUser$) this.deleteAppUser$.unsubscribe();
    if(this.getUsers$) this.getUsers$.unsubscribe();
  }
}
