import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize, switchMap } from 'rxjs';

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
  showPassword = false;

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.form.getRawValue();

    this.auth.register(payload).pipe(
      switchMap(() => this.auth.login({ email: payload.email, motDePasse: payload.motDePasse })),
      switchMap(() => this.auth.fetchCurrentUser()),
      finalize(() => (this.submitting = false)),
    ).subscribe({
      next: () => this.router.navigateByUrl('/tabs/accueil', { replaceUrl: true }),
      error: (err) => this.showError(this.messageFor(err.status)),
    });
  }

  private messageFor(status: number): string {
    if (status === 409) {
      return 'Un compte existe déjà avec cet email.';
    }
    if (status === 422) {
      return 'Vérifiez les informations saisies.';
    }
    return 'Une erreur est survenue.';
  }

  private async showError(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 3000, color: 'danger', position: 'top' });
    await t.present();
  }
}
