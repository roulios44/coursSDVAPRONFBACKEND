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

const swaggerDocument = YAML.load(path.join(__dirname, "docs", "swagger.yaml"));

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:5173"],
  }),
);

app.use(requestLogger);

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

async function startServer() {
  try {
    await dbInstance.authenticate();
    console.log("Connexion a la base de donnees etablie.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Impossible de se connecter a la base de donnees.", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
