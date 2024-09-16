import { AdminUser } from './../../../../../models/admin-user.d';
import { AdminUserService } from './../../../../../services/admin-user/admin-user.service';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RolService } from '../../../../../services/admin-user/rol.service';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-user-form',
  templateUrl: './admin-user-form.component.html',
  styleUrl: './admin-user-form.component.scss'
})
export class AdminUserFormComponent implements OnInit, OnDestroy {
  
  private rolService: RolService              = inject(RolService);
  private adminUserService: AdminUserService  = inject(AdminUserService);
  private activatedRoute: ActivatedRoute      = inject(ActivatedRoute);
  
  private roles$!: Subscription;
  private adminUser$!: Subscription;
  private activatedRoute$!: Subscription;
  
  public adminUser! : AdminUser;

  public roles: string[] = [];

  ngOnInit(): void {

    this.activatedRoute$ = this.activatedRoute.params.subscribe((params) => {
      this.getUser(params['id']);
    });
      
    this.roles$ = this.rolService.getRoles().subscribe((roles) => {
      console.log(roles);
    });

  }

  private getUser(id: string): void {

    this.adminUser$ = this.adminUserService.getAdminUser(id).subscribe((user) => {
     this.adminUser = user;
     console.log(this.adminUser);
    });
    
  } 

  ngOnDestroy(): void {
    this.roles$.unsubscribe();
    this.adminUser$.unsubscribe();
    this.activatedRoute$.unsubscribe();
  }

}
