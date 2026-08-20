import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { GroupService } from '../../core/services/group.service';
import { UserPreferences } from '../../core/models/preferences.model';
import { APP_VERSION } from '../../core/version';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: false,
})
export class ProfilPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly groupService = inject(GroupService);
  private readonly toastCtrl = inject(ToastController);
  private readonly alertCtrl = inject(AlertController);
  private readonly router = inject(Router);

  readonly user$ = this.auth.user$;
  readonly appVersion = APP_VERSION;

  preferences: UserPreferences | null = null;
  loading = true;
  exporting = false;
  deleting = false;
  // null tant que non chargé : le pill "Membre de N groupes" reste masqué plutôt que d'afficher 0.
  groupCount: number | null = null;

  ngOnInit(): void {
    this.loadPreferences();
    this.loadGroupCount();
  }

  ionViewWillEnter(): void {
    this.loadPreferences();
  }

  // Décision d'implémentation §2a du restyle : GroupService.list() est trivial et déjà utilisé
  // partout ailleurs. Échec silencieux : le pill reste masqué plutôt que d'inventer un nombre.
  private loadGroupCount(): void {
    this.groupService.list().subscribe({
      next: (groups) => (this.groupCount = groups.length),
      error: () => (this.groupCount = null),
    });
  }

  private loadPreferences(): void {
    this.loading = true;
    this.profileService.getPreferences().subscribe({
      next: (prefs) => {
        this.preferences = prefs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  togglePreference(key: 'notifications_email' | 'notifications_push'): void {
    if (!this.preferences) return;

    const previous = { ...this.preferences };
    this.preferences = { ...this.preferences, [key]: !this.preferences[key] };

    this.profileService.updatePreferences(this.preferences).subscribe({
      error: async () => {
        this.preferences = previous;
        const toast = await this.toastCtrl.create({
          message: 'Impossible de mettre a jour les preferences.',
          duration: 3000,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
      },
    });
  }

  exportMyData(): void {
    this.exporting = true;
    this.profileService.exportMyData().subscribe({
      next: async (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'mes-donnees-spliteasy.json';
        anchor.click();
        URL.revokeObjectURL(url);
        this.exporting = false;

        const toast = await this.toastCtrl.create({
          message: 'Vos donnees ont ete telechargees.',
          duration: 2500,
          color: 'success',
          position: 'bottom',
        });
        await toast.present();
      },
      error: async () => {
        this.exporting = false;
        const toast = await this.toastCtrl.create({
          message: "Impossible d'exporter vos donnees.",
          duration: 3000,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
      },
    });
  }

  async confirmDeleteAccount(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer le compte',
      message: 'Etes-vous sur ? Cette action est irreversible.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          cssClass: 'alert-button-danger',
          handler: () => this.deleteAccount(),
        },
      ],
    });
    await alert.present();
  }

  private deleteAccount(): void {
    this.deleting = true;
    this.profileService.deleteAccount().subscribe({
      next: () => {
        this.deleting = false;
        this.auth.logout();
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      },
      error: async (err) => {
        this.deleting = false;
        const isConflict = err?.status === 409;
        const message = isConflict
          ? 'Vous etes createur de groupes actifs. Transferez ou supprimez-les avant de fermer votre compte.'
          : 'Une erreur est survenue. Veuillez reessayer.';
        const toast = await this.toastCtrl.create({
          message,
          duration: 4000,
          color: isConflict ? 'warning' : 'danger',
          position: 'bottom',
        });
        await toast.present();
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }

  getInitials(prenom: string, nom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  showComingSoon(): void {
    this.toastCtrl.create({
      message: 'Bientot disponible.',
      duration: 2000,
      color: 'medium',
      position: 'bottom',
    }).then((toast) => toast.present());
  }
}
