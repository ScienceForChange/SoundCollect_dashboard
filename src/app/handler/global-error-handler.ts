import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, inject, Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private messageService = inject(MessageService);
    private router = inject(Router);
    private zone = inject(NgZone);

  handleError(error: any) {
    // Check if it's an error from an HTTP response
    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection; // get the error object
    }
    this.zone.run(() =>{
        this.messageService.add({
            severity: 'error',
            summary:'Error',
            detail: error?.message || 'Ha succeït un error inesperato',
        });
        setTimeout(() => {
            this.router.navigate(['/error']);
        }, 2000);
    })

    console.error('Error from global error handler', error);
  }
}