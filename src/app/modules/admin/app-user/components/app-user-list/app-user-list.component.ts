import { Component, inject, OnInit } from '@angular/core';
import { User } from '../../../../../models/observations';
import { UserService } from '../../../../../services/user/user.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-app-user-list',
  templateUrl: './app-user-list.component.html',
  styleUrl: './app-user-list.component.scss'
})
export class AppUserListComponent implements OnInit {

  activatedRoute:ActivatedRoute             = inject(ActivatedRoute);
  userService: UserService                  = inject(UserService);
  confirmationService: ConfirmationService  = inject(ConfirmationService);
  messageService: MessageService            = inject(MessageService);

  private activatedRoute$!: Subscription;
  private deleteAppUser$!: Subscription;
  private getUsers$!: Subscription;


  userLogged: User = JSON.parse(localStorage.getItem('user') as string);

  router = inject(Router);

  users: User[] = [];
  showTrashedUsers:boolean = false;

  ngOnInit(): void {

    this.showTrashedUsers = this.activatedRoute.snapshot.data['trashedUsers'] ? this.activatedRoute.snapshot.data['trashedUsers'] : false;

    if(this.showTrashedUsers) {
      this.getUsers$ = this.userService.getTrashedAppUser().subscribe((users) => {
        this.users = users;
      });
    }
    else {
      this.getUsers$ = this.userService.getAppUsers().subscribe((users) => {
        this.users = users;
      });
    }
  }

  public deleteUser(user: User, event: Event): void {
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
        this.deleteAppUser$ = this.userService.deleteAppUser(user).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User deleted successfully'
            });
            this.users = this.users.filter((u) => u.id !== user.id);
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

  public restoreUser(user: User, event: Event): void {
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
        this.deleteAppUser$ = this.userService.restoreAppUser(user).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User restored successfully'
            });
            this.users = this.users.filter((u) => u.id !== user.id);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error restoring User'
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
