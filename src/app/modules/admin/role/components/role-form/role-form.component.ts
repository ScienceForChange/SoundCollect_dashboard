import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RolService } from '../../../../../services/admin-user/rol.service';
import { AdminUserService } from '../../../../../services/admin-user/admin-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdminUser, Role } from '../../../../../models/admin-user';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss'
})
export class RoleFormComponent implements OnInit, OnDestroy {

  private rolService: RolService              = inject(RolService);
  private activatedRoute: ActivatedRoute      = inject(ActivatedRoute);
  private fb: FormBuilder                     = inject(FormBuilder);
  private messageService: MessageService      = inject(MessageService);
  private router: Router                      = inject(Router);

  private roles$!: Subscription;
  private adminUser$!: Subscription;
  private permissions$!: Subscription;
  private activatedRoute$!: Subscription;

  public adminUsers! : AdminUser;
  public role!: Role;
  public permissions: string[] = [];

  public roleForm: FormGroup = this.fb.group({

    id:               [null],
    name:             ['', [Validators.required, Validators.minLength(3)]],
    permissions_list: [[], [Validators.required]],

  });

  ngOnInit(): void {


    this.permissions$ = this.rolService.getAllPermissions().subscribe((permissions) => {
      this.permissions = permissions.data;
    });

    this.activatedRoute$ = this.activatedRoute.params.subscribe((params) => {
      if(params['id']) {
        this.rolService.getRole(params['id']).subscribe((role) => {
          this.role = role.data;
          this.roleForm.patchValue(this.role);
        });
      }
    });

  }

  submit(): void {

    if(this.roleForm.valid) {
      if(this.roleForm.value.id) {
        this.rolService.updateRole(this.roleForm.value).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Role updated successfully'
            });
            //redirect to role list
            this.router.navigate(['/admin/role']);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error updating role'
            });
          }
        });
      }
      else {
        this.rolService.createRole(this.roleForm.value).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Role created successfully'
            });
            //redirect to role list
            this.router.navigate(['/admin/role']);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error creating role'
            });
          }
        });
      }
    }

  }

  ngOnDestroy(): void {
    if(this.roles$)           this.roles$.unsubscribe();
    if(this.adminUser$)       this.adminUser$.unsubscribe();
    if(this.permissions$)     this.permissions$.unsubscribe();
    if(this.activatedRoute$)  this.activatedRoute$.unsubscribe();
  }

}
