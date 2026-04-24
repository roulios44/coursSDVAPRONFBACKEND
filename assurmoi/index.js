const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

require("dotenv").config();

const initRoutes = require("./routes");
const { requestLogger } = require("./middlewares/common");
const { dbInstance } = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_CONNECT_RETRIES = Number(process.env.DB_CONNECT_RETRIES || 10);
const DB_CONNECT_DELAY_MS = Number(process.env.DB_CONNECT_DELAY_MS || 3000);
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8081",
]);

const swaggerDocument = YAML.load(path.join(__dirname, "docs", "swagger.yaml"));

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isLocalhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      if (ALLOWED_ORIGINS.has(origin) || isLocalhostOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin non autorisee par CORS: ${origin}`));
    },
  }),
);

app.use(requestLogger);
app.use("/files", express.static(path.join(__dirname, "files")));

// Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Optionnel : accès direct au yaml
app.get("/docs/swagger.yaml", (req, res) => {
  res.sendFile(path.join(__dirname, "docs", "swagger.yaml"));
});

initRoutes(app);

app.get("/", (req, res) => {
  res.redirect("/docs");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function startServer() {
  for (let attempt = 1; attempt <= DB_CONNECT_RETRIES; attempt += 1) {
    try {
      await dbInstance.authenticate();
      console.log("Connexion a la base de donnees etablie.");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
      return;
    } catch (error) {
      const isLastAttempt = attempt === DB_CONNECT_RETRIES;
      console.error(
        `Connexion a la base de donnees impossible (tentative ${attempt}/${DB_CONNECT_RETRIES}).`,
        error.message,
      );

      if (isLastAttempt) {
        console.error("Abandon du demarrage apres plusieurs tentatives.");
        process.exit(1);
      }

      await wait(DB_CONNECT_DELAY_MS);
    }
  }
}

startServer();

module.exports = app;
