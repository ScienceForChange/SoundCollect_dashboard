import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent {
private router = inject(Router)
private translations = inject(TranslateService);

public navigateToHome() {
  this.router.navigate(['/']);
}


}
