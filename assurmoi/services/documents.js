const { buildCrudService } = require("./baseCrud");
module.exports = buildCrudService({
  entityName: "Document",
  modelName: "Document",
  historyActionPrefix: "DOCUMENT",
  listInclude: [{ association: "sinistre" }, { association: "dossier" }, { association: "etape" }],
  detailInclude: [
    { association: "sinistre" },
    { association: "dossier" },
    { association: "etape" },
    { association: "validateur" },
  ],
  createInclude: [{ association: "sinistre" }, { association: "dossier" }],
  updateInclude: [{ association: "sinistre" }, { association: "dossier" }],
  historyResolver: ({ req, entity }) => ({
    utilisateur_id: req.body.valide_par || null,
    sinistre_id: entity.sinistre_id || null,
    dossier_id: entity.dossier_id || null,
  }),
});
