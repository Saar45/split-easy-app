export interface UserRef {
  id: number;
  prenom: string;
  nom: string;
}

export interface Solde {
  user: UserRef;
  // String décimal "12.34" pour préserver la précision bcmath côté backend.
  balance: string;
}

export interface RemboursementSuggestion {
  from: UserRef;
  to: UserRef;
  montant: string;
}

export interface GroupBalances {
  soldes: Solde[];
  remboursements: RemboursementSuggestion[];
}
