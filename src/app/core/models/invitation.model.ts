export type StatutInvitation = 'en_attente' | 'acceptee' | 'refusee' | 'expiree';
export type RoleAppartenir = 'createur' | 'membre';

export interface Invitation {
  token: string;
  statut_invitation: StatutInvitation;
  role: RoleAppartenir;
  date_invitation: string;
  date_expiration: string | null;
  date_acceptation: string | null;
  date_adhesion: string | null;
  groupe: {
    id: number;
    nom: string;
    couleur: string | null;
  };
  utilisateur: {
    id: number;
    prenom: string;
    nom: string;
    email: string;
  };
}

export interface CreateInvitationPayload {
  email: string;
}

export interface GroupMember {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: RoleAppartenir;
  statut_invitation: StatutInvitation;
  date_adhesion: string | null;
}
