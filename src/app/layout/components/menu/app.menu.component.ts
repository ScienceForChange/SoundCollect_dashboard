import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { AuthService } from '../../../services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
  styleUrl: './app.menu.component.scss',
})
export class AppMenuComponent implements OnInit {
  private authService = inject(AuthService);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private ngxPermissionsService = inject(NgxPermissionsService);

  @Input() currentLang: string = 'CA';
  @Output() toggleLangMenu = new EventEmitter<void>();
  @Output() toggleAdminMenu = new EventEmitter<boolean>();

  @HostListener('mouseleave') onMouseLeave() {
    this.closeAll();
    setTimeout(() => {
      this.toggleAdminMenu.emit(false);
    }, 500);
  }

  isAdminMenuOpen: boolean = false;

  adminItems: MenuItem[] = [
    {
      label: this.translateService.instant('app.adminPanel'),
      icon: 'pi pi-fw pi-wrench',
      command: () => {
        this.toggleAdminMenu.emit(true);
      },
      items: [],
    },
  ];

  loading: boolean = false;

  ngOnInit(): void {
    const permissions = this.ngxPermissionsService.getPermissions();
    Object.keys(permissions).forEach((permission) => {
      switch (permission) {
        case 'MANAGE-STUDY-ZONES': {
          this.adminItems[0].items.push({
            label: "Zonas d'estudi",
            icon: 'pi pi-map',
            command: () => {
              this.toggleAdminMenu.emit(false);
              this.closeAll();
              this.router.navigate(['/admin/study-zone']);
            },
          });
          break;
        }
        case 'MANAGE-APP-USERS': {
          this.adminItems[0].items.push({
            label: 'Usuaris',
            icon: 'pi pi-users',
            command: () => {
              this.toggleAdminMenu.emit(false);
              this.closeAll();
              this.router.navigate(['/admin/app-user']);
            },
          });
          break;
        }
        case 'MANAGE-ADMIN-USERS': {
          this.adminItems[0].items.push({
            label: 'Administradors',
            icon: 'pi pi-id-card',
            command: () => {
              this.toggleAdminMenu.emit(false);
              this.closeAll();
              this.router.navigate(['/admin/admin-user']);
            },
          });
          break;
        }
        case 'MANAGE-ROLES': {
          this.adminItems[0].items.push({
            label: 'Rols',
            icon: 'pi pi-tags',
            command: () => {
              this.toggleAdminMenu.emit(false);
              this.closeAll();
              this.router.navigate(['/admin/role']);
            },
          });
          break;
        }
        case 'MANAGE-OBSERVATIONS': {
          this.adminItems[0].items.push({
            label: 'Observacions',
            icon: 'pi pi-fw pi-map-marker',
            command: () => {
              this.toggleAdminMenu.emit(false);
              this.closeAll();
              this.router.navigate(['/admin/observation']);
            },
          });
          break;
        }
      }
    });
  }

  toggleLanguageMenu(): void {
    this.toggleLangMenu.emit();
  }

  closeAll() {
    this.adminItems = this.toggleAllRecursive(this.adminItems, false);
  }

  private toggleAllRecursive(items: MenuItem[], expanded: boolean): MenuItem[] {
    return items.map((menuItem) => {
      menuItem.expanded = expanded;
      if (menuItem.items) {
        menuItem.items = this.toggleAllRecursive(menuItem.items, expanded);
      }
      return menuItem;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
