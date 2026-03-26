CREATE TYPE role_nom_enum AS ENUM ('ADMIN', 'GESTIONNAIRE', 'CHARGE_SUIVI', 'CHARGE_CLIENTELE', 'ASSURE');
CREATE TYPE statut_utilisateur_enum AS ENUM ('actif', 'inactif');
CREATE TYPE type_assure_enum AS ENUM ('particulier', 'professionnel');
CREATE TYPE statut_sinistre_enum AS ENUM ('brouillon', 'complet', 'en_cours', 'clos');
CREATE TYPE scenario_dossier_enum AS ENUM ('reparable', 'non_reparable');
CREATE TYPE statut_etape_enum AS ENUM ('en_attente', 'en_cours', 'termine');
CREATE TYPE type_notification_enum AS ENUM ('push', 'mail');
CREATE TYPE statut_notification_enum AS ENUM ('envoyee', 'lue', 'erreur');

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nom role_nom_enum NOT NULL UNIQUE
);

CREATE TABLE utilisateurs (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES roles(id),
  nom VARCHAR(120) NOT NULL,
  prenom VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  telephone VARCHAR(30),
  mot_de_passe VARCHAR(255) NOT NULL,
  statut statut_utilisateur_enum NOT NULL DEFAULT 'actif',
  double_auth_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assures (
  id SERIAL PRIMARY KEY,
  utilisateur_id INT REFERENCES utilisateurs(id),
  nom VARCHAR(120) NOT NULL,
  prenom VARCHAR(120) NOT NULL,
  email VARCHAR(180),
  telephone VARCHAR(30),
  adresse VARCHAR(255),
  type_assure type_assure_enum NOT NULL
);

CREATE TABLE vehicules (
  id SERIAL PRIMARY KEY,
  assure_id INT NOT NULL REFERENCES assures(id),
  immatriculation VARCHAR(20) NOT NULL UNIQUE,
  marque VARCHAR(100),
  modele VARCHAR(100),
  valeur_argus NUMERIC(10,2)
);

CREATE TABLE sinistres (
  id SERIAL PRIMARY KEY,
  assure_id INT NOT NULL REFERENCES assures(id),
  vehicule_id INT NOT NULL REFERENCES vehicules(id),
  cree_par INT NOT NULL REFERENCES utilisateurs(id),
  date_heure_appel TIMESTAMP NOT NULL,
  date_heure_sinistre TIMESTAMP NOT NULL,
  conducteur_nom VARCHAR(120) NOT NULL,
  conducteur_prenom VARCHAR(120) NOT NULL,
  conducteur_est_assure BOOLEAN NOT NULL,
  contexte TEXT NOT NULL,
  responsabilite_engagee BOOLEAN NOT NULL,
  pourcentage_responsabilite INT NOT NULL CHECK (pourcentage_responsabilite IN (0, 50, 100)),
  statut statut_sinistre_enum NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dossiers (
  id SERIAL PRIMARY KEY,
  sinistre_id INT NOT NULL UNIQUE REFERENCES sinistres(id),
  numero_dossier VARCHAR(50) NOT NULL UNIQUE,
  charge_suivi_id INT REFERENCES utilisateurs(id),
  gestionnaire_id INT REFERENCES utilisateurs(id),
  scenario scenario_dossier_enum NOT NULL,
  statut VARCHAR(60) NOT NULL,
  date_ouverture TIMESTAMP,
  date_cloture TIMESTAMP
);

CREATE TABLE etapes_dossier (
  id SERIAL PRIMARY KEY,
  dossier_id INT NOT NULL REFERENCES dossiers(id),
  nom_etape VARCHAR(150) NOT NULL,
  statut statut_etape_enum NOT NULL,
  date_debut TIMESTAMP,
  date_fin TIMESTAMP,
  commentaire TEXT,
  validation_requise BOOLEAN DEFAULT FALSE,
  validation_effectuee BOOLEAN DEFAULT FALSE
);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  sinistre_id INT REFERENCES sinistres(id),
  dossier_id INT REFERENCES dossiers(id),
  etape_id INT REFERENCES etapes_dossier(id),
  type_document VARCHAR(80) NOT NULL,
  nom_fichier VARCHAR(255) NOT NULL,
  chemin_fichier VARCHAR(255) NOT NULL,
  date_depot TIMESTAMP,
  valide BOOLEAN DEFAULT FALSE,
  valide_par INT REFERENCES utilisateurs(id)
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  utilisateur_id INT REFERENCES utilisateurs(id),
  assure_id INT REFERENCES assures(id),
  dossier_id INT REFERENCES dossiers(id),
  type_notification type_notification_enum NOT NULL,
  message TEXT NOT NULL,
  date_envoi TIMESTAMP,
  statut statut_notification_enum
);

CREATE TABLE historiques (
  id SERIAL PRIMARY KEY,
  utilisateur_id INT REFERENCES utilisateurs(id),
  sinistre_id INT REFERENCES sinistres(id),
  dossier_id INT REFERENCES dossiers(id),
  action VARCHAR(150) NOT NULL,
  date_action TIMESTAMP NOT NULL,
  details TEXT
);

INSERT INTO roles (nom)
VALUES ('ADMIN'), ('GESTIONNAIRE'), ('CHARGE_SUIVI'), ('CHARGE_CLIENTELE'), ('ASSURE');
