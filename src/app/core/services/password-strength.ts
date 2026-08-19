export type PasswordStrengthLevel = 'faible' | 'moyen' | 'fort';

export interface PasswordStrength {
  score: number;
  level: PasswordStrengthLevel;
  label: string;
}

const SPECIAL_CHAR_PATTERN = /[^A-Za-z0-9]/;

// Score sur 4 criteres independants : longueur, casse mixte, chiffre, caractere special.
// Affichage uniquement, ne remplace jamais les validators du formulaire.
export function computePasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  }
  if (/\d/.test(password)) {
    score += 1;
  }
  if (SPECIAL_CHAR_PATTERN.test(password)) {
    score += 1;
  }

  if (score <= 1) {
    return { score, level: 'faible', label: 'Faible' };
  }
  if (score === 2) {
    return { score, level: 'moyen', label: 'Moyen' };
  }
  return { score, level: 'fort', label: 'Fort' };
}
