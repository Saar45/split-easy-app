import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

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

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.auth.fetchCurrentUser().subscribe();
        this.router.navigateByUrl('/tabs/accueil', { replaceUrl: true });
      },
      error: async (err) => {
        this.submitting = false;
        const message = err.status === 401 ? 'Identifiants invalides.' : 'Une erreur est survenue.';
        const t = await this.toast.create({ message, duration: 3000, color: 'danger', position: 'top' });
        await t.present();
      },
    });
  }
}
