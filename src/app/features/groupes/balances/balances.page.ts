import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { BalanceService } from '../../../core/services/balance.service';
import { GroupBalances, Solde, RemboursementSuggestion } from '../../../core/models/balance.model';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.page.html',
  styleUrls: ['./balances.page.scss'],
  standalone: false,
})
export class BalancesPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly balanceService = inject(BalanceService);
  private readonly toast = inject(ToastController);

  groupId = 0;
  loading = true;
  hasError = false;
  data: GroupBalances | null = null;

  private readonly amountFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('groupId'));
    if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
      this.router.navigate(['/tabs/groupes']);
      return;
    }
    this.groupId = id;
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.hasError = false;
    this.balanceService.getForGroup(this.groupId).subscribe({
      next: (b) => {
        this.data = b;
        this.loading = false;
      },
      error: async () => {
        this.loading = false;
        this.hasError = true;
        const t = await this.toast.create({
          message: 'Impossible de charger les soldes.',
          duration: 3000,
          color: 'danger',
          position: 'top',
        });
        await t.present();
      },
    });
  }

  formatAmount(value: string): string {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      return value;
    }
    return this.amountFormatter.format(n);
  }

  formatAbs(value: string): string {
    const n = Math.abs(Number(value));
    return this.amountFormatter.format(Number.isFinite(n) ? n : 0);
  }

  // Trie créanciers en tête, puis débiteurs, puis équilibrés.
  sortedSoldes(): Solde[] {
    if (!this.data) return [];
    return [...this.data.soldes].sort((a, b) => Number(b.balance) - Number(a.balance));
  }

  remboursements(): RemboursementSuggestion[] {
    return this.data?.remboursements ?? [];
  }

  fullName(u: { prenom: string; nom: string }): string {
    return `${u.prenom} ${u.nom}`.trim();
  }

  isCreditor(s: Solde): boolean {
    return Number(s.balance) > 0;
  }

  isDebtor(s: Solde): boolean {
    return Number(s.balance) < 0;
  }

  goBack(): void {
    this.router.navigate(['/tabs/groupes', this.groupId]);
  }
}
