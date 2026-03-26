const express = require("express");
const { body } = require("express-validator");
const { handleValidationErrors } = require("../middlewares/validation");
const { getAllUsers, getUser, createUser, updateUser, deleteUser } = require("../services/users");

const router = express.Router();

const createUserValidators = [
  body("nom").notEmpty(),
  body("prenom").notEmpty(),
  body("email").isEmail(),
  body("mot_de_passe").isLength({ min: 6 }),
  body("role_nom").notEmpty(),
  handleValidationErrors,
];

router.post("/", createUserValidators, createUser);
router.get("/:id", getUser);
router.get("/", getAllUsers);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);

module.exports = router;
