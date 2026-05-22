import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastController);

  readonly form: FormGroup = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+/),
      ],
    ],
    cguAcceptees: [false, Validators.requiredTrue],
  });

  submitting = false;

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.form.getRawValue();

    this.auth.register(payload).subscribe({
      next: () => {
        this.auth.login({ email: payload.email, motDePasse: payload.motDePasse }).subscribe({
          next: () => {
            this.auth.fetchCurrentUser().subscribe();
            this.router.navigateByUrl('/tabs/accueil', { replaceUrl: true });
          },
        });
      },
      error: async (err) => {
        this.submitting = false;
        const message = err.status === 409
          ? 'Un compte existe déjà avec cet email.'
          : err.status === 422
            ? 'Vérifiez les informations saisies.'
            : 'Une erreur est survenue.';
        const t = await this.toast.create({ message, duration: 3000, color: 'danger', position: 'top' });
        await t.present();
      },
    });
  }
}
