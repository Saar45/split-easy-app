import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { BalanceService } from '../../../core/services/balance.service';
import { RemboursementService } from '../../../core/services/remboursement.service';
import { AuthService } from '../../../core/services/auth.service';
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
  private readonly remboursementService = inject(RemboursementService);
  private readonly authService = inject(AuthService);
  private readonly alert = inject(AlertController);
  private readonly toast = inject(ToastController);

  currentUserId = 0;

  groupId = 0;
  loading = true;
  hasError = false;
  data: GroupBalances | null = null;
  private cachedSortedSoldes: Solde[] = [];
  private cachedSortedSource: Solde[] | null = null;

  private readonly amountFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
      this.router.navigate(['/tabs/groupes']);
      return;
    }
    this.groupId = id;

    const u = await firstValueFrom(this.authService.user$);
    this.currentUserId = u?.id ?? 0;
    this.load();
  }

  // Affiche la proposition uniquement quand le current user est le débiteur suggéré.
  canPropose(r: RemboursementSuggestion): boolean {
    return r.from.id === this.currentUserId;
  }

  async confirmPropose(r: RemboursementSuggestion): Promise<void> {
    const a = await this.alert.create({
      header: 'Proposer un remboursement',
      message: `Proposer ${this.formatAbs(r.montant)} à ${this.fullName(r.to)} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Proposer', role: 'confirm', handler: () => this.doPropose(r) },
      ],
    });
    await a.present();
  }

  private doPropose(r: RemboursementSuggestion): void {
    const montant = Number(r.montant);
    if (!Number.isFinite(montant) || montant <= 0) {
      return;
    }
    this.remboursementService
      .propose(this.groupId, { id_crediteur: r.to.id, montant })
      .subscribe({
        next: async () => {
          const t = await this.toast.create({
            message: 'Remboursement proposé.',
            duration: 2500,
            color: 'success',
            position: 'top',
          });
          await t.present();
          this.router.navigate(['/tabs/remboursements']);
        },
        error: async () => {
          const t = await this.toast.create({
            message: 'Impossible de proposer ce remboursement.',
            duration: 3000,
            color: 'danger',
            position: 'top',
          });
          await t.present();
        },
      });
  }

  private load(): void {
    this.loading = true;
    this.hasError = false;
    this.data = null;
    this.cachedSortedSource = null;
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

  // Mémoïsation : ne re-trie que lorsque la référence du tableau soldes change.
  sortedSoldes(): Solde[] {
    if (!this.data) return [];
    if (this.cachedSortedSource === this.data.soldes) {
      return this.cachedSortedSoldes;
    }
    this.cachedSortedSource = this.data.soldes;
    this.cachedSortedSoldes = [...this.data.soldes].sort((a, b) => Number(b.balance) - Number(a.balance));
    return this.cachedSortedSoldes;
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
    if (this.groupId > 0) {
      this.router.navigate(['/tabs/groupes', this.groupId]);
      return;
    }
    this.router.navigate(['/tabs/groupes']);
  }
}
