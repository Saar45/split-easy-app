import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { GroupService } from '../../../core/services/group.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Group } from '../../../core/models/group.model';
import { Expense } from '../../../core/models/expense.model';
import { GroupMember } from '../../../core/models/invitation.model';

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
  private readonly expenseService = inject(ExpenseService);
  private readonly invitationService = inject(InvitationService);
  private readonly authService = inject(AuthService);
  private readonly alert = inject(AlertController);
  private readonly toast = inject(ToastController);

  group: Group | null = null;
  expenses: Expense[] = [];
  members: GroupMember[] = [];
  loading = true;
  loadingExpenses = false;
  loadingMembers = false;
  expensesError = false;
  membersError = false;
  deleting = false;
  currentUserId = 0;

  inviteEmail = '';
  inviting = false;
  lastInviteToken: string | null = null;

  private readonly amountFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

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
        this.loadExpenses(g.id);
        this.loadMembers(g.id);
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/tabs/groupes']);
      },
    });
    this.resolveCurrentUserId();
  }

  private async resolveCurrentUserId(): Promise<void> {
    let u = await firstValueFrom(this.authService.user$);
    if (!u) {
      try {
        u = await firstValueFrom(this.authService.fetchCurrentUser());
      } catch {
        u = null;
      }
    }
    this.currentUserId = u?.id ?? 0;
  }

  private loadMembers(groupId: number): void {
    this.loadingMembers = true;
    this.membersError = false;
    this.invitationService.listMembers(groupId).subscribe({
      next: (list) => {
        this.members = list;
        this.loadingMembers = false;
      },
      error: () => {
        this.loadingMembers = false;
        this.membersError = true;
      },
    });
  }

  isCreator(): boolean {
    if (this.currentUserId === 0 || this.members.length === 0) return false;
    const me = this.members.find((m) => m.id === this.currentUserId);
    return me?.role === 'createur';
  }

  acceptedMembers(): GroupMember[] {
    return this.members.filter((m) => m.statut_invitation === 'acceptee');
  }

  pendingMembers(): GroupMember[] {
    return this.members.filter((m) => m.statut_invitation === 'en_attente');
  }

  invitationUrl(): string {
    if (!this.lastInviteToken) return '';
    return `${window.location.origin}/tabs/invitations`;
  }

  async submitInvite(): Promise<void> {
    if (!this.group || !this.inviteEmail.trim() || this.inviting) return;
    const email = this.inviteEmail.trim();

    this.inviting = true;
    this.invitationService.invite(this.group.id, { email }).subscribe({
      next: async (inv) => {
        this.inviting = false;
        this.inviteEmail = '';
        this.lastInviteToken = inv.token;
        this.loadMembers(this.group!.id);
        await this.flashToast(`Invitation envoyée à ${email}.`, 'success');
      },
      error: async (err) => {
        this.inviting = false;
        const message =
          err?.status === 422
            ? 'Cet utilisateur n\'a pas de compte Split-Easy.'
            : err?.status === 409
              ? 'Cet utilisateur est déjà invité ou membre.'
              : 'Impossible d\'envoyer l\'invitation.';
        await this.flashToast(message, 'danger');
      },
    });
  }

  async copyToken(): Promise<void> {
    if (!this.lastInviteToken) return;
    try {
      await navigator.clipboard.writeText(this.lastInviteToken);
      await this.flashToast('Token copié.', 'success');
    } catch {
      await this.flashToast('Copie impossible, copiez manuellement.', 'medium');
    }
  }

  async copyUrl(): Promise<void> {
    const url = this.invitationUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      await this.flashToast('Lien copié.', 'success');
    } catch {
      await this.flashToast('Copie impossible, copiez manuellement.', 'medium');
    }
  }

  private async flashToast(message: string, color: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2500, color, position: 'top' });
    await t.present();
  }

  private loadExpenses(groupId: number): void {
    this.loadingExpenses = true;
    this.expensesError = false;
    this.expenseService.listForGroup(groupId).subscribe({
      next: (list) => {
        this.expenses = list;
        this.loadingExpenses = false;
      },
      error: () => {
        this.loadingExpenses = false;
        this.expensesError = true;
      },
    });
  }

  navigateToExpense(expense: Expense): void {
    this.router.navigate(['/tabs/depenses/detail', expense.id]);
  }

  navigateToAddExpense(): void {
    if (!this.group) return;
    this.router.navigate(['/tabs/depenses/add', this.group.id]);
  }

  navigateToBalances(): void {
    if (!this.group) return;
    this.router.navigate(['/tabs/groupes', this.group.id, 'balances']);
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

  formatAmount(n: number): string {
    return this.amountFormatter.format(n);
  }

  goBack(): void {
    this.router.navigate(['/tabs/groupes']);
  }
}
