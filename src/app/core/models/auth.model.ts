export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  roles: string[];
}

export interface LoginPayload {
  email: string;
  motDePasse: string;
}

export interface RegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  cguAcceptees: boolean;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  refresh_token_expiration: number;
}
