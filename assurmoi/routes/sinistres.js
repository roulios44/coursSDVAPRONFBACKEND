const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const service = require("../services/sinistres");
const router = express.Router();

const filesDirectory = path.join(__dirname, "..", "files");

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    fs.mkdirSync(filesDirectory, { recursive: true });
    callback(null, filesDirectory);
  },
  filename(_req, file, callback) {
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);

    const safeBaseName = baseName || "document";
    callback(null, `${Date.now()}-${safeBaseName}${extension}`);
  },
});

const upload = multer({ storage });

router.get("/", service.list);
router.get("/:id", service.getOne);
router.post("/", service.create);
router.post("/:id/documents", upload.single("file"), service.uploadDocument);
router.put("/:id", service.update);
router.delete("/:id", service.remove);
module.exports = router;
