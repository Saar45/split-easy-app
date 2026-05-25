import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { ExpenseService } from '../../../core/services/expense.service';
import { AuthService } from '../../../core/services/auth.service';
import { DEFAULT_CATEGORIES, Categorie } from '../../../core/models/categorie.model';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.page.html',
  styleUrls: ['./add-expense.page.scss'],
  standalone: false,
})
export class AddExpensePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly expenseService = inject(ExpenseService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastController);

  readonly categories: Categorie[] = DEFAULT_CATEGORIES;

  groupId = 0;
  submitting = false;

  form: FormGroup = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    montant: [null, [Validators.required, Validators.min(0.01)]],
    date_depense: [this.todayIso(), Validators.required],
    id_categorie: [null, Validators.required],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('groupId'));
    if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
      this.router.navigate(['/tabs/groupes']);
      return;
    }
    this.groupId = id;
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentUser = this.authService['currentUser$'].value as { id: number } | null;
    const beneficiaire_ids: number[] = currentUser ? [currentUser.id] : [];

    this.submitting = true;
    const raw = this.form.value;
    this.expenseService
      .create(this.groupId, {
        description: raw.description,
        montant: Number(raw.montant),
        date_depense: raw.date_depense,
        id_categorie: Number(raw.id_categorie),
        beneficiaire_ids,
      })
      .subscribe({
        next: async (expense) => {
          this.submitting = false;
          const t = await this.toast.create({
            message: 'Dépense ajoutée.',
            duration: 2000,
            color: 'success',
            position: 'top',
          });
          await t.present();
          this.router.navigate(['/tabs/groupes', this.groupId], { replaceUrl: true });
        },
        error: async () => {
          this.submitting = false;
          const t = await this.toast.create({
            message: 'Impossible d\'enregistrer la dépense.',
            duration: 3000,
            color: 'danger',
            position: 'top',
          });
          await t.present();
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/tabs/groupes', this.groupId]);
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.touched && ctrl.hasError(error));
  }
}
