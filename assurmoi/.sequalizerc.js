const path = require("path");

module.exports = {
  config: path.resolve("configurations", "config.js"),
  "models-path": path.resolve("models"),
  "migrations-path": path.resolve("migrations"),
  "seeders-path": path.resolve("seeders"),
};
