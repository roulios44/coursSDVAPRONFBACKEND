const { Op } = require("sequelize");
const { User, AuthToken } = require("../models");
const { verifyAuthToken, hashAuthToken } = require("../utils/auth-token");

async function authenticate(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization || "";
    if (!authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();
    const payload = verifyAuthToken(token);
    if (!payload?.utilisateur_id) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    const storedToken = await AuthToken.findOne({
      where: {
        user_id: payload.utilisateur_id,
        token_hash: hashAuthToken(token),
        revoked_at: null,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });
    if (!storedToken) {
      return res.status(401).json({ message: "Session invalide ou expirée" });
    }

    const user = await User.findByPk(payload.utilisateur_id);
    if (!user) {
      return res.status(401).json({ message: "Utilisateur introuvable pour ce token" });
    }

    req.auth = payload;
    req.auth.token_id = storedToken.id;
    req.user = user.get({ plain: true });
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Authentification invalide" });
  }
}

module.exports = { authenticate };
