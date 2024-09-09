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
    const defaultLocaleSelected = localStorage.getItem('locale');
    const defaultLocaleIndex = this.supportedLanguages.findIndex(lang => lang.code === defaultLocaleSelected);
    this.currentLang = defaultLocaleIndex !== -1 ? this.supportedLanguages[defaultLocaleIndex].name : this.currentLang;

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
  }
}
