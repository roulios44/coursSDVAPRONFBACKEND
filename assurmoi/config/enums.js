const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  GESTIONNAIRE: "GESTIONNAIRE",
  CHARGE_SUIVI: "CHARGE_SUIVI",
  CHARGE_CLIENTELE: "CHARGE_CLIENTELE",
  ASSURE: "ASSURE",
});

const USER_STATUS = Object.freeze({
  ACTIF: "actif",
  INACTIF: "inactif",
});

const ASSURE_TYPES = Object.freeze({
  PARTICULIER: "particulier",
  PROFESSIONNEL: "professionnel",
});

const SINISTRE_STATUS = Object.freeze({
  BROUILLON: "brouillon",
  COMPLET: "complet",
  EN_COURS: "en_cours",
  CLOS: "clos",
});

const DOSSIER_SCENARIOS = Object.freeze({
  REPARABLE: "reparable",
  NON_REPARABLE: "non_reparable",
});

const DOSSIER_STATUS = Object.freeze({
  INITIALISE: "initialise",
  EN_ATTENTE_EXPERTISE: "en_attente_expertise",
  EXPERTISE_PLANIFIEE: "expertise_planifiee",
  EXPERTISE_REALISEE: "expertise_realisee",
  EN_COURS: "en_cours",
  REGLEMENT_REALISE: "reglement_realise",
  CLOS: "clos",
});

const ETAPE_STATUS = Object.freeze({
  EN_ATTENTE: "en_attente",
  EN_COURS: "en_cours",
  TERMINE: "termine",
});

const DOCUMENT_TYPES = Object.freeze({
  ATTESTATION: "attestation",
  CARTE_GRISE: "carte_grise",
  PIECE_IDENTITE: "piece_identite",
  FACTURE: "facture",
  RIB: "rib",
  AUTRE: "autre",
});

const NOTIFICATION_TYPES = Object.freeze({
  PUSH: "push",
  MAIL: "mail",
});

const NOTIFICATION_STATUS = Object.freeze({
  ENVOYEE: "envoyee",
  LUE: "lue",
  ERREUR: "erreur",
});

module.exports = {
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
};
