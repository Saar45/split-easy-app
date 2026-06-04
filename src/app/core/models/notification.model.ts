export type NotificationType =
  | 'invitation_recue'
  | 'invitation_acceptee'
  | 'invitation_refusee'
  | 'depense_ajoutee'
  | 'remboursement_propose'
  | 'remboursement_accepte'
  | 'remboursement_rejete'
  | 'remboursement_annule';

export interface AppNotification {
  id: number;
  type: NotificationType;
  titre: string;
  message: string;
  lue: boolean;
  date_creation: string;
  date_lecture: string | null;
  reference_type: string | null;
  reference_id: number | null;
}

export interface UnreadCountResponse {
  count: number;
}

export interface ReadAllResponse {
  updated: number;
}
