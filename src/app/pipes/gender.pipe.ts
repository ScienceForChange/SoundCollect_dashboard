import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'gender',
})
export class GenderPipe implements PipeTransform {
  private translateService: TranslateService = inject(TranslateService);
  transform(value: unknown, ...args: unknown[]): unknown {
    switch (value) {
      case 'male':
        return this.translateService.instant('app.man');
      case 'female':
        return this.translateService.instant('app.woman');
      case 'others':
        return this.translateService.instant('app.others');
      case 'non-binary':
        return this.translateService.instant('app.unbinarized');
      case 'prefer-not-to-say':
        return this.translateService.instant('app.unknown');
      default:
        return 'Errors';
    }
  }
}
