import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable, NgZone } from '@angular/core';

import { MessageService } from 'primeng/api';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private messageService = inject(MessageService);
  private zone = inject(NgZone);

  handleError(error: any) {
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
          "Ha succeït un error inesperat.Posi's en contacte amb el servei tècnic",
      });
    });

    console.error('Error from global error handler', error);
  }
}
