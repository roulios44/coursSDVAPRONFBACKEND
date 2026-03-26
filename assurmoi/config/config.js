require("dotenv").config();

const common = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  dialect: process.env.DB_DIALECT || "mariadb",
  logging: false,
};

module.exports = {
  development: common,
  test: {
    ...common,
    database: process.env.DB_NAME_TEST || process.env.DB_NAME,
  },
  production: common,
};
