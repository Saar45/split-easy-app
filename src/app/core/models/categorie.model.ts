export interface Categorie {
  id: number;
  libelle: string;
  icone?: string;
  couleur?: string;
}

// Hardcoded until GET /api/categories is exposed (follow-up ticket).
export const DEFAULT_CATEGORIES: Categorie[] = [
  { id: 1, libelle: 'Courses',    icone: 'cart',          couleur: '#4CAF50' },
  { id: 2, libelle: 'Restaurant', icone: 'restaurant',    couleur: '#FF9800' },
  { id: 3, libelle: 'Transport',  icone: 'car',           couleur: '#2196F3' },
  { id: 4, libelle: 'Loyer',      icone: 'home',          couleur: '#9C27B0' },
  { id: 5, libelle: 'Factures',   icone: 'receipt',       couleur: '#F44336' },
  { id: 6, libelle: 'Loisirs',    icone: 'game-controller', couleur: '#00BCD4' },
  { id: 7, libelle: 'Sante',      icone: 'medkit',        couleur: '#E91E63' },
  { id: 8, libelle: 'Autre',      icone: 'ellipsis-horizontal', couleur: '#607D8B' },
];
