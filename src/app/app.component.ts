import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  private translate = inject(TranslateService);
  constructor() {
    this.translate.setDefaultLang('ca');
    this.translate.use('ca');
    this.translate.addLangs(['en', 'es', 'ca']);
  }
}
