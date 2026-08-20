import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { NotificationService } from '../../core/services/notification.service';
import { AppNotification, NotificationType } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: false,
})
export class NotificationsPage implements OnInit {
  private readonly service = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastController);

  loading = true;
  hasError = false;
  list: AppNotification[] = [];

  ngOnInit(): void {
    this.load();
  }

  ionViewWillEnter(): void {
    this.load();
  }

  doRefresh(event: CustomEvent): void {
    this.service.list().subscribe({
      next: (l) => {
        this.list = l;
        (event.target as HTMLIonRefresherElement).complete();
      },
      error: () => (event.target as HTMLIonRefresherElement).complete(),
    });
  }

  iconFor(type: NotificationType): string {
    switch (type) {
      case 'invitation_recue':
      case 'invitation_acceptee':
      case 'invitation_refusee':
        return 'mail-outline';
      case 'depense_ajoutee':
        return 'cash-outline';
      case 'remboursement_propose':
        return 'swap-horizontal-outline';
      case 'remboursement_accepte':
        return 'checkmark-circle-outline';
      case 'remboursement_rejete':
        return 'close-circle-outline';
      case 'remboursement_annule':
        return 'remove-circle-outline';
      default:
        return 'notifications-outline';
    }
  }

  // Teinte de la tuile d'icône par type (README §11) : classe utilitaire locale.
  colorFor(type: NotificationType): string {
    switch (type) {
      case 'invitation_recue':
      case 'invitation_acceptee':
      case 'invitation_refusee':
        return 'notif-icon--navy';
      case 'depense_ajoutee':
        return 'notif-icon--warning';
      case 'remboursement_propose':
        return 'notif-icon--navy';
      case 'remboursement_accepte':
        return 'notif-icon--success';
      case 'remboursement_rejete':
      case 'remboursement_annule':
        return 'notif-icon--error';
      default:
        return 'notif-icon--sage';
    }
  }

  relativeDate(iso: string): string {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) {
      return 'à l\'instant';
    }
    if (diffMin < 60) {
      return `il y a ${diffMin}min`;
    }
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) {
      return `il y a ${diffH}h`;
    }
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) {
      return `il y a ${diffD}j`;
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  onTap(notif: AppNotification): void {
    if (!notif.lue) {
      this.service.markAsRead(notif.id).subscribe({
        next: () => {
          notif.lue = true;
          notif.date_lecture = new Date().toISOString();
        },
        error: () => undefined,
      });
    }
    this.navigateToReference(notif);
  }

  async markAll(): Promise<void> {
    this.service.markAllAsRead().subscribe({
      next: async (res) => {
        this.list = this.list.map((n) => ({ ...n, lue: true, date_lecture: n.date_lecture ?? new Date().toISOString() }));
        const t = await this.toast.create({
          message: `${res.updated} notification(s) marquée(s) comme lue(s).`,
          duration: 3000,
          color: 'success',
          position: 'top',
        });
        await t.present();
      },
      error: async () => {
        const t = await this.toast.create({
          message: 'Action impossible.',
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
    this.service.list().subscribe({
      next: (l) => {
        this.list = l;
        this.loading = false;
      },
      error: () => {
        this.hasError = true;
        this.loading = false;
      },
    });
  }

  private navigateToReference(notif: AppNotification): void {
    if (notif.reference_type === null || notif.reference_id === null) {
      return;
    }
    switch (notif.reference_type) {
      case 'appartenir':
        void this.router.navigate(['/tabs/invitations']);
        return;
      case 'depense':
        void this.router.navigate(['/tabs/depenses/detail', notif.reference_id]);
        return;
      case 'remboursement':
        void this.router.navigate(['/tabs/remboursements']);
        return;
    }
  }
}
