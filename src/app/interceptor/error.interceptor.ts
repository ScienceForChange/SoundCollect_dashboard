import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        console.log(err)
        
        if ([401, 403].includes(err.status) && this.authService.isLoggedIn.getValue()) {
          // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
          this.authService.logout();
        }
        if(err.status !== 422){
          this.router.navigate(['/error']);
        };

        const error = err.error.message || err.statusText;
        return throwError(() => new Error(error));
      })
    );
  }
}

export const errorInterceptorProviders = 
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
;
