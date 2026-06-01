import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

import { GroupService } from '../../../core/services/group.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { Group } from '../../../core/models/group.model';
import { Expense } from '../../../core/models/expense.model';

@Component({
  selector: 'app-detail-group',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: false,
})
export class DetailGroupPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);
  private readonly expenseService = inject(ExpenseService);
  private readonly alert = inject(AlertController);
  private readonly toast = inject(ToastController);

  group: Group | null = null;
  expenses: Expense[] = [];
  loading = true;
  loadingExpenses = false;
  expensesError = false;
  deleting = false;

  private readonly amountFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
      this.navigateBackWithToast('Identifiant de groupe invalide.');
      return;
    }
    this.groupService.show(id).subscribe({
      next: (g) => {
        this.group = g;
        this.loading = false;
        this.loadExpenses(g.id);
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/tabs/groupes']);
      },
    });
  }

  private loadExpenses(groupId: number): void {
    this.loadingExpenses = true;
    this.expensesError = false;
    this.expenseService.listForGroup(groupId).subscribe({
      next: (list) => {
        this.expenses = list;
        this.loadingExpenses = false;
      },
      error: () => {
        this.loadingExpenses = false;
        this.expensesError = true;
      },
    });
  }

  navigateToExpense(expense: Expense): void {
    this.router.navigate(['/tabs/depenses/detail', expense.id]);
  }

  navigateToAddExpense(): void {
    if (!this.group) return;
    this.router.navigate(['/tabs/depenses/add', this.group.id]);
  }

  navigateToBalances(): void {
    if (!this.group) return;
    this.router.navigate(['/tabs/groupes', this.group.id, 'balances']);
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

  async confirmDelete(): Promise<void> {
    const a = await this.alert.create({
      header: 'Supprimer le groupe',
      message: 'Cette action est irréversible.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => this.deleteGroup(),
        },
      ],
    });
    await a.present();
  }

  private deleteGroup(): void {
    if (!this.group) return;
    this.deleting = true;
    this.groupService.remove(this.group.id).subscribe({
      next: () => this.router.navigate(['/tabs/groupes'], { replaceUrl: true }),
      error: async () => {
        this.deleting = false;
        const t = await this.toast.create({
          message: 'Impossible de supprimer ce groupe.',
          duration: 3000,
          color: 'danger',
          position: 'top',
        });
        await t.present();
      },
    });
  }

  formatAmount(n: number): string {
    return this.amountFormatter.format(n);
  }

  goBack(): void {
    this.router.navigate(['/tabs/groupes']);
  }
}
