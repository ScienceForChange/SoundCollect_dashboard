import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  private translate = inject(TranslateService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    this.translate.setDefaultLang('ca');
    this.translate.use('ca');
    this.translate.addLangs(['en', 'es', 'ca']);
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      // TODO instant() are not updating when language changes
      this.changeDetectorRef.detectChanges();
    });
  }
}
