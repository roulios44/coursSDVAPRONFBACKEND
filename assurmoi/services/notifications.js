const { buildCrudService } = require("./baseCrud");
module.exports = buildCrudService({
  entityName: "Notification",
  modelName: "Notification",
  historyActionPrefix: "NOTIFICATION",
  listInclude: [{ association: "utilisateur" }, { association: "assure" }, { association: "dossier" }],
  detailInclude: [{ association: "utilisateur" }, { association: "assure" }, { association: "dossier" }],
  createInclude: [{ association: "utilisateur" }, { association: "assure" }, { association: "dossier" }],
  updateInclude: [{ association: "utilisateur" }, { association: "assure" }, { association: "dossier" }],
  historyResolver: ({ req, entity }) => ({
    utilisateur_id: entity.utilisateur_id || req.body.utilisateur_id || null,
    dossier_id: entity.dossier_id || req.body.dossier_id || null,
  }),
});
