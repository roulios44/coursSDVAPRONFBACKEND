const crypto = require("crypto");
const { Op } = require("sequelize");
const { User, TwoFactorCode, PasswordResetToken, AuthToken } = require("../models");
const { ok, badRequest, notFound, internalError } = require("../utils/http");
const { USER_STATUS } = require("../config/enums");
const { generateAuthTokenDetails, hashAuthToken } = require("../utils/auth-token");
const { logHistory } = require("../utils/history");
const { comparePassword, hashPassword } = require("../utils/password");

async function issueStoredAuthToken(user) {
  const { token, expiresAt } = generateAuthTokenDetails(user);

  await AuthToken.update(
    { revoked_at: new Date() },
    {
      where: {
        user_id: user.id,
        revoked_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
    },
  );

  await AuthToken.create({
    user_id: user.id,
    token_hash: hashAuthToken(token),
    expires_at: expiresAt,
  });

  return token;
}

async function login(req, res) {
  try {
    const { email, mot_de_passe } = req.body;
    const user = await User.findOne({ where: { email } });
    const isPasswordValid = user ? await comparePassword(mot_de_passe, user.mot_de_passe) : false;
    if (!user || !isPasswordValid) {
      return badRequest(res, "Identifiants invalides");
    }

    if (user.statut !== USER_STATUS.ACTIF) {
      return badRequest(res, "Compte inactif");
    }

    if (user.double_auth_active) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await TwoFactorCode.create({
        user_id: user.id,
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      });

      return ok(res, {
        message: "Code 2FA généré. Vérifiez votre email ou SMS.",
        data: {
          utilisateur_id: user.id,
          challenge: "2fa_required",
          code_demo: code,
        },
      });
    }

    await logHistory({
      utilisateur_id: user.id,
      action: "AUTH_LOGIN",
      details: JSON.stringify({ email }),
    });

    const token = await issueStoredAuthToken(user);

    return ok(res, {
      message: "Connexion réussie",
      data: {
        utilisateur_id: user.id,
        email: user.email,
        role_id: user.role_id,
        token,
      },
    });
  } catch (error) {
    return internalError(res, error);
  }
}

async function verifyTwoFactor(req, res) {
  try {
    const challenge = await TwoFactorCode.findOne({
      where: {
        user_id: Number(req.body.utilisateur_id),
        code: req.body.code,
        consumed_at: null,
      },
      order: [["id", "DESC"]],
    });

    if (!challenge || new Date(challenge.expires_at).getTime() < Date.now()) {
      return badRequest(res, "Code 2FA invalide");
    }

    await challenge.update({ consumed_at: new Date() });

    await logHistory({
      utilisateur_id: challenge.user_id,
      action: "AUTH_2FA_VERIFIED",
      details: JSON.stringify({ utilisateur_id: challenge.user_id }),
    });

    const user = await User.findByPk(challenge.user_id);
    const token = await issueStoredAuthToken(user);

    return ok(res, {
      message: "Double authentification validée",
      data: {
        utilisateur_id: challenge.user_id,
        token,
      },
    });
  } catch (error) {
    return internalError(res, error);
  }
}

async function logout(req, res) {
  try {
    await AuthToken.update(
      { revoked_at: new Date() },
      {
        where: {
          id: req.auth?.token_id,
          user_id: req.auth?.utilisateur_id,
          revoked_at: null,
        },
      },
    );

    await logHistory({
      utilisateur_id: req.auth?.utilisateur_id || null,
      action: "AUTH_LOGOUT",
      details: JSON.stringify({ token_id: req.auth?.token_id || null }),
    });

    return ok(res, { message: "Déconnexion réussie" });
  } catch (error) {
    return internalError(res, error);
  }
}

async function forgotPassword(req, res) {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return notFound(res, "Utilisateur");

    const token = crypto.randomUUID();
    await PasswordResetToken.create({
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
    });

    return ok(res, {
      message: "Token de réinitialisation généré",
      data: { token_demo: token, utilisateur_id: user.id },
    });
  } catch (error) {
    return internalError(res, error);
  }
}

async function resetPassword(req, res) {
  try {
    const tokenLine = await PasswordResetToken.findOne({
      where: {
        token: req.body.token,
        used_at: null,
      },
      order: [["id", "DESC"]],
    });
    if (!tokenLine || new Date(tokenLine.expires_at).getTime() < Date.now()) {
      return badRequest(res, "Token invalide");
    }

    const user = await User.findByPk(tokenLine.user_id);
    if (!user) {
      return notFound(res, "Utilisateur");
    }

    const hashedPassword = await hashPassword(req.body.nouveau_mot_de_passe);
    await user.update({ mot_de_passe: hashedPassword });
    await tokenLine.update({ used_at: new Date() });

    await logHistory({
      utilisateur_id: user.id,
      action: "AUTH_PASSWORD_RESET",
      details: JSON.stringify({ email: user.email }),
    });

    return ok(res, { message: "Mot de passe mis à jour" });
  } catch (error) {
    return internalError(res, error);
  }
}

module.exports = { login, verifyTwoFactor, logout, forgotPassword, resetPassword };
