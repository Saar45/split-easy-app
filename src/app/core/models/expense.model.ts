export interface BeneficiairePart {
  id: number;
  prenom: string;
  nom: string;
  montant_part: number;
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

export interface CreateExpensePayload {
  description: string;
  montant: number;
  date_depense: string;
  id_categorie: number;
  beneficiaire_ids: number[];
}
