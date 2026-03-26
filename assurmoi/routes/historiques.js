const express = require("express");
const { list } = require("../services/historiques");
const router = express.Router();
router.get("/", list);
module.exports = router;
