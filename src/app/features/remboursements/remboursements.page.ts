import { Component, inject, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { RemboursementService } from '../../core/services/remboursement.service';
import { AuthService } from '../../core/services/auth.service';
import { Remboursement } from '../../core/models/remboursement.model';

@Component({
  selector: 'app-remboursements',
  templateUrl: './remboursements.page.html',
  styleUrls: ['./remboursements.page.scss'],
  standalone: false,
})
export class RemboursementsPage implements OnInit {
  private readonly service = inject(RemboursementService);
  private readonly authService = inject(AuthService);
  private readonly alert = inject(AlertController);
  private readonly toast = inject(ToastController);

  loading = true;
  hasError = false;
  list: Remboursement[] = [];
  currentUserId = 0;
  tab: 'en_cours' | 'historique' = 'en_cours';

  private readonly amountFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

  async ngOnInit(): Promise<void> {
    const u = await firstValueFrom(this.authService.user$);
    this.currentUserId = u?.id ?? 0;
    this.load();
  }

  ionViewWillEnter(): void {
    if (this.currentUserId > 0) {
      this.load();
    }
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
        this.loading = false;
        this.hasError = true;
      },
    });
  }

  setTab(t: 'en_cours' | 'historique'): void {
    this.tab = t;
  }

  filtered(): Remboursement[] {
    if (this.tab === 'en_cours') {
      return this.list.filter((r) => r.statut === 'propose');
    }
    return this.list.filter((r) => r.statut !== 'propose');
  }

  isDebtor(rb: Remboursement): boolean {
    return rb.debiteur.id === this.currentUserId;
  }

  isCreditor(rb: Remboursement): boolean {
    return rb.crediteur.id === this.currentUserId;
  }

  formatAmount(value: string): string {
    const n = Number(value);
    return this.amountFormatter.format(Number.isFinite(n) ? n : 0);
  }

  fullName(u: { prenom: string; nom: string }): string {
    return `${u.prenom} ${u.nom}`.trim();
  }

  statutLabel(s: string): string {
    return ({
      propose: 'Proposé',
      valide: 'Validé',
      conteste: 'Refusé',
      annule: 'Annulé',
      en_attente: 'En attente',
    } as Record<string, string>)[s] ?? s;
  }

  async confirmAccept(rb: Remboursement): Promise<void> {
    const a = await this.alert.create({
      header: 'Accepter ce remboursement',
      message: `Confirmer la réception de ${this.formatAmount(rb.montant)} de ${this.fullName(rb.debiteur)} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Accepter', role: 'confirm', handler: () => this.doAccept(rb) },
      ],
    });
    await a.present();
  }

  private doAccept(rb: Remboursement): void {
    this.service.accept(rb.id).subscribe({
      next: async () => {
        await this.flashToast('Remboursement accepté.', 'success');
        this.load();
      },
      error: async () => this.flashToast('Action impossible.', 'danger'),
    });
  }

  async confirmReject(rb: Remboursement): Promise<void> {
    const a = await this.alert.create({
      header: 'Refuser ce remboursement',
      message: `Refuser ${this.formatAmount(rb.montant)} de ${this.fullName(rb.debiteur)} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Refuser', role: 'destructive', handler: () => this.doReject(rb) },
      ],
    });
    await a.present();
  }

  private doReject(rb: Remboursement): void {
    this.service.reject(rb.id).subscribe({
      next: async () => {
        await this.flashToast('Remboursement refusé.', 'medium');
        this.load();
      },
      error: async () => this.flashToast('Action impossible.', 'danger'),
    });
  }

  async confirmCancel(rb: Remboursement): Promise<void> {
    const a = await this.alert.create({
      header: 'Annuler ce remboursement',
      message: `Annuler votre proposition de ${this.formatAmount(rb.montant)} vers ${this.fullName(rb.crediteur)} ?`,
      buttons: [
        { text: 'Garder', role: 'cancel' },
        { text: 'Annuler', role: 'destructive', handler: () => this.doCancel(rb) },
      ],
    });
    await a.present();
  }

  private doCancel(rb: Remboursement): void {
    this.service.cancel(rb.id).subscribe({
      next: async () => {
        await this.flashToast('Remboursement annulé.', 'medium');
        this.load();
      },
      error: async () => this.flashToast('Action impossible.', 'danger'),
    });
  }

  private async flashToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2500, color, position: 'top' });
    await t.present();
  }
}
