const express = require("express");
const { body } = require("express-validator");
const { handleValidationErrors } = require("../middlewares/validation");
const { authenticate } = require("../middlewares/auth");
const { login, verifyTwoFactor, logout, forgotPassword, resetPassword } = require("../services/auth");
const { createUser } = require("../services/users");

const router = express.Router();

const registerValidators = [
  body("nom").notEmpty(),
  body("prenom").notEmpty(),
  body("email").isEmail(),
  body("mot_de_passe").isLength({ min: 6 }),
  body("role_nom").notEmpty(),
  handleValidationErrors,
];

router.post(
  "/login",
  [body("email").isEmail(), body("mot_de_passe").notEmpty(), handleValidationErrors],
  login,
);
router.post("/register", registerValidators, createUser);
router.post(
  "/2fa/verify",
  [body("utilisateur_id").isInt(), body("code").isLength({ min: 6, max: 6 }), handleValidationErrors],
  verifyTwoFactor,
);
router.post("/logout", authenticate, logout);
router.post(
  "/forgot-password",
  [body("email").isEmail(), handleValidationErrors],
  forgotPassword,
);
router.post(
  "/reset-password",
  [body("token").notEmpty(), body("nouveau_mot_de_passe").isLength({ min: 6 }), handleValidationErrors],
  resetPassword,
);

module.exports = router;
