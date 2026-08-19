import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize, switchMap } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastController);

  readonly form: FormGroup = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required],
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

    this.auth.login(this.form.getRawValue()).pipe(
      switchMap(() => this.auth.fetchCurrentUser()),
      finalize(() => (this.submitting = false)),
    ).subscribe({
      next: () => this.router.navigateByUrl('/tabs/accueil', { replaceUrl: true }),
      error: (err) => this.showError(this.messageFor(err.status)),
    });
  }

  private messageFor(status: number): string {
    if (status === 401) {
      return 'Identifiants invalides.';
    }
    if (status === 429) {
      return 'Trop de tentatives. Réessayez dans 15 minutes.';
    }
    return 'Une erreur est survenue.';
  }

  private async showError(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 3000, color: 'danger', position: 'top' });
    await t.present();
  }
}
