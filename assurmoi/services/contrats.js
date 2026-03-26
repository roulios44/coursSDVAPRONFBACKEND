const { buildCrudService } = require("./baseCrud");

module.exports = buildCrudService({
  entityName: "Contrat",
  modelName: "Contrat",
  historyActionPrefix: "CONTRAT",
  listInclude: [{ association: "assure" }],
  detailInclude: [
    { association: "assure" },
    { association: "vehicules" },
    { association: "sinistres" },
  ],
  createInclude: [{ association: "assure" }],
  updateInclude: [{ association: "assure" }],
  historyResolver: ({ req, entity }) => ({
    utilisateur_id: req.body.utilisateur_id || null,
    sinistre_id: entity.sinistres?.[0]?.id || null,
  }),
});
