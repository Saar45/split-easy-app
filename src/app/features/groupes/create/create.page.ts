import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';

import { GroupService } from '../../../core/services/group.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: false,
})
export class CreateGroupPage {
  private readonly fb = inject(FormBuilder);
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastController);

  readonly form: FormGroup = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(255)]],
    couleur: ['', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
  });

  submitting = false;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const raw = this.form.getRawValue();
    const payload = {
      nom: raw.nom,
      ...(raw.description ? { description: raw.description } : {}),
      ...(raw.couleur ? { couleur: raw.couleur } : {}),
    };

    this.groupService.create(payload).pipe(
      finalize(() => (this.submitting = false)),
    ).subscribe({
      next: () => this.router.navigate(['/tabs/groupes'], { replaceUrl: true }),
      error: (err) => this.handleError(err.status),
    });
  }

  goBack(): void {
    this.router.navigate(['/tabs/groupes']);
  }

  private async handleError(status: number): Promise<void> {
    const message = status === 422
      ? 'Données invalides. Vérifiez le formulaire.'
      : 'Une erreur est survenue.';
    const t = await this.toast.create({ message, duration: 3000, color: 'danger', position: 'top' });
    await t.present();
  }
}
