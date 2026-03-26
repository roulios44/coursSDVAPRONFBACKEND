const { Historique } = require("../models");

async function logHistory(payload) {
  return Historique.create({
    utilisateur_id: payload.utilisateur_id || null,
    sinistre_id: payload.sinistre_id || null,
    dossier_id: payload.dossier_id || null,
    action: payload.action,
    date_action: new Date(),
    details: payload.details || null,
  });
}

module.exports = { logHistory };
