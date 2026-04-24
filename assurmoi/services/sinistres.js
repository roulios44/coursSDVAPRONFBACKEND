const path = require("path");
const { Sinistre, Dossier, Contrat, Vehicule, Document } = require("../models");
const { created, notFound, ok, badRequest, internalError } = require("../utils/http");
const { logHistory } = require("../utils/history");
const { SINISTRE_STATUS, DOSSIER_STATUS, DOSSIER_SCENARIOS } = require("../config/enums");

async function resolveContratId(body) {
  if (body.contrat_id) {
    return Number(body.contrat_id);
  }

  if (body.vehicule_id) {
    const vehicule = await Vehicule.findByPk(Number(body.vehicule_id));
    if (vehicule?.contrat_id) {
      return vehicule.contrat_id;
    }
  }

  if (body.assure_id) {
    const contrat = await Contrat.findOne({
      where: { assure_id: Number(body.assure_id) },
      order: [["id", "DESC"]],
    });
    if (contrat) {
      return contrat.id;
    }
  }

  return null;
}

async function ensureDossierForCompletedSinistre(sinistre, reqBody) {
  if (sinistre.statut !== SINISTRE_STATUS.COMPLET) {
    return;
  }

  const dossierExists = await Dossier.findOne({ where: { sinistre_id: sinistre.id } });
  if (dossierExists) {
    return;
  }

  const count = await Dossier.count();
  await Dossier.create({
    sinistre_id: sinistre.id,
    numero_dossier: `DOS-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
    charge_suivi_id: reqBody.charge_suivi_id || null,
    gestionnaire_id: reqBody.gestionnaire_id || null,
    scenario: reqBody.scenario || DOSSIER_SCENARIOS.REPARABLE,
    statut: DOSSIER_STATUS.INITIALISE,
    date_ouverture: new Date(),
    date_cloture: null,
  });
}

async function list(req, res) {
  try {
    const assureId = req.query.assure_id ? Number(req.query.assure_id) : null;
    const where = {};
    const include = [{ association: "contrat" }, { association: "vehicule" }, { association: "createur" }];

    if (req.query.statut) where.statut = req.query.statut;
    if (assureId) {
      include[0] = {
        association: "contrat",
        where: { assure_id: assureId },
      };
    }

    const data = await Sinistre.findAll({
      where,
      include,
      order: [["id", "ASC"]],
    });

    return ok(res, { data: data.map((item) => item.get({ plain: true })) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function getOne(req, res) {
  try {
    const item = await Sinistre.findByPk(Number(req.params.id), {
      include: [
        { association: "contrat" },
        { association: "vehicule" },
        { association: "createur" },
        { association: "dossier" },
        { association: "documents" },
      ],
    });
    if (!item) return notFound(res, "Sinistre");
    return ok(res, { data: item.get({ plain: true }) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function create(req, res) {
  try {
    const responsabilite = Boolean(req.body.responsabilite_engagee);
    const pourcentage = responsabilite ? Number(req.body.pourcentage_responsabilite || 0) : 0;
    if (![0, 50, 100].includes(pourcentage)) {
      return badRequest(res, "Le pourcentage de responsabilité doit être 0, 50 ou 100");
    }

    const contratId = await resolveContratId(req.body);
    if (!contratId) {
      return badRequest(res, "Impossible de déterminer le contrat lié au sinistre");
    }

    const entity = await Sinistre.create({
      contrat_id: contratId,
      vehicule_id: Number(req.body.vehicule_id),
      cree_par: Number(req.body.cree_par),
      date_heure_appel: req.body.date_heure_appel,
      date_heure_sinistre: req.body.date_heure_sinistre,
      conducteur_nom: req.body.conducteur_nom,
      conducteur_prenom: req.body.conducteur_prenom,
      conducteur_est_assure: Boolean(req.body.conducteur_est_assure),
      contexte: req.body.contexte,
      responsabilite_engagee: responsabilite,
      pourcentage_responsabilite: pourcentage,
      statut: req.body.statut || SINISTRE_STATUS.BROUILLON,
    });

    await ensureDossierForCompletedSinistre(entity, req.body);

    await logHistory({
      utilisateur_id: entity.cree_par,
      sinistre_id: entity.id,
      action: "SINISTRE_CREATE",
      details: JSON.stringify(entity.get({ plain: true })),
    });
    return created(res, { data: entity.get({ plain: true }) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function update(req, res) {
  try {
    const current = await Sinistre.findByPk(Number(req.params.id));
    if (!current) return notFound(res, "Sinistre");

    const responsabilite = req.body.responsabilite_engagee ?? current.responsabilite_engagee;
    const pourcentage = responsabilite
      ? Number(req.body.pourcentage_responsabilite ?? current.pourcentage_responsabilite)
      : 0;
    if (![0, 50, 100].includes(pourcentage)) {
      return badRequest(res, "Le pourcentage de responsabilité doit être 0, 50 ou 100");
    }

    const payload = {
      ...req.body,
      responsabilite_engagee: responsabilite,
      pourcentage_responsabilite: pourcentage,
    };

    if (req.body.contrat_id || req.body.assure_id || req.body.vehicule_id) {
      payload.contrat_id = await resolveContratId({
        ...current.get({ plain: true }),
        ...req.body,
      });
    }

    await current.update(payload);
    await ensureDossierForCompletedSinistre(current, req.body);

    await logHistory({
      utilisateur_id: current.cree_par,
      sinistre_id: current.id,
      action: "SINISTRE_UPDATE",
      details: JSON.stringify(current.get({ plain: true })),
    });

    return ok(res, { data: current.get({ plain: true }) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function remove(req, res) {
  try {
    const current = await Sinistre.findByPk(Number(req.params.id));
    if (!current) return notFound(res, "Sinistre");

    await logHistory({
      utilisateur_id: current.cree_par,
      sinistre_id: current.id,
      action: "SINISTRE_DELETE",
      details: JSON.stringify(current.get({ plain: true })),
    });

    await current.destroy();
    return ok(res, { message: "Sinistre supprimé", data: null });
  } catch (error) {
    return internalError(res, error);
  }
}

async function uploadDocument(req, res) {
  try {
    const sinistreId = Number(req.params.id);
    const sinistre = await Sinistre.findByPk(sinistreId, {
      include: [{ association: "dossier" }],
    });

    if (!sinistre) {
      return notFound(res, "Sinistre");
    }

    if (!req.file) {
      return badRequest(res, "Aucun fichier n'a ete transmis");
    }

    const document = await Document.create({
      sinistre_id: sinistreId,
      dossier_id: sinistre.dossier?.id || null,
      etape_id: null,
      type_document: req.body.type_document || "piece_jointe",
      nom_fichier: req.file.originalname,
      chemin_fichier: `/files/${path.basename(req.file.path)}`,
      date_depot: new Date(),
      valide: false,
      valide_par: null,
    });

    await logHistory({
      utilisateur_id: req.user?.id || sinistre.cree_par || null,
      sinistre_id: sinistreId,
      dossier_id: sinistre.dossier?.id || null,
      action: "DOCUMENT_UPLOAD",
      details: JSON.stringify(document.get({ plain: true })),
    });

    return created(res, { data: document.get({ plain: true }) });
  } catch (error) {
    return internalError(res, error);
  }
}

module.exports = { list, getOne, create, update, remove, uploadDocument };
