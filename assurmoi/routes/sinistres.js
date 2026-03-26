const express = require("express");
const service = require("../services/sinistres");
const router = express.Router();
router.get("/", service.list);
router.get("/:id", service.getOne);
router.post("/", service.create);
router.put("/:id", service.update);
module.exports = router;
