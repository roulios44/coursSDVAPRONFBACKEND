const { buildCrudService } = require("./baseCrud");
module.exports = buildCrudService({
  entityName: "Étape de dossier",
  modelName: "EtapeDossier",
  historyActionPrefix: "ETAPE_DOSSIER",
  listInclude: [{ association: "dossier" }],
  detailInclude: [{ association: "dossier" }, { association: "documents" }],
  createInclude: [{ association: "dossier" }],
  updateInclude: [{ association: "dossier" }],
  historyResolver: ({ req, entity }) => ({
    dossier_id: entity.dossier_id || req.body.dossier_id || null,
  }),
});
