import { Component, OnInit, inject } from '@angular/core';

import { ObservationsService } from '../../../services/observations/observations.service';
import { StudyZoneService } from '../../../services/study-zone/study-zone.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-layout',
  templateUrl: './app.layout.component.html',
})
export class AppLayoutComponent implements OnInit {
  private observationService = inject(ObservationsService);
  private studyZoneService = inject(StudyZoneService);
  private translations = inject(TranslateService);

  supportedLanguages: { code: string; name: string }[] = [
    {
      code: 'en',
      name: this.translations.instant('app.languageDialog.english'),
    },
    {
      code: 'es',
      name: this.translations.instant('app.languageDialog.spanish'),
    },
    {
      code: 'ca',
      name: this.translations.instant('app.languageDialog.catalan'),
    },
  ];
  currentLang: string = this.translations.instant('app.languageDialog.catalan');
  loading: boolean = false;
  isLanguageMenuOpen: boolean = false;

  async ngOnInit(): Promise<void> {
    //TODO habrá que crear una función que devuelva los valores del observable
    //También se pueden actualizar los valores subscribiendote al onLangChange 
    // this.translations.stream(['app.languageDialog.english','app.languageDialog.spanish']).subscribe((value) => {
    //   console.log('value', value)
    // })
    this.observationService.loading$.subscribe((value) => {
      this.loading = value;
    });
    try {
      await this.observationService.getAllObservations();
      this.studyZoneService.fetchStudyZones();
    } catch (error) {
      console.error(error);
    }
  }

  openLanguageMenu(): void {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  changeLanguage(lang: string): void {
    localStorage.setItem('locale', lang);
    window.location.reload();
    // this.translations.use(lang)
    // this.currentLang = this.supportedLanguages.find(
    //   (l) => l.code === lang
    // ).name;
  }
}
