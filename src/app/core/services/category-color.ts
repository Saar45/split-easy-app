// Couleurs de secours par nom de categorie (refonte visuelle, README section Iconographie).
// Utilisees uniquement quand Categorie.couleur est absent de la reponse API.
const CATEGORY_COLOR_MAP: Record<string, string> = {
  restaurant: '#C27B1A',
  courses: '#3B7A3E',
  transport: '#34508A',
  logement: '#8E977D',
  loyer: '#8E977D',
  loisirs: '#3B6D97',
  autre: '#9A9488',
};

const FALLBACK_COLOR = '#9A9488';

// Retourne la couleur de la categorie a partir de Categorie.couleur si presente,
// sinon une couleur de secours deduite du libelle, sinon la couleur neutre par defaut.
export function resolveCategoryColor(libelle: string | null | undefined, couleur?: string | null): string {
  if (couleur) {
    return couleur;
  }
  if (!libelle) {
    return FALLBACK_COLOR;
  }
  return CATEGORY_COLOR_MAP[libelle.trim().toLowerCase()] ?? FALLBACK_COLOR;
}
