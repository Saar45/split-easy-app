import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificationService } from '../../core/services/notification.service';
import { GroupService } from '../../core/services/group.service';
import { BalanceService } from '../../core/services/balance.service';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { Group } from '../../core/models/group.model';
import { GroupBalances } from '../../core/models/balance.model';

interface GroupOverview {
  group: Group;
  // null quand le solde du groupe n'a pas pu être chargé : rien n'est inventé.
  membres: number | null;
  soldePerso: string | null;
}

const MAX_GROUP_CARDS = 4;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly groupService = inject(GroupService);
  private readonly balanceService = inject(BalanceService);

  prenom = '';
  currentUserId = 0;
  summary: DashboardSummary | null = null;
  groupOverviews: GroupOverview[] = [];
  totalGroups = 0;
  loading = true;
  error = false;
  unreadCount$: Observable<number> = this.notifications.unreadCount$;

  private readonly formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  async ngOnInit(): Promise<void> {
    await this.resolveUser();
    this.loadDashboard();
    this.notifications.startPolling();
  }

  ngOnDestroy(): void {
    this.notifications.stopPolling();
  }

  ionViewWillEnter(): void {
    this.loadDashboard();
    this.notifications.refreshUnreadCount();
  }

  goToNotifications(): void {
    void this.router.navigate(['/tabs/notifications']);
  }

  goToProfil(): void {
    void this.router.navigate(['/tabs/profil']);
  }

  formatAmount(s: string): string {
    const value = parseFloat(s);
    return isNaN(value) ? s : this.formatter.format(value);
  }

  isNegative(s: string): boolean {
    return parseFloat(s) < 0;
  }

  isPositive(s: string): boolean {
    return parseFloat(s) > 0;
  }

  initialOf(name: string): string {
    return name.trim().charAt(0).toUpperCase() || '?';
  }

  quickAddExpense(): void {
    if (this.totalGroups === 1 && this.groupOverviews.length === 1) {
      void this.router.navigate(['/tabs/depenses/add', this.groupOverviews[0].group.id]);
      return;
    }
    void this.router.navigate(['/tabs/groupes']);
  }

  // Le scan OCR vit dans l'écran d'ajout : même cible que l'ajout rapide.
  quickScan(): void {
    this.quickAddExpense();
  }

  goToInvitations(): void {
    void this.router.navigate(['/tabs/invitations']);
  }

  goToExpense(id: number): void {
    void this.router.navigate(['/tabs/depenses/detail', id]);
  }

  goToGroup(id: number): void {
    void this.router.navigate(['/tabs/groupes', id]);
  }

  goToGroupes(): void {
    void this.router.navigate(['/tabs/groupes']);
  }

  private async resolveUser(): Promise<void> {
    let user = await firstValueFrom(this.authService.user$);
    if (!user) {
      try {
        user = await firstValueFrom(this.authService.fetchCurrentUser());
      } catch {
        user = null;
      }
    }
    this.prenom = user?.prenom ?? '';
    this.currentUserId = user?.id ?? 0;
  }

  private loadDashboard(): void {
    this.loading = true;
    this.error = false;
    this.dashboardService.get().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
    this.loadGroups();
  }

  private loadGroups(): void {
    this.groupService.list().subscribe({
      next: (groups) => {
        this.totalGroups = groups.length;
        const shown = groups.slice(0, MAX_GROUP_CARDS);
        if (shown.length === 0) {
          this.groupOverviews = [];
          return;
        }
        forkJoin(
          shown.map((g) =>
            this.balanceService.getForGroup(g.id).pipe(catchError(() => of<GroupBalances | null>(null))),
          ),
        ).subscribe((balances) => {
          this.groupOverviews = shown.map((group, i) => this.toOverview(group, balances[i]));
        });
      },
      error: () => {
        this.groupOverviews = [];
        this.totalGroups = 0;
      },
    });
  }

  private toOverview(group: Group, balances: GroupBalances | null): GroupOverview {
    if (!balances) {
      return { group, membres: null, soldePerso: null };
    }
    const mine = balances.soldes.find((s) => s.user.id === this.currentUserId);
    return {
      group,
      membres: balances.soldes.length,
      soldePerso: mine?.balance ?? null,
    };
  }
}
