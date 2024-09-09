import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
} from '@angular/core';

import { AuthService } from '../../../services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
  styleUrl: './app.menu.component.scss',
})
export class AppMenuComponent {
  private authService = inject(AuthService);
  private translateService = inject(TranslateService);
  private router = inject(Router);

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
      icon: 'pi pi-fw pi-user-edit',
      command: () => {
        console.log('clicked');
        this.toggleAdminMenu.emit(true);
      },
      items: [
        {
          label: "Zonas d'estudi",
          icon: 'pi pi-fw pi-map',
          command: () => {
            this.toggleAdminMenu.emit(false);
            this.closeAll();
            this.router.navigate(['/admin/study-zone']);
          },
        },
        {
          label: 'Usuaris',
          icon: 'pi pi-fw pi-users',
          command: () => {
            this.toggleAdminMenu.emit(false);
            this.closeAll();
            this.router.navigate(['/admin/study-zone']);
          },
        },
        {
          label: 'Observacions',
          icon: 'pi pi-fw pi-map-marker',
          command: () => {
            this.toggleAdminMenu.emit(false);
            this.closeAll();
            this.router.navigate(['/admin/study-zone']);
          },
        },
      ],
    },
  ];

  loading: boolean = false;

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
