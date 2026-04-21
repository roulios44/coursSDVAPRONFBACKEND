const express = require("express");
const { body } = require("express-validator");
const { handleValidationErrors } = require("../middlewares/validation");
const { sendTestMail } = require("../services/mail-test");

const router = express.Router();

router.post(
  "/test",
  [
    body("to").optional().isEmail(),
    body("subject").optional().isString(),
    body("text").optional().isString(),
    body("html").optional().isString(),
    handleValidationErrors,
  ],
  sendTestMail,
);

module.exports = router;
