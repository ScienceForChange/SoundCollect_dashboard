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

  private areAllItemsExpanded(): boolean {
    return this.adminItems.every((menuItem) => menuItem.expanded);
  }

  //También podría que cuando clicas en el boton del menú se añada una clase a todo el componente que haga que esté todo abierto.

  @HostListener('mouseenter') onMouseEnter() {
    console.log('Component is hovered', this.areAllItemsExpanded());
  }

  @HostListener('mouseleave') onMouseLeave() {
    //Aquí comprobare si está abierto en menu, de ser que sí e
    console.log('Component is not hovered');
  }

  isAdminMenuOpen: boolean = false;

  //Cada menu item tendrá una función que cerrará el menú
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
          icon: 'pi pi-fw pi-plus',
          command: () => {
            this.toggleAdminMenu.emit(false);
            this.closeAll();
            this.router.navigate(['/admin/study-zone']);
          },
        },
        {
          label: 'Usuaris',
          icon: 'pi pi-fw pi-folder-open',
          command: () => {
            this.toggleAdminMenu.emit(false);
            this.closeAll();
            this.router.navigate(['/admin/study-zone']);
          },
        },
        {
          label: 'Observacions',
          icon: 'pi pi-fw pi-times',
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
