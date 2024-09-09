import { Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
  styleUrl: './app.menu.component.scss',
})
export class AppMenuComponent {
  private authService = inject(AuthService);
  @Input() currentLang: string = 'CA'
  @Output() toggleLangMenu = new EventEmitter<void>();

  loading: boolean = false;

  toggleLanguageMenu(): void {
    this.toggleLangMenu.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
