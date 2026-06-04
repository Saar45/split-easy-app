import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

const ALREADY_REFRESHED = new HttpContextToken<boolean>(() => false);

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const skip =
        error.status !== 401 ||
        !auth.refreshToken ||
        req.context.get(ALREADY_REFRESHED) ||
        req.url === `${environment.apiUrl}/token/refresh` ||
        req.url === `${environment.apiUrl}/login`;

      if (skip) {
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        switchMap(() =>
          next(
            req.clone({
              context: req.context.set(ALREADY_REFRESHED, true),
              setHeaders: { Authorization: `Bearer ${auth.token}` },
            }),
          ),
        ),
        catchError((refreshError) => {
          auth.logout();
          router.navigate(['/auth/login'], { replaceUrl: true });
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
