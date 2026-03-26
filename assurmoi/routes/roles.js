const express = require("express");
const { listRoles } = require("../services/roles");

const router = express.Router();
router.get("/", listRoles);
module.exports = router;
