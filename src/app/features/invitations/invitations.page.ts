import { Component, inject, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

import { InvitationService } from '../../core/services/invitation.service';
import { Invitation } from '../../core/models/invitation.model';

@Component({
  selector: 'app-invitations',
  templateUrl: './invitations.page.html',
  styleUrls: ['./invitations.page.scss'],
  standalone: false,
})
export class InvitationsPage implements OnInit {
  private readonly service = inject(InvitationService);
  private readonly alert = inject(AlertController);
  private readonly toast = inject(ToastController);

  loading = true;
  hasError = false;
  list: Invitation[] = [];

  ngOnInit(): void {
    this.load();
  }

  ionViewWillEnter(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.hasError = false;
    this.service.listMine().subscribe({
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

  fullName(u: { prenom: string; nom: string }): string {
    return `${u.prenom} ${u.nom}`.trim();
  }

  async confirmAccept(inv: Invitation): Promise<void> {
    const a = await this.alert.create({
      header: 'Rejoindre ce groupe',
      message: `Accepter l'invitation à rejoindre "${inv.groupe.nom}" ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Rejoindre', role: 'confirm', handler: () => this.doAccept(inv) },
      ],
    });
    await a.present();
  }

  private doAccept(inv: Invitation): void {
    this.service.accept(inv.token).subscribe({
      next: async () => {
        await this.flashToast(`Vous avez rejoint "${inv.groupe.nom}".`, 'success');
        this.load();
      },
      error: async (err) => {
        const message = err?.status === 410
          ? 'Cette invitation a expiré.'
          : 'Impossible d\'accepter cette invitation.';
        await this.flashToast(message, 'danger');
      },
    });
  }

  async confirmRefuse(inv: Invitation): Promise<void> {
    const a = await this.alert.create({
      header: 'Refuser cette invitation',
      message: `Refuser l'invitation à rejoindre "${inv.groupe.nom}" ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Refuser', role: 'destructive', handler: () => this.doRefuse(inv) },
      ],
    });
    await a.present();
  }

  private doRefuse(inv: Invitation): void {
    this.service.refuse(inv.token).subscribe({
      next: async () => {
        await this.flashToast('Invitation refusée.', 'medium');
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
