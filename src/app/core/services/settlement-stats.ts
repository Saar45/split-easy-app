import { GroupBalances } from '../models/balance.model';

export interface SettlementStats {
  // Paires débiteur -> créancier non nulles avant optimisation.
  before: number;
  // Taille du plan optimisé retourné par l'API (algorithme greedy F5).
  after: number;
  reduced: boolean;
}

// Tolérance d'arrondi sur les soldes décimaux ("0.00" vs "-0.001").
const EPSILON = 0.005;

// Compare le règlement naïf (chaque débiteur rembourse chaque créancier)
// au plan optimisé. Retourne null quand la comparaison n'est pas calculable
// à partir des données réelles : aucune valeur n'est inventée.
export function computeSettlementStats(data: GroupBalances | null): SettlementStats | null {
  if (!data) {
    return null;
  }
  const after = data.remboursements.length;
  if (after === 0) {
    return null;
  }
  const debtors = data.soldes.filter((s) => Number(s.balance) < -EPSILON).length;
  const creditors = data.soldes.filter((s) => Number(s.balance) > EPSILON).length;
  const before = debtors * creditors;
  if (before === 0) {
    return null;
  }
  return { before, after, reduced: before > after };
}
