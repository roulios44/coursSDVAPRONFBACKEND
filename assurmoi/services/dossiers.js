const { Dossier, EtapeDossier, Document, Notification, Historique } = require("../models");
const { created, notFound, ok, internalError } = require("../utils/http");
const { logHistory } = require("../utils/history");

async function list(req, res) {
  try {
    const where = {};
    if (req.query.statut) where.statut = req.query.statut;
    if (req.query.scenario) where.scenario = req.query.scenario;

    const data = await Dossier.findAll({
      where,
      include: [{ association: "sinistre" }, { association: "chargeSuivi" }, { association: "gestionnaire" }],
      order: [["id", "ASC"]],
    });

    return ok(res, { data: data.map((item) => item.get({ plain: true })) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function getOne(req, res) {
  try {
    const dossier = await Dossier.findByPk(Number(req.params.id), {
      include: [
        { association: "sinistre" },
        { association: "chargeSuivi" },
        { association: "gestionnaire" },
        { model: EtapeDossier, as: "etapes" },
        { model: Document, as: "documents" },
        { model: Notification, as: "notifications" },
        { model: Historique, as: "historiques" },
      ],
    });
    if (!dossier) return notFound(res, "Dossier");

    return ok(res, { data: dossier.get({ plain: true }) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function create(req, res) {
  try {
    const dossier = await Dossier.create({
      sinistre_id: Number(req.body.sinistre_id),
      numero_dossier: req.body.numero_dossier,
      charge_suivi_id: req.body.charge_suivi_id || null,
      gestionnaire_id: req.body.gestionnaire_id || null,
      scenario: req.body.scenario,
      statut: req.body.statut,
      date_ouverture: req.body.date_ouverture || new Date(),
      date_cloture: req.body.date_cloture || null,
    });

    await logHistory({
      utilisateur_id: req.body.charge_suivi_id || req.body.gestionnaire_id || null,
      dossier_id: dossier.id,
      sinistre_id: dossier.sinistre_id,
      action: "DOSSIER_CREATE",
      details: JSON.stringify(dossier.get({ plain: true })),
    });

    return created(res, { data: dossier.get({ plain: true }) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function update(req, res) {
  try {
    const dossier = await Dossier.findByPk(Number(req.params.id));
    if (!dossier) return notFound(res, "Dossier");

    await dossier.update({
      ...req.body,
      id: dossier.id,
    });

    await logHistory({
      utilisateur_id: req.body.charge_suivi_id || req.body.gestionnaire_id || null,
      dossier_id: dossier.id,
      sinistre_id: dossier.sinistre_id,
      action: "DOSSIER_UPDATE",
      details: JSON.stringify(dossier.get({ plain: true })),
    });

    return ok(res, { data: dossier.get({ plain: true }) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function remove(req, res) {
  try {
    const dossier = await Dossier.findByPk(Number(req.params.id));
    if (!dossier) return notFound(res, "Dossier");

    await logHistory({
      utilisateur_id: dossier.charge_suivi_id || dossier.gestionnaire_id || null,
      dossier_id: dossier.id,
      sinistre_id: dossier.sinistre_id,
      action: "DOSSIER_DELETE",
      details: JSON.stringify(dossier.get({ plain: true })),
    });

    await dossier.destroy();
    return ok(res, { message: "Dossier supprimé", data: null });
  } catch (error) {
    return internalError(res, error);
  }
}

module.exports = { list, getOne, create, update, remove };
