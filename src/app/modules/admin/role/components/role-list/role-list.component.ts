import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RolService } from '../../../../../services/admin-user/rol.service';
import { Subscription } from 'rxjs';
import { Role } from '../../../../../models/admin-user';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent implements OnInit, OnDestroy {


  private messageService: MessageService            = inject(MessageService);
  private confirmationService: ConfirmationService  = inject(ConfirmationService);
  private rolService: RolService                    = inject(RolService);


  private roles$!: Subscription;

  roles: Role[] = [];

  ngOnInit(): void {
    this.roles$ = this.rolService.getRoles().subscribe((response) => {
      this.roles = response.data;
    });
  }

  ngOnDestroy(): void {
    if (this.roles$) this.roles$.unsubscribe();
  }

  deleteRole(role: Role, event: Event): void {
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
        if(role.name !== 'superadmin') {
          console.log(role);
          this.rolService.deleteRole(role.id).subscribe({
            next: (response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Role deleted successfully'
              });
              this.roles = this.roles.filter((r) => r.id !== role.id);
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error deleting role'
              });
            }
          });
        }
      }
    });



  }

}

