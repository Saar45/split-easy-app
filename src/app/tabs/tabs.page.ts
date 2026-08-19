import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { GroupService } from '../core/services/group.service';
import { Group } from '../core/models/group.model';
import { Observable, shareReplay } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit, OnDestroy {
  private readonly actionSheetCtrl = inject(ActionSheetController);
  private readonly toastCtrl = inject(ToastController);
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);

  private groups$!: Observable<Group[]>;

  // Bascule tab bar mobile / rail latéral desktop (dossier §V.10, > 992px).
  tabLayout: 'icon-top' | 'icon-start' = 'icon-top';
  private readonly desktopQuery = window.matchMedia('(min-width: 992px)');
  private readonly onDesktopChange = (): void => {
    this.tabLayout = this.desktopQuery.matches ? 'icon-start' : 'icon-top';
  };

  ngOnInit(): void {
    this.groups$ = this.groupService.list().pipe(shareReplay(1));
    this.onDesktopChange();
    this.desktopQuery.addEventListener('change', this.onDesktopChange);
  }

  ngOnDestroy(): void {
    this.desktopQuery.removeEventListener('change', this.onDesktopChange);
  }

  openQuickAdd(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.groups$.pipe(take(1)).subscribe((groups) => {
      this.presentActionSheet(groups);
    });
  }

  private async presentActionSheet(groups: Group[]): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Que souhaitez-vous faire ?',
      buttons: [
        {
          text: 'Nouvelle dépense',
          icon: 'receipt-outline',
          handler: () => this.handleNewExpense(groups),
        },
        {
          text: 'Nouveau groupe',
          icon: 'people-outline',
          handler: () => {
            this.router.navigate(['/tabs/groupes/create']);
          },
        },
        {
          text: 'Proposer un remboursement',
          icon: 'cash-outline',
          handler: () => this.handleNewReimbursement(groups),
        },
        {
          text: 'Annuler',
          role: 'cancel',
          icon: 'close-outline',
        },
      ],
    });
    await sheet.present();
  }

  private handleNewExpense(groups: Group[]): void {
    if (groups.length === 0) {
      this.showToast('Crée d\'abord un groupe');
      this.router.navigate(['/tabs/groupes']);
    } else if (groups.length === 1) {
      this.router.navigate(['/tabs/depenses/add', groups[0].id]);
    } else {
      this.showToast('Choisis un groupe puis touche \'+ Ajouter une dépense\'');
      this.router.navigate(['/tabs/groupes']);
    }
  }

  private handleNewReimbursement(groups: Group[]): void {
    if (groups.length === 0) {
      this.showToast('Crée d\'abord un groupe');
      this.router.navigate(['/tabs/groupes']);
    } else {
      this.router.navigate(['/tabs/remboursements']);
    }
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'warning',
    });
    await toast.present();
  }
}
