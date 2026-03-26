const db = require("../models");
const { created, noContent, notFound, ok, internalError } = require("../utils/http");
const { logHistory } = require("../utils/history");

function buildCrudService({
  entityName,
  modelName,
  historyActionPrefix,
  listInclude = [],
  detailInclude = [],
  createInclude = [],
  updateInclude = [],
  buildListWhere = () => ({}),
  normalizePayload = (payload) => payload,
  historyResolver = ({ req, entity }) => ({
    utilisateur_id: req.body.cree_par || req.body.utilisateur_id || null,
    sinistre_id: req.body.sinistre_id || (modelName === "Sinistre" ? entity.id : null),
    dossier_id: req.body.dossier_id || (modelName === "Dossier" ? entity.id : null),
  }),
}) {
  const model = db[modelName];

  const toPlain = (entity) => entity.get({ plain: true });

  async function list(req, res) {
    try {
      const data = await model.findAll({
        where: buildListWhere(req),
        include: listInclude,
        order: [["id", "ASC"]],
      });
      return ok(res, { data: data.map(toPlain) });
    } catch (error) {
      return internalError(res, error);
    }
  }

  async function getOne(req, res) {
    try {
      const entity = await model.findByPk(Number(req.params.id), {
        include: detailInclude,
      });
      if (!entity) {
        return notFound(res, entityName);
      }
      return ok(res, { data: toPlain(entity) });
    } catch (error) {
      return internalError(res, error);
    }
  }

  async function create(req, res) {
    try {
      const payload = await normalizePayload(req.body, req);
      const entity = await model.create(payload);
      const persisted = await model.findByPk(entity.id, { include: createInclude });

      await logHistory({
        ...historyResolver({ req, entity: toPlain(entity), payload, operation: "create" }),
        action: `${historyActionPrefix}_CREATE`,
        details: JSON.stringify(toPlain(persisted || entity)),
      });

      return created(res, { data: toPlain(persisted || entity) });
    } catch (error) {
      return internalError(res, error);
    }
  }

  async function update(req, res) {
    try {
      const entity = await model.findByPk(Number(req.params.id));
      if (!entity) {
        return notFound(res, entityName);
      }

      const payload = await normalizePayload(req.body, req, entity.get({ plain: true }));
      await entity.update(payload);
      const persisted = await model.findByPk(entity.id, { include: updateInclude });

      await logHistory({
        ...historyResolver({
          req,
          entity: toPlain(persisted || entity),
          payload,
          operation: "update",
        }),
        action: `${historyActionPrefix}_UPDATE`,
        details: JSON.stringify(toPlain(persisted || entity)),
      });

      return ok(res, { data: toPlain(persisted || entity) });
    } catch (error) {
      return internalError(res, error);
    }
  }

  async function remove(req, res) {
    try {
      const entity = await model.findByPk(Number(req.params.id));
      if (!entity) {
        return notFound(res, entityName);
      }

      await entity.destroy();
      return noContent(res);
    } catch (error) {
      return internalError(res, error);
    }
  }

  return { list, getOne, create, update, remove };
}

module.exports = { buildCrudService };
