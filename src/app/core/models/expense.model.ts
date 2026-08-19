export type SplitMode = 'equitable' | 'personnalisee' | 'pourcentage';

export interface BeneficiairePart {
  id: number;
  prenom: string;
  nom: string;
  montant_part: number;
  pourcentage?: string | null;
}

export interface Expense {
  id: number;
  description: string;
  montant: number;
  date_depense: string;
  date_creation: string;
  type_repartition: string;
  categorie: { id: number; libelle: string };
  payeur: { id: number; prenom: string; nom: string };
  groupe_id: number;
  beneficiaires?: BeneficiairePart[];
}

export interface TicketScanResult {
  montant: string | null;
  date: string | null;
  commercant: string | null;
  texteBrut: string;
}

export interface CreateExpensePayload {
  description: string;
  montant: number;
  date_depense: string;
  id_categorie: number;
  beneficiaire_ids: number[];
  mode?: SplitMode;
  // Map { user_id_string: amount_or_percentage_string }
  parts?: Record<string, string>;
}
