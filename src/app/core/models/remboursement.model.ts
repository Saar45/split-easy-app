import { UserRef } from './balance.model';

export type StatutRemboursement = 'en_attente' | 'propose' | 'valide' | 'conteste' | 'annule';

export interface Remboursement {
  id: number;
  groupe_id: number;
  montant: string;
  statut: StatutRemboursement;
  date_creation: string;
  date_proposition: string | null;
  date_validation: string | null;
  debiteur: UserRef;
  crediteur: UserRef;
}

export interface CreateRemboursementPayload {
  id_crediteur: number;
  montant: number;
}
