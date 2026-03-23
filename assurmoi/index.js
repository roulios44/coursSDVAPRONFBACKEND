const express = require("express");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`app lancé sur http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("API OK");
});

module.exports = app;
