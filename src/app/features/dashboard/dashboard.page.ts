import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificationService } from '../../core/services/notification.service';
import { DashboardSummary } from '../../core/models/dashboard.model';

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

  prenom = '';
  summary: DashboardSummary | null = null;
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
    const user = await firstValueFrom(this.authService.user$);
    this.prenom = user?.prenom ?? '';
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

  formatAmount(s: string): string {
    const value = parseFloat(s);
    return isNaN(value) ? s : this.formatter.format(value);
  }

  isNegative(s: string): boolean {
    return parseFloat(s) < 0;
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
  }
}
