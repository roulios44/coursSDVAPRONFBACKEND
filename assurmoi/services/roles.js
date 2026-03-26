const { Role } = require("../models");
const { ok, internalError } = require("../utils/http");

async function listRoles(_req, res) {
  try {
    const roles = await Role.findAll({ order: [["id", "ASC"]] });
    return ok(res, { data: roles.map((role) => role.get({ plain: true })) });
  } catch (error) {
    return internalError(res, error);
  }
}

module.exports = { listRoles };
