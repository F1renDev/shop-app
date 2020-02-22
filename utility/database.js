const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("node-test", "root", "root", {
  dialect: "mysql",
  host: "localhost"
});

module.exports = sequelize;
