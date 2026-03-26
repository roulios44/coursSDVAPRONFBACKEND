const { User, Role } = require("../models");
const { USER_STATUS } = require("../config/enums");
const { created, noContent, notFound, ok, badRequest, internalError } = require("../utils/http");
const { logHistory } = require("../utils/history");
const { hashPassword } = require("../utils/password");

function enrichUser(userInstance) {
  const user = userInstance.get ? userInstance.get({ plain: true }) : userInstance;
  const { mot_de_passe, ...safeUser } = user;
  return {
    ...safeUser,
    role_nom: user.role?.nom || user.role_nom || null,
  };
}

async function getAllUsers(_req, res) {
  try {
    const users = await User.findAll({
      include: [{ model: Role, as: "role" }],
      order: [["id", "ASC"]],
    });
    return ok(res, { data: users.map(enrichUser) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function getUser(req, res) {
  try {
    const user = await User.findByPk(Number(req.params.id), {
      include: [{ model: Role, as: "role" }],
    });
    if (!user) return notFound(res, "Utilisateur");
    return ok(res, { data: enrichUser(user) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function createUser(req, res) {
  try {
    const emailExists = await User.findOne({ where: { email: req.body.email } });
    if (emailExists) {
      return badRequest(res, "Email déjà utilisé");
    }

    const role = await Role.findOne({ where: { nom: req.body.role_nom } });
    if (!role) {
      const roles = await Role.findAll({ order: [["id", "ASC"]] });
      return badRequest(
        res,
        "Role inconnu",
        roles.map((item) => item.nom),
      );
    }

    const hashedPassword = await hashPassword(req.body.mot_de_passe);

    const user = await User.create({
      role_id: role.id,
      nom: req.body.nom,
      prenom: req.body.prenom,
      email: req.body.email,
      telephone: req.body.telephone || null,
      mot_de_passe: hashedPassword,
      statut: req.body.statut || USER_STATUS.ACTIF,
      double_auth_active: Boolean(req.body.double_auth_active),
    });

    const persisted = await User.findByPk(user.id, {
      include: [{ model: Role, as: "role" }],
    });

    await logHistory({
      utilisateur_id: user.id,
      action: "UTILISATEUR_CREATE",
      details: JSON.stringify(enrichUser(persisted)),
    });

    return created(res, { data: enrichUser(persisted) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function updateUser(req, res) {
  try {
    const user = await User.findByPk(Number(req.params.id), {
      include: [{ model: Role, as: "role" }],
    });
    if (!user) return notFound(res, "Utilisateur");

    const payload = { ...req.body };
    delete payload.id;
    delete payload.role_nom;

    if (req.body.role_nom) {
      const role = await Role.findOne({ where: { nom: req.body.role_nom } });
      if (!role) {
        const roles = await Role.findAll({ order: [["id", "ASC"]] });
        return badRequest(
          res,
          "Role inconnu",
          roles.map((item) => item.nom),
        );
      }
      payload.role_id = role.id;
    }

    if (req.body.mot_de_passe) {
      payload.mot_de_passe = await hashPassword(req.body.mot_de_passe);
    }

    await user.update(payload);
    const persisted = await User.findByPk(user.id, {
      include: [{ model: Role, as: "role" }],
    });

    await logHistory({
      utilisateur_id: user.id,
      action: "UTILISATEUR_UPDATE",
      details: JSON.stringify(enrichUser(persisted)),
    });

    return ok(res, { data: enrichUser(persisted) });
  } catch (error) {
    return internalError(res, error);
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findByPk(Number(req.params.id));
    if (!user) return notFound(res, "Utilisateur");
    await user.destroy();
    return noContent(res);
  } catch (error) {
    return internalError(res, error);
  }
}

module.exports = { getAllUsers, getUser, createUser, updateUser, deleteUser };
