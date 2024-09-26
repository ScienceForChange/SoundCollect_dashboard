import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppLayoutComponent } from './layout/components/layout/app.layout.component';
import { LoginComponent } from './modules/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { MapComponent } from './modules/map/page/map.component';
import { OverviewComponent } from './modules/overview/page/overview/overview.component';
import { SoundscapeComponent } from './modules/soundscape/page/soundscape.component';
import { ErrorComponent } from './modules/error/page/error.component';
import { HomeComponent } from './modules/home/page/home.component';
import { StudyZoneComponent } from './modules/admin/study-zone/page/study-zone.component';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { AdminUserComponent } from './modules/admin/admin-user/page/admin-user.component';
import { AdminUserListComponent } from './modules/admin/admin-user/components/admin-user-list/admin-user-list.component';
import { AdminUserFormComponent } from './modules/admin/admin-user/components/admin-user-form/admin-user-form.component';
import { RoleComponent } from './modules/admin/role/page/role.component';
import { RoleListComponent } from './modules/admin/role/components/role-list/role-list.component';
import { RoleFormComponent } from './modules/admin/role/components/role-form/role-form.component';
import { AppUserComponent } from './modules/admin/app-user/page/app-user.component';
import { AppUserListComponent } from './modules/admin/app-user/components/app-user-list/app-user-list.component';
import { AppUserFormComponent } from './modules/admin/app-user/components/app-user-form/app-user-form.component';
import { ObservationComponent } from './modules/admin/observation/page/observation.component';
import { ObservationListComponent } from './modules/admin/observation/components/observation-list/observation-list.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'map',
        component: MapComponent,
      },
      {
        path: 'soundscape',
        component: SoundscapeComponent,
      },
      {
        path: 'resum',
        component: OverviewComponent,
      },
      {
        path: 'admin',
        canActivate: [ngxPermissionsGuard],
        data: {
          permissions: {
            only: ['MANAGE-ADMIN'],
          },
        },
        children: [
          {
            path: 'study-zone',
            component: StudyZoneComponent,
            canActivate: [ngxPermissionsGuard],
            data: {
              permissions: {
                only: ['MANAGE-STUDY-ZONES'],
              },
            },
          },
          {
            path: 'admin-user',
            component: AdminUserComponent,
            canActivate: [ngxPermissionsGuard],
            data: {
              permissions: {
                only: ['MANAGE-ADMIN-USERS'],
              },
            },
            children: [
              {
                path: '',
                component: AdminUserListComponent,
                canActivate: [ngxPermissionsGuard],
                data: {
                  permissions: {
                    only: ['MANAGE-ADMIN-USERS'],
                  },
                }
              },
              {
                path: 'create',
                component: AdminUserFormComponent,
                canActivate: [ngxPermissionsGuard],
                data: {
                  permissions: {
                    only: ['CREATE-ADMIN-USERS'],
                  },
                },
              },
              {
                path: 'update/:id',
                component: AdminUserFormComponent,
                canActivate: [ngxPermissionsGuard],
                data: {
                  permissions: {
                    only: ['UPDATE-ADMIN-USERS'],
                  },
                }
              }
            ]
          },
          {
            path: 'role',
            component: RoleComponent,
            canActivate: [ngxPermissionsGuard],
            data: {
              permissions: {
                only: ['MANAGE-ROLES'],
              },
            },
            children: [
              {
                path: '',
                component: RoleListComponent,
                canActivate: [ngxPermissionsGuard],
                data: {
                  permissions: {
                    only: ['MANAGE-ROLES'],
                  },
                }
              },
              {
                path: 'create',
                component: RoleFormComponent,
                canActivate: [ngxPermissionsGuard],
                data: {
                  permissions: {
                    only: ['CREATE-ROLES'],
                  },
                },
              },
              {
                path: 'update/:id',
                component: RoleFormComponent,
                canActivate: [ngxPermissionsGuard],
                data: {
                  permissions: {
                    only: ['UPDATE-ROLES'],
                  },
                }
              }
            ]
          },
          {
            path: 'app-user',
            component: AppUserComponent,
            canActivate: [ngxPermissionsGuard],
            data: {
              permissions: {
                only: ['MANAGE-APP-USERS'],
              },
            },
            children: [
              {
                path: '',
                component: AppUserListComponent,
                canActivate: [ngxPermissionsGuard],
                data: {
                  permissions: {
                    only: ['MANAGE-APP-USERS'],
                  },
                  trashedUsers: false
                }
              },
              {
                path: 'disabled-users',
                component: AppUserListComponent,
                canActivate: [ngxPermissionsGuard],
                data: {
                  permissions: {
                    only: ['DELETE-APP-USERS'],
                  },
                  trashedUsers: true
                },
              }
            ]
          },
          {
            path: 'observation',
            component: ObservationComponent,
            canActivate: [ngxPermissionsGuard],
            data: {
              permissions: {
                only: ['MANAGE-OBSERVATIONS'],
              },
            },
            children: [
              {
                path: '',
                component: ObservationListComponent,
                canActivate: [ngxPermissionsGuard],
                data: {
                  permissions: {
                    only: ['MANAGE-OBSERVATIONS'],
                  },
                  trashedObservations: false
                }
              },
              {
                path: 'disabled-observations',
                component: AppUserListComponent,
                canActivate: [ngxPermissionsGuard],
                data: {
                  permissions: {
                    only: ['DELETE-OBSERVATIONS'],
                  },
                  trashedObservations: true
                },
              }
            ]
          },
        ],
      },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'error',
    component: ErrorComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
