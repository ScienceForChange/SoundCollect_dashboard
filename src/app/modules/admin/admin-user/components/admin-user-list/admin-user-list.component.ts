import { Component, inject, OnInit } from '@angular/core';
import { AdminUserService } from '../../../../../services/admin-user/admin-user.service';
import { AdminUser } from '../../../../../models/admin-user';

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './admin-user-list.component.html',
  styleUrl: './admin-user-list.component.scss'
})
export class AdminUserListComponent implements OnInit {

  adminUserService: AdminUserService = inject(AdminUserService);

  adminUsers: AdminUser[] = [];

  ngOnInit(): void {
    this.adminUserService.getAdminUsers().subscribe((users) => {
      this.adminUsers = users;
    });
  }

  public deleteUser(user: AdminUser): void {
    this.adminUserService.deleteAdminUser(user).subscribe(() => {
      this.adminUsers = this.adminUsers.filter((u) => u.id !== user.id);
    });
  }
}
