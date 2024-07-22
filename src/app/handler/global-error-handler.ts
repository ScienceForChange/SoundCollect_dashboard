import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { MessageService } from 'primeng/api';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private messageService = inject(MessageService);
  private zone = inject(NgZone);
  private translations = inject(TranslateService);

  handleError(error: any) {
    //Error from throw error alway returns undefined
    console.error('Error occurred:', error);
    // Check if it's an error from an HTTP response
    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection; // get the error object
    }
    this.zone.run(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          error?.message ||
          this.translations.instant('app.errorHandler'),
      });
    });
  }
}
