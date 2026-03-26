const rolesRoutes = require("./roles");
const authRoutes = require("./auth");
const usersRoutes = require("./users");
const assuresRoutes = require("./assures");
const contratsRoutes = require("./contrats");
const vehiculesRoutes = require("./vehicules");
const sinistresRoutes = require("./sinistres");
const dossiersRoutes = require("./dossiers");
const etapesDossierRoutes = require("./etapes-dossier");
const documentsRoutes = require("./documents");
const notificationsRoutes = require("./notifications");
const historiquesRoutes = require("./historiques");
const { authenticate } = require("../middlewares/auth");

function initRoutes(app) {
  app.use("/api/auth", authRoutes);
  app.use("/api/roles", authenticate, rolesRoutes);
  app.use("/api/users", authenticate, usersRoutes);
  app.use("/api/assures", authenticate, assuresRoutes);
  app.use("/api/contrats", authenticate, contratsRoutes);
  app.use("/api/vehicules", authenticate, vehiculesRoutes);
  app.use("/api/sinistres", authenticate, sinistresRoutes);
  app.use("/api/dossiers", authenticate, dossiersRoutes);
  app.use("/api/etapes-dossier", authenticate, etapesDossierRoutes);
  app.use("/api/documents", authenticate, documentsRoutes);
  app.use("/api/notifications", authenticate, notificationsRoutes);
  app.use("/api/historiques", authenticate, historiquesRoutes);
}

module.exports = initRoutes;
