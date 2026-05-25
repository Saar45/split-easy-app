import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token invalide/expiré sur une requête authentifiée — purge + redirect login.
      if (error.status === 401 && auth.isAuthenticated) {
        auth.logout();
        router.navigate(['/auth/login'], { replaceUrl: true });
      }
      return throwError(() => error);
    }),
  );
};
