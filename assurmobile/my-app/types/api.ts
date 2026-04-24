export type SessionStatus = 'loading' | 'signed_out' | 'challenge' | 'authenticated';

export type RoleName =
  | 'ADMIN'
  | 'GESTIONNAIRE'
  | 'CHARGE_SUIVI'
  | 'CHARGE_CLIENTELE'
  | 'ASSURE';

export interface ApiEnvelope<T> {
  message?: string;
  data: T;
}

export interface AuthChallenge {
  utilisateur_id: number;
  challenge: '2fa_required';
}

export interface AuthSuccess {
  utilisateur_id: number;
  email?: string;
  role_id?: number;
  token: string;
}

export interface RegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  mot_de_passe: string;
  role_nom: RoleName | string;
  double_auth_active?: boolean;
}

export interface User {
  id: number;
  role_id: number;
  role_nom?: RoleName | string | null;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  statut: string;
  double_auth_active: boolean;
}

export interface Contrat {
  id: number;
  assure_id?: number;
  numero_contrat?: string;
  type_contrat?: string;
  franchise?: number;
  statut?: string;
  assure?: Assure | null;
}

export interface ContratPayload {
  assure_id: number;
  numero_contrat: string;
  type_contrat: string;
  franchise?: number | null;
  date_debut?: string | null;
  date_fin?: string | null;
  statut?: string | null;
}

export interface Vehicule {
  id: number;
  contrat_id?: number;
  immatriculation: string;
  marque?: string;
  modele?: string;
  valeur_argus?: number;
  contrat?: Contrat | null;
}

export interface VehiculePayload {
  contrat_id: number;
  immatriculation: string;
  marque?: string | null;
  modele?: string | null;
  valeur_argus?: number | null;
}

export interface Assure {
  id: number;
  utilisateur_id?: number | null;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  type_assure: string;
  utilisateur?: User | null;
}

export interface AssurePayload {
  utilisateur_id?: number | null;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  type_assure: string;
}

export interface Sinistre {
  id: number;
  contrat_id?: number;
  vehicule_id?: number;
  cree_par?: number;
  date_heure_appel: string;
  date_heure_sinistre: string;
  conducteur_nom: string;
  conducteur_prenom: string;
  conducteur_est_assure: boolean;
  contexte: string;
  responsabilite_engagee: boolean;
  pourcentage_responsabilite: number;
  statut: string;
  contrat?: Contrat;
  vehicule?: Vehicule;
  createur?: User;
  dossier?: {
    id: number;
    numero_dossier: string;
    statut: string;
    scenario: string;
  } | null;
  documents?: DocumentItem[];
}

export interface SinistrePayload {
  contrat_id: number;
  vehicule_id: number;
  cree_par: number;
  date_heure_appel: string;
  date_heure_sinistre: string;
  conducteur_nom: string;
  conducteur_prenom: string;
  conducteur_est_assure: boolean;
  contexte: string;
  responsabilite_engagee: boolean;
  pourcentage_responsabilite: number;
  statut: string;
  scenario?: string;
  charge_suivi_id?: number | null;
  gestionnaire_id?: number | null;
}

export interface Dossier {
  id: number;
  sinistre_id: number;
  numero_dossier: string;
  charge_suivi_id?: number | null;
  gestionnaire_id?: number | null;
  scenario: string;
  statut: string;
  date_ouverture?: string;
  date_cloture?: string | null;
  sinistre?: Sinistre;
  chargeSuivi?: User | null;
  gestionnaire?: User | null;
}

export interface DossierPayload {
  sinistre_id: number;
  numero_dossier: string;
  charge_suivi_id?: number | null;
  gestionnaire_id?: number | null;
  scenario: string;
  statut: string;
  date_ouverture?: string | null;
  date_cloture?: string | null;
}

export interface EtapeDossier {
  id: number;
  dossier_id: number;
  nom_etape: string;
  statut: string;
  date_debut?: string | null;
  date_fin?: string | null;
  commentaire?: string | null;
  validation_requise: boolean;
  validation_effectuee: boolean;
}

export interface DocumentItem {
  id: number;
  sinistre_id?: number | null;
  dossier_id?: number | null;
  etape_id?: number | null;
  type_document: string;
  nom_fichier: string;
  chemin_fichier?: string | null;
  date_depot?: string | null;
  valide: boolean;
  valide_par?: number | null;
}

export interface NotificationItem {
  id: number;
  utilisateur_id?: number | null;
  assure_id?: number | null;
  dossier_id?: number | null;
  type_notification: string;
  message: string;
  date_envoi?: string | null;
  statut: string;
}

export interface HistoriqueItem {
  id: number;
  utilisateur_id?: number | null;
  sinistre_id?: number | null;
  dossier_id?: number | null;
  action: string;
  details?: string | null;
  date_action: string;
  utilisateur?: User | null;
}

export interface DossierDetail extends Dossier {
  etapes?: EtapeDossier[];
  documents?: DocumentItem[];
  notifications?: NotificationItem[];
  historiques?: HistoriqueItem[];
}
