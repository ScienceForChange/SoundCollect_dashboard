import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router, Event } from '@angular/router';

import { filter } from 'rxjs/operators';

import { TranslateService } from '@ngx-translate/core';

import { MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth/auth.service';


export interface UserLogin {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private translations = inject(TranslateService);

  private user!: UserLogin;

  private lastUrl!: string | null;

  valCheck: string[] = ['remember'];

  password!: string;

  loading: boolean = false;

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  constructor() {
    if(this.authService.isLoggedIn.value) this.router.navigate(['/']);

    this.router.events
      .pipe(
        filter(
          (event: Event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        this.lastUrl = event.urlAfterRedirects;
      });
  }

  showWarn() {
    this.messageService.add({
      severity: 'warn',
      summary:this.translations.instant('login.errorTitle'),
      detail: this.translations.instant('login.errorSubtitle'),
    });
  }

  clear() {
    this.messageService.clear();
  }

  submit() {
    this.user = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.loading = true;

    setTimeout(() => {
      this.authService.login(this.user).subscribe({
        next: () => {
          this.loading = false;
        },
        error: (resp: any) => {
          this.loginForm.controls['email'].markAsUntouched();
          this.clear();
          this.showWarn();
          this.loginForm.controls['password'].reset();
          this.loading = false;
        },
      });
    }, 2000);
  }
}
