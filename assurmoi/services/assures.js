const { buildCrudService } = require("./baseCrud");
module.exports = buildCrudService({
  entityName: "Assuré",
  modelName: "Assure",
  historyActionPrefix: "ASSURE",
  listInclude: [{ association: "utilisateur" }],
  detailInclude: [{ association: "utilisateur" }, { association: "contrats" }],
  createInclude: [{ association: "utilisateur" }],
  updateInclude: [{ association: "utilisateur" }],
  historyResolver: ({ req, entity }) => ({
    utilisateur_id: req.body.utilisateur_id || entity.utilisateur_id || null,
  }),
});
