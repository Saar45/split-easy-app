import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models/group.model';

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
  private readonly alert = inject(AlertController);
  private readonly toast = inject(ToastController);

  group: Group | null = null;
  loading = true;
  deleting = false;

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
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/tabs/groupes']);
      },
    });
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

  goBack(): void {
    this.router.navigate(['/tabs/groupes']);
  }
}
