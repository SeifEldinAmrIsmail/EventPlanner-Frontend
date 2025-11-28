import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withInterceptors,
  HttpInterceptorFn,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

/** Adds JWT to requests; on 401, clears token and redirects to /login */
const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  const router = inject(Router);

  return next(req).pipe(
    // Only one param is needed here; remove the unused "caught" to avoid TS errors
    catchError((err: HttpErrorResponse) => {
      if (err?.status === 401) {
        localStorage.removeItem('access_token');
        try {
          router.navigateByUrl('/login');
        } catch {
          /* no-op */
        }
      }
      return throwError(() => err);
    })
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
