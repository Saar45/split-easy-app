import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

// Réservé pour la gestion d'erreurs transverses (5xx, toasts, etc.).
// Le 401 est traité par refreshTokenInterceptor.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(catchError((error) => throwError(() => error)));
};
