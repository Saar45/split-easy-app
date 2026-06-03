export interface DashboardExpense {
  id: number;
  description: string;
  montant: string;
  date_depense: string;
  groupe: { id: number; nom: string };
  payeur: { id: number; prenom: string };
}

export interface DashboardSummary {
  solde_net: string;
  total_du: string;
  total_a_recevoir: string;
  dernieres_depenses: DashboardExpense[];
  invitations_en_attente: number;
}
