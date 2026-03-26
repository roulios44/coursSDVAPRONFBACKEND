const { Historique } = require("../models");
const { ok, internalError } = require("../utils/http");

async function list(req, res) {
  try {
    const where = {};
    if (req.query.sinistre_id) where.sinistre_id = Number(req.query.sinistre_id);
    if (req.query.dossier_id) where.dossier_id = Number(req.query.dossier_id);
    if (req.query.utilisateur_id) where.utilisateur_id = Number(req.query.utilisateur_id);

    const data = await Historique.findAll({
      where,
      include: [{ association: "utilisateur" }, { association: "sinistre" }, { association: "dossier" }],
      order: [["date_action", "DESC"]],
    });

    return ok(res, { data: data.map((item) => item.get({ plain: true })) });
  } catch (error) {
    return internalError(res, error);
  }
}

module.exports = { list };
