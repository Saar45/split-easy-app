export interface Group {
  id: number;
  nom: string;
  description?: string;
  couleur?: string;
  statut: string;
  date_creation: string;
}

export interface CreateGroupPayload {
  nom: string;
  description?: string;
  couleur?: string;
}
