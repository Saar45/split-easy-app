// L'API renvoie des noms de type Font Awesome pour icone (shopping-cart, utensils, gamepad...).
// Ionicons n'a pas les memes noms : ce mapping fait le pont vers un nom Ionicons valide,
// style outline. Couvre aussi les valeurs de FALLBACK_CATEGORIES (categorie.model.ts).
const CATEGORY_ICON_MAP: Record<string, string> = {
  'shopping-cart': 'cart-outline',
  cart: 'cart-outline',
  utensils: 'restaurant-outline',
  restaurant: 'restaurant-outline',
  car: 'car-outline',
  home: 'home-outline',
  'file-text': 'receipt-outline',
  receipt: 'receipt-outline',
  gamepad: 'game-controller-outline',
  'game-controller': 'game-controller-outline',
  heart: 'heart-outline',
  medkit: 'medkit-outline',
  'more-horizontal': 'pricetags-outline',
  'ellipsis-horizontal': 'pricetags-outline',
};

const FALLBACK_ICON = 'pricetag-outline';

// Traduit un nom d'icone brut venu de l'API (ou des categories de secours) en nom Ionicons
// affichable. Retourne toujours une valeur valide, meme si icone est absent ou inconnu.
export function resolveCategoryIcon(icone: string | null | undefined): string {
  if (!icone) {
    return FALLBACK_ICON;
  }
  return CATEGORY_ICON_MAP[icone] ?? FALLBACK_ICON;
}
