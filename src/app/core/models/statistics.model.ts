export type Period = 'semaine' | 'mois' | 'annee';

export interface CategorieBreakdown {
  id: number;
  nom: string;
  couleur: string | null;
  montant: string;
  pourcentage: string;
}

export interface CategoriePrincipale {
  id: number;
  nom: string;
  couleur: string | null;
  montant: string;
}

export interface EvolutionPoint {
  date: string;
  montant: string;
}

export interface StatisticsResponse {
  periode: Period;
  date_debut: string;
  date_fin: string;
  total_depense: string;
  moyenne_par_jour: string;
  categorie_principale: CategoriePrincipale | null;
  par_categorie: CategorieBreakdown[];
  evolution: EvolutionPoint[];
}
