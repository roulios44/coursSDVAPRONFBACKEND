const crypto = require("crypto");
const { createIdGenerator } = require("../utils/id");
const {
  ROLES,
  USER_STATUS,
  ASSURE_TYPES,
  SINISTRE_STATUS,
  DOSSIER_SCENARIOS,
  DOSSIER_STATUS,
  ETAPE_STATUS,
  DOCUMENT_TYPES,
  NOTIFICATION_TYPES,
  NOTIFICATION_STATUS,
} = require("../config/enums");

const now = () => new Date().toISOString();

const store = {
  nextIds: {
    roles: createIdGenerator(1),
    utilisateurs: createIdGenerator(1),
    assures: createIdGenerator(1),
    vehicules: createIdGenerator(1),
    sinistres: createIdGenerator(1),
    dossiers: createIdGenerator(1),
    etapes_dossier: createIdGenerator(1),
    documents: createIdGenerator(1),
    notifications: createIdGenerator(1),
    historiques: createIdGenerator(1),
  },
  roles: [],
  utilisateurs: [],
  assures: [],
  vehicules: [],
  sinistres: [],
  dossiers: [],
  etapes_dossier: [],
  documents: [],
  notifications: [],
  historiques: [],
  passwordResetTokens: [],
  twoFactorChallenges: [],
};

function seed() {
  Object.values(ROLES).forEach((nom) => {
    store.roles.push({ id: store.nextIds.roles(), nom });
  });

  const adminRole = store.roles.find((role) => role.nom === ROLES.ADMIN);
  const clientRole = store.roles.find((role) => role.nom === ROLES.CHARGE_CLIENTELE);
  const suiviRole = store.roles.find((role) => role.nom === ROLES.CHARGE_SUIVI);
  const assureRole = store.roles.find((role) => role.nom === ROLES.ASSURE);

  store.utilisateurs.push(
    {
      id: store.nextIds.utilisateurs(),
      role_id: adminRole.id,
      nom: "Admin",
      prenom: "Systeme",
      email: "admin@assurmoi.local",
      telephone: "0600000001",
      mot_de_passe: "admin123",
      statut: USER_STATUS.ACTIF,
      double_auth_active: true,
      created_at: now(),
    },
    {
      id: store.nextIds.utilisateurs(),
      role_id: clientRole.id,
      nom: "Martin",
      prenom: "Claire",
      email: "clientele@assurmoi.local",
      telephone: "0600000002",
      mot_de_passe: "client123",
      statut: USER_STATUS.ACTIF,
      double_auth_active: false,
      created_at: now(),
    },
    {
      id: store.nextIds.utilisateurs(),
      role_id: suiviRole.id,
      nom: "Bernard",
      prenom: "Louis",
      email: "suivi@assurmoi.local",
      telephone: "0600000003",
      mot_de_passe: "suivi123",
      statut: USER_STATUS.ACTIF,
      double_auth_active: false,
      created_at: now(),
    },
    {
      id: store.nextIds.utilisateurs(),
      role_id: assureRole.id,
      nom: "Durand",
      prenom: "Emma",
      email: "assure@assurmoi.local",
      telephone: "0600000004",
      mot_de_passe: "assure123",
      statut: USER_STATUS.ACTIF,
      double_auth_active: false,
      created_at: now(),
    },
  );

  const assureUser = store.utilisateurs.find((u) => u.email === "assure@assurmoi.local");
  const assure = {
    id: store.nextIds.assures(),
    utilisateur_id: assureUser.id,
    nom: "Durand",
    prenom: "Emma",
    email: "assure@assurmoi.local",
    telephone: "0600000004",
    adresse: "10 rue des Lilas, Paris",
    type_assure: ASSURE_TYPES.PARTICULIER,
  };
  store.assures.push(assure);

  const vehicule = {
    id: store.nextIds.vehicules(),
    assure_id: assure.id,
    immatriculation: "AA-123-BB",
    marque: "Peugeot",
    modele: "208",
    valeur_argus: 9500.0,
  };
  store.vehicules.push(vehicule);

  const sinistre = {
    id: store.nextIds.sinistres(),
    assure_id: assure.id,
    vehicule_id: vehicule.id,
    cree_par: store.utilisateurs.find((u) => u.email === "clientele@assurmoi.local").id,
    date_heure_appel: now(),
    date_heure_sinistre: now(),
    conducteur_nom: assure.nom,
    conducteur_prenom: assure.prenom,
    conducteur_est_assure: true,
    contexte: "Collision arrière à un feu rouge.",
    responsabilite_engagee: false,
    pourcentage_responsabilite: 0,
    statut: SINISTRE_STATUS.COMPLET,
    created_at: now(),
  };
  store.sinistres.push(sinistre);

  const dossier = {
    id: store.nextIds.dossiers(),
    sinistre_id: sinistre.id,
    numero_dossier: "DOS-2026-0001",
    charge_suivi_id: store.utilisateurs.find((u) => u.email === "suivi@assurmoi.local").id,
    gestionnaire_id: store.utilisateurs.find((u) => u.email === "admin@assurmoi.local").id,
    scenario: DOSSIER_SCENARIOS.REPARABLE,
    statut: DOSSIER_STATUS.INITIALISE,
    date_ouverture: now(),
    date_cloture: null,
  };
  store.dossiers.push(dossier);

  store.etapes_dossier.push({
    id: store.nextIds.etapes_dossier(),
    dossier_id: dossier.id,
    nom_etape: "Dossier initialisé",
    statut: ETAPE_STATUS.TERMINE,
    date_debut: now(),
    date_fin: now(),
    commentaire: "Création automatique du dossier",
    validation_requise: false,
    validation_effectuee: true,
  });

  store.documents.push(
    {
      id: store.nextIds.documents(),
      sinistre_id: sinistre.id,
      dossier_id: dossier.id,
      etape_id: null,
      type_document: DOCUMENT_TYPES.ATTESTATION,
      nom_fichier: "attestation.pdf",
      chemin_fichier: "/uploads/attestation.pdf",
      date_depot: now(),
      valide: true,
      valide_par: 1,
    },
    {
      id: store.nextIds.documents(),
      sinistre_id: sinistre.id,
      dossier_id: dossier.id,
      etape_id: null,
      type_document: DOCUMENT_TYPES.CARTE_GRISE,
      nom_fichier: "carte-grise.pdf",
      chemin_fichier: "/uploads/carte-grise.pdf",
      date_depot: now(),
      valide: true,
      valide_par: 1,
    },
  );

  store.notifications.push({
    id: store.nextIds.notifications(),
    utilisateur_id: assureUser.id,
    assure_id: assure.id,
    dossier_id: dossier.id,
    type_notification: NOTIFICATION_TYPES.MAIL,
    message: "Votre dossier a été créé.",
    date_envoi: now(),
    statut: NOTIFICATION_STATUS.ENVOYEE,
  });

  store.passwordResetTokens.push({
    token: crypto.randomUUID(),
    utilisateur_id: 1,
    expires_at: now(),
  });
}

seed();

module.exports = store;
