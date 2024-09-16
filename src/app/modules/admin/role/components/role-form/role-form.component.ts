import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RolService } from '../../../../../services/admin-user/rol.service';
import { AdminUserService } from '../../../../../services/admin-user/admin-user.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdminUser, Role } from '../../../../../models/admin-user';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss'
})
export class RoleFormComponent implements OnInit, OnDestroy {

  private rolService: RolService              = inject(RolService);
  private adminUserService: AdminUserService  = inject(AdminUserService);
  private activatedRoute: ActivatedRoute      = inject(ActivatedRoute);
  private fb: FormBuilder                     = inject(FormBuilder);

  private roles$!: Subscription;
  private adminUser$!: Subscription;
  private activatedRoute$!: Subscription;

  public adminUsers! : AdminUser;
  public roles: Role[] = [];
  public permissions: string[] = [];

  public roleForm: FormGroup = this.fb.group({
    id:               [null],
    name:             ['', [Validators.minLength(3)]],
    permissions_list: [[], [Validators.required]],
  });

  ngOnInit(): void {
    this.roles$ = this.rolService.getRoles().subscribe((roles) => {
      console.log(roles);
    });

    this.adminUser$ = this.adminUserService.getAdminUsers().subscribe((adminUsers) => {
      console.log(adminUsers);
    });

    this.activatedRoute$ = this.activatedRoute.params.subscribe((params) => {
      
    });

  }

  ngOnDestroy(): void {
    if(this.roles$)           this.roles$.unsubscribe();
    if(this.adminUser$)       this.adminUser$.unsubscribe();
    if(this.activatedRoute$)  this.activatedRoute$.unsubscribe();
  }

}
