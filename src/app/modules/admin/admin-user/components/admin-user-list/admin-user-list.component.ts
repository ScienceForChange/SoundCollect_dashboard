import { Component, inject, OnInit } from '@angular/core';
import { AdminUserService } from '../../../../../services/admin-user/admin-user.service';
import { AdminUser } from '../../../../../models/admin-user';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './admin-user-list.component.html',
  styleUrl: './admin-user-list.component.scss'
})
export class AdminUserListComponent implements OnInit {

  adminUserService: AdminUserService        = inject(AdminUserService);
  confirmationService: ConfirmationService  = inject(ConfirmationService);
  messageService: MessageService            = inject(MessageService);

  userLogged: AdminUser = JSON.parse(localStorage.getItem('user') as string);

  router = inject(Router);

  adminUsers: AdminUser[] = [];

  ngOnInit(): void {
    this.adminUserService.getAdminUsers().subscribe((users) => {
      this.adminUsers = users;
    });
  }

  public deleteUser(user: AdminUser, event: Event): void {
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
        this.adminUserService.deleteAdminUser(user).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Admin User deleted successfully'
            });
            this.adminUsers = this.adminUsers.filter((adminUser) => adminUser.id !== user.id);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error deleting Admin User'
            });
          }
        });
      }
    });
  }

}
