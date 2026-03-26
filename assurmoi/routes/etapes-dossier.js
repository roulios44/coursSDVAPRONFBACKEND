const express = require("express");
const service = require("../services/etapes-dossier");
const router = express.Router();
router.get("/", service.list);
router.get("/:id", service.getOne);
router.post("/", service.create);
router.put("/:id", service.update);
router.delete("/:id", service.remove);
module.exports = router;
