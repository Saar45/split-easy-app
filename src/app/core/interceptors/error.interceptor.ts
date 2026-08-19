import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { catchError, throwError } from 'rxjs';

const NETWORK_ERROR_MESSAGE = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
const SERVER_ERROR_MESSAGE = 'Une erreur est survenue. Veuillez réessayer plus tard.';

// Gestion transverse des 5xx et des erreurs réseau (status 0) via un toast générique.
// Les 4xx (dont le 401) sont rethrow sans toast : le 401 doit rester silencieux pour
// laisser refreshTokenInterceptor tenter son refresh, et les autres 4xx sont gérés
// par les pages elles-mêmes.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastCtrl = inject(ToastController);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        void presentToast(toastCtrl, NETWORK_ERROR_MESSAGE);
      } else if (error.status >= 500) {
        void presentToast(toastCtrl, SERVER_ERROR_MESSAGE);
      }
      return throwError(() => error);
    }),
  );
};

async function presentToast(toastCtrl: ToastController, message: string): Promise<void> {
  const toast = await toastCtrl.create({
    message,
    duration: 4000,
    position: 'top',
    color: 'danger',
  });
  await toast.present();
}
