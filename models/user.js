const { Sequelize } = require("sequelize");

const sequelize = require("../utility/database");

//Creating a model to be managed by sequelize
const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING
});

module.exports = User;
