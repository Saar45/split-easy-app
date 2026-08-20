import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';

import { GroupService } from '../../core/services/group.service';
import { BalanceService } from '../../core/services/balance.service';
import { AuthService } from '../../core/services/auth.service';
import { Group } from '../../core/models/group.model';
import { GroupBalances, UserRef } from '../../core/models/balance.model';

export interface GroupCardOverview {
  group: Group;
  // null quand le solde n'a pas pu être chargé : le pied de carte est masqué, jamais inventé.
  membres: UserRef[] | null;
  soldePerso: string | null;
}

@Component({
  selector: 'app-groupes',
  templateUrl: './groupes.page.html',
  styleUrls: ['./groupes.page.scss'],
  standalone: false,
})
export class GroupesPage {
  private readonly groupService = inject(GroupService);
  private readonly balanceService = inject(BalanceService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  groups: Group[] = [];
  overviews: GroupCardOverview[] = [];
  loading = true;
  loadError = false;
  private currentUserId = 0;

  private readonly amountFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

  ionViewWillEnter(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.loadError = false;
    this.groupService.list().subscribe({
      next: async (groups) => {
        this.groups = groups;
        await this.resolveCurrentUserId();
        this.loading = false;
        this.loadOverviews(groups);
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      },
    });
  }

  private async resolveCurrentUserId(): Promise<void> {
    let user = await firstValueFrom(this.authService.user$);
    if (!user) {
      try {
        user = await firstValueFrom(this.authService.fetchCurrentUser());
      } catch {
        user = null;
      }
    }
    this.currentUserId = user?.id ?? 0;
  }

  // Charge le solde de chaque groupe pour le pied de carte (avatars + solde personnel).
  // Echec silencieux par groupe : la carte s'affiche sans pied plutôt que d'inventer une donnée.
  private loadOverviews(groups: Group[]): void {
    if (groups.length === 0) {
      this.overviews = [];
      return;
    }
    forkJoin(
      groups.map((g) =>
        this.balanceService.getForGroup(g.id).pipe(catchError(() => of<GroupBalances | null>(null))),
      ),
    ).subscribe((balances) => {
      this.overviews = groups.map((group, i) => this.toOverview(group, balances[i]));
    });
  }

  private toOverview(group: Group, balances: GroupBalances | null): GroupCardOverview {
    if (!balances) {
      return { group, membres: null, soldePerso: null };
    }
    const mine = balances.soldes.find((s) => s.user.id === this.currentUserId);
    return {
      group,
      membres: balances.soldes.map((s) => s.user),
      soldePerso: mine?.balance ?? null,
    };
  }

  overviewFor(group: Group): GroupCardOverview | undefined {
    return this.overviews.find((o) => o.group.id === group.id);
  }

  formatAmount(s: string): string {
    const value = parseFloat(s);
    return isNaN(value) ? s : this.amountFormatter.format(value);
  }

  isNegative(s: string): boolean {
    return parseFloat(s) < 0;
  }

  isPositive(s: string): boolean {
    return parseFloat(s) > 0;
  }

  // Solde personnel formaté avec signe explicite ('− 86,00 €' / '+ 210,50 €' / 'À jour').
  soldeLabel(s: string): string {
    const value = parseFloat(s);
    if (isNaN(value) || value === 0) {
      return 'À jour';
    }
    const formatted = this.amountFormatter.format(Math.abs(value));
    return value < 0 ? `− ${formatted}` : `+ ${formatted}`;
  }

  initialOf(name: string): string {
    return name.trim().charAt(0).toUpperCase() || '?';
  }

  // Le statut brut de l'API ('actif', 'cloture') est title-case pour l'affichage uniquement.
  titleCase(statut: string): string {
    return statut.length === 0 ? statut : statut.charAt(0).toUpperCase() + statut.slice(1);
  }

  statutBadgeClass(statut: string): string {
    return statut.toLowerCase() === 'actif' ? 'badge--success' : 'badge--neutral';
  }

  goToCreate(): void {
    this.router.navigate(['/tabs/groupes/create']);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/tabs/groupes', id]);
  }
}
