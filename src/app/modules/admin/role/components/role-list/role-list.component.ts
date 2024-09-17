import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RolService } from '../../../../../services/admin-user/rol.service';
import { Subscription } from 'rxjs';
import { Role } from '../../../../../models/admin-user';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent implements OnInit, OnDestroy {


  private rolService: RolService = inject(RolService);
  private roles$!: Subscription;

  roles!: Role[];

  ngOnInit(): void {
    this.roles$ = this.rolService.getRoles().subscribe((response) => {
      this.roles = response.data;
    });
  }

  ngOnDestroy(): void {
    if (this.roles$) this.roles$.unsubscribe();
  }

  deleteRole(id: number): void {
    console.log(`Deleting role with id: ${id}`);
  }

}
