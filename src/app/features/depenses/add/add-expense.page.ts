import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { ExpenseService } from '../../../core/services/expense.service';
import { AuthService } from '../../../core/services/auth.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { DEFAULT_CATEGORIES, Categorie } from '../../../core/models/categorie.model';
import { CreateExpensePayload, SplitMode } from '../../../core/models/expense.model';
import { GroupMember } from '../../../core/models/invitation.model';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.page.html',
  styleUrls: ['./add-expense.page.scss'],
  standalone: false,
})
export class AddExpensePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly expenseService = inject(ExpenseService);
  private readonly authService = inject(AuthService);
  private readonly invitationService = inject(InvitationService);
  private readonly toast = inject(ToastController);

  readonly categories: Categorie[] = DEFAULT_CATEGORIES;

  groupId = 0;
  submitting = false;
  mode: SplitMode = 'equitable';
  // Map user id -> input value as string (montant or percentage).
  partInputs: Record<number, string> = {};
  // Order matters for UI rendering.
  beneficiaireIds: number[] = [];
  partsError: string | null = null;
  availableMembers: GroupMember[] = [];

  form: FormGroup = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    montant: [null, [Validators.required, Validators.min(0.01)]],
    date_depense: [this.todayIso(), Validators.required],
    id_categorie: [null, Validators.required],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('groupId'));
    if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
      this.router.navigate(['/tabs/groupes']);
      return;
    }
    this.groupId = id;

    // Charge la liste des membres acceptés (F7) pour permettre la sélection multi-bénéficiaires.
    // Fallback au current user uniquement si l'endpoint members échoue (sécurité défensive).
    this.invitationService.listMembers(id).subscribe({
      next: (members) => {
        this.availableMembers = members.filter((m) => m.statut_invitation === 'acceptee');
        this.beneficiaireIds = this.availableMembers.map((m) => m.id);
        this.resetPartsForMode();
      },
      error: () => {
        firstValueFrom(this.authService.user$).then((u) => {
          if (u) {
            this.beneficiaireIds = [u.id];
            this.resetPartsForMode();
          }
        });
      },
    });
  }

  toggleBeneficiaire(userId: number): void {
    const idx = this.beneficiaireIds.indexOf(userId);
    if (idx >= 0) {
      this.beneficiaireIds.splice(idx, 1);
    } else {
      // Préserve l'ordre des membres pour un rendu stable.
      const ordered = this.availableMembers.map((m) => m.id);
      this.beneficiaireIds = ordered.filter(
        (id) => this.beneficiaireIds.includes(id) || id === userId,
      );
    }
    this.resetPartsForMode();
  }

  isBeneficiaire(userId: number): boolean {
    return this.beneficiaireIds.includes(userId);
  }

  private todayIso(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  setMode(mode: SplitMode): void {
    this.mode = mode;
    this.partsError = null;
    this.resetPartsForMode();
  }

  private resetPartsForMode(): void {
    this.partInputs = {};
    if (this.mode === 'equitable') {
      return;
    }
    const n = this.beneficiaireIds.length || 1;
    const montant = Number(this.form.get('montant')?.value) || 0;
    const target = this.mode === 'pourcentage' ? 100 : montant;

    // Distribue le reliquat d'arrondi sur le dernier bénéficiaire pour garantir
    // somme exacte (ex: 100/3 = 33.33+33.33+33.34) et passer validateParts().
    const base = Math.floor((target / n) * 100) / 100;
    let assigned = 0;
    this.beneficiaireIds.forEach((id, idx) => {
      if (idx < this.beneficiaireIds.length - 1) {
        this.partInputs[id] = base.toFixed(2);
        assigned += base;
      } else {
        const last = Math.round((target - assigned) * 100) / 100;
        this.partInputs[id] = last.toFixed(2);
      }
    });
  }

  onPartChange(userId: number, value: string): void {
    this.partInputs[userId] = value;
    this.partsError = null;
  }

  beneficiaireLabel(userId: number): string {
    const member = this.availableMembers.find((m) => m.id === userId);
    return member ? `${member.prenom} ${member.nom}`.trim() : 'Membre';
  }

  private validateParts(montant: number): { ok: boolean; parts?: Record<string, string> } {
    if (this.mode === 'equitable') {
      return { ok: true };
    }

    const parts: Record<string, string> = {};
    let sum = 0;
    for (const id of this.beneficiaireIds) {
      const raw = this.partInputs[id];
      const num = Number(raw);
      if (!raw || !Number.isFinite(num) || num <= 0) {
        this.partsError = 'Toutes les parts doivent être strictement positives.';
        return { ok: false };
      }
      parts[String(id)] = num.toFixed(2);
      sum += num;
    }

    const target = this.mode === 'pourcentage' ? 100 : montant;
    if (Math.abs(sum - target) > 0.001) {
      this.partsError =
        this.mode === 'pourcentage'
          ? `La somme des pourcentages doit être 100 (actuel : ${sum.toFixed(2)}).`
          : `La somme des montants doit être ${target.toFixed(2)} (actuel : ${sum.toFixed(2)}).`;
      return { ok: false };
    }

    return { ok: true, parts };
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentUser = await firstValueFrom(this.authService.user$);
    if (!currentUser) {
      const t = await this.toast.create({
        message: 'Session expirée, veuillez vous reconnecter.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await t.present();
      return;
    }

    // Fallback ultime : si aucun bénéficiaire (échec endpoint members), retombe sur le current user
    // pour ne pas bloquer l'enregistrement d'une dépense personnelle.
    if (this.beneficiaireIds.length === 0) {
      this.beneficiaireIds = [currentUser.id];
      this.resetPartsForMode();
    }
    const beneficiaire_ids: number[] = [...this.beneficiaireIds];

    const raw = this.form.value;
    const montantNum = Number(raw.montant);
    const partsCheck = this.validateParts(montantNum);
    if (!partsCheck.ok) {
      return;
    }

    const payload: CreateExpensePayload = {
      description: raw.description,
      montant: montantNum,
      date_depense: raw.date_depense,
      id_categorie: Number(raw.id_categorie),
      beneficiaire_ids,
      mode: this.mode,
    };
    if (partsCheck.parts) {
      payload.parts = partsCheck.parts;
    }

    this.submitting = true;
    this.expenseService.create(this.groupId, payload).subscribe({
      next: async () => {
        this.submitting = false;
        const t = await this.toast.create({
          message: 'Dépense ajoutée.',
          duration: 2000,
          color: 'success',
          position: 'top',
        });
        await t.present();
        this.router.navigate(['/tabs/groupes', this.groupId], { replaceUrl: true });
      },
      error: async () => {
        this.submitting = false;
        const t = await this.toast.create({
          message: "Impossible d'enregistrer la dépense.",
          duration: 3000,
          color: 'danger',
          position: 'top',
        });
        await t.present();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/tabs/groupes', this.groupId]);
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.touched && ctrl.hasError(error));
  }
}
