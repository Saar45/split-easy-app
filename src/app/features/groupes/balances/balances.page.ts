import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { BalanceService } from '../../../core/services/balance.service';
import { RemboursementService } from '../../../core/services/remboursement.service';
import { AuthService } from '../../../core/services/auth.service';
import { GroupBalances, RemboursementSuggestion, UserRef } from '../../../core/models/balance.model';
import { Remboursement } from '../../../core/models/remboursement.model';
import { computeSettlementStats, SettlementStats } from '../../../core/services/settlement-stats';

const PENDING_STATUTS = ['en_attente', 'propose'];
const MAX_HISTORY = 3;

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
  // Comparaison avant/après du plan greedy (null = non calculable, carte masquée).
  stats: SettlementStats | null = null;
  lastValidated: Remboursement[] = [];
  private pendingRemboursements: Remboursement[] = [];

  private readonly amountFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

  private readonly shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  });

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
      this.router.navigate(['/tabs/groupes']);
      return;
    }
    this.groupId = id;

    let u = await firstValueFrom(this.authService.user$);
    if (!u) {
      // Fallback : si le BehaviorSubject n'a pas encore reçu le user (premier
      // chargement post-login), on déclenche un fetch explicite.
      try {
        u = await firstValueFrom(this.authService.fetchCurrentUser());
      } catch {
        u = null;
      }
    }
    this.currentUserId = u?.id ?? 0;
    this.load();
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
    this.stats = null;
    this.balanceService.getForGroup(this.groupId).subscribe({
      next: (b) => {
        this.data = b;
        this.stats = computeSettlementStats(b);
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
    this.loadRemboursements();
  }

  // Historique + propositions en cours du groupe. Échec silencieux :
  // badges et section masqués sans donnée fiable.
  private loadRemboursements(): void {
    this.remboursementService.list().subscribe({
      next: (all) => {
        const ofGroup = all.filter((r) => r.groupe_id === this.groupId);
        this.pendingRemboursements = ofGroup.filter((r) => PENDING_STATUTS.includes(r.statut));
        this.lastValidated = ofGroup
          .filter((r) => r.statut === 'valide')
          .sort((a, b) => (b.date_validation ?? '').localeCompare(a.date_validation ?? ''))
          .slice(0, MAX_HISTORY);
      },
      error: () => {
        this.pendingRemboursements = [];
        this.lastValidated = [];
      },
    });
  }

  remboursements(): RemboursementSuggestion[] {
    return this.data?.remboursements ?? [];
  }

  myDebts(): RemboursementSuggestion[] {
    return this.remboursements().filter((r) => r.from.id === this.currentUserId);
  }

  myCredits(): RemboursementSuggestion[] {
    return this.remboursements().filter((r) => r.to.id === this.currentUserId);
  }

  mySolde(): string | null {
    const mine = this.data?.soldes.find((s) => s.user.id === this.currentUserId);
    return mine?.balance ?? null;
  }

  isMyDebt(): boolean {
    return Number(this.mySolde()) < 0;
  }

  isMyCredit(): boolean {
    return Number(this.mySolde()) > 0;
  }

  isSettled(): boolean {
    return this.mySolde() !== null && !this.isMyDebt() && !this.isMyCredit();
  }

  hasPendingWith(debiteurId: number, crediteurId: number): boolean {
    return this.pendingRemboursements.some(
      (r) => r.debiteur.id === debiteurId && r.crediteur.id === crediteurId,
    );
  }

  formatAbs(value: string): string {
    const n = Math.abs(Number(value));
    return this.amountFormatter.format(Number.isFinite(n) ? n : 0);
  }

  shortDate(value: string | null): string {
    if (!value) {
      return '';
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : this.shortDateFormatter.format(d);
  }

  initialOf(name: string): string {
    return name.trim().charAt(0).toUpperCase() || '?';
  }

  fullName(u: UserRef): string {
    return `${u.prenom} ${u.nom}`.trim();
  }

  goBack(): void {
    if (this.groupId > 0) {
      this.router.navigate(['/tabs/groupes', this.groupId]);
      return;
    }
    this.router.navigate(['/tabs/groupes']);
  }
}
