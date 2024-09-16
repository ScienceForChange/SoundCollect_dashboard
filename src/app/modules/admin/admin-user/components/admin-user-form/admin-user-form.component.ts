import { AdminUser, Role } from './../../../../../models/admin-user.d';
import { AdminUserService } from './../../../../../services/admin-user/admin-user.service';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RolService } from '../../../../../services/admin-user/rol.service';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-user-form',
  templateUrl: './admin-user-form.component.html',
  styleUrl: './admin-user-form.component.scss'
})
export class AdminUserFormComponent implements OnInit, OnDestroy {

  private rolService: RolService              = inject(RolService);
  private adminUserService: AdminUserService  = inject(AdminUserService);
  private activatedRoute: ActivatedRoute      = inject(ActivatedRoute);
  private fb: FormBuilder                     = inject(FormBuilder);

  private roles$!: Subscription;
  private adminUser$!: Subscription;
  private activatedRoute$!: Subscription;

  public adminUser! : AdminUser;
  public roles: Role[] = [];
  public userForm: FormGroup = this.fb.group({

    id:                     [null],
    name:                   ['', [Validators.required, Validators.minLength(3)]],
    email:                  ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    password:               [undefined, [Validators.minLength(8)]],
    password_confirmation:  [undefined, [Validators.minLength(8)]],
    roles_list:             [[], [Validators.required]],

  });

  ngOnInit(): void {

    this.activatedRoute$ = this.activatedRoute.params.subscribe((params) => {
      if(params['id']) this.getUser(params['id']);
    });

    this.roles$ = this.rolService.getRoles().subscribe((roles) => {
      this.roles = roles.data;
    });

  }

  private getUser(id: string): void {

    this.adminUser$ = this.adminUserService.getAdminUser(id).subscribe((user) => {
      this.adminUser = user;
      this.userForm.patchValue(this.adminUser);
      this.userForm.patchValue(this.adminUser.attributes);
    });

  }

  submit(): void {

    if(this.userForm.valid) {
      if(this.userForm.value.id) {
        this.adminUserService.updateAdminUser(this.userForm.value).subscribe(() => {
          console.log('User updated');
        });
      }
      else {
        this.adminUserService.createAdminUser(this.userForm.value).subscribe(() => {
          console.log('User created');
        });
      }
    }
    
  }

  ngOnDestroy(): void {
    if(this.roles$) this.roles$.unsubscribe();
    if(this.adminUser$) this.adminUser$.unsubscribe();
    if(this.activatedRoute$) this.activatedRoute$.unsubscribe();
  }

}
