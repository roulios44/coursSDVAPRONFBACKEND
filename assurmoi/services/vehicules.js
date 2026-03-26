const { buildCrudService } = require("./baseCrud");
module.exports = buildCrudService({
  entityName: "Véhicule",
  modelName: "Vehicule",
  historyActionPrefix: "VEHICULE",
  listInclude: [{ association: "contrat" }],
  detailInclude: [{ association: "contrat" }, { association: "sinistres" }],
  createInclude: [{ association: "contrat" }],
  updateInclude: [{ association: "contrat" }],
});
