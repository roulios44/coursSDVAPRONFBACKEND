const { validationResult } = require("express-validator");

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Erreur de validation",
      errors: errors.array(),
    });
  }

  return next();
}

module.exports = { handleValidationErrors };
