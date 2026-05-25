import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { ExpenseService } from '../../../core/services/expense.service';
import { Expense } from '../../../core/models/expense.model';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.page.html',
  styleUrls: ['./expense-detail.page.scss'],
  standalone: false,
})
export class ExpenseDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly expenseService = inject(ExpenseService);
  private readonly toast = inject(ToastController);

  expense: Expense | null = null;
  loading = true;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
      this.navigateBackWithToast('Identifiant de dépense invalide.');
      return;
    }
    this.expenseService.getById(id).subscribe({
      next: (e) => {
        this.expense = e;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/tabs/groupes']);
      },
    });
  }

  private async navigateBackWithToast(message: string): Promise<void> {
    const t = await this.toast.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await t.present();
    this.router.navigate(['/tabs/groupes']);
  }

  formatAmount(n: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(n);
  }

  goBack(): void {
    if (this.expense) {
      this.router.navigate(['/tabs/groupes', this.expense.groupe_id]);
    } else {
      this.router.navigate(['/tabs/groupes']);
    }
  }
}
