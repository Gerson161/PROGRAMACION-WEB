const { Sequelize } = require("sequelize");
const { baseDatos } = require("./configuracion");

const sequelize = new Sequelize(baseDatos.nombre, baseDatos.usuario, baseDatos.password, {
  host: baseDatos.host,
  port: baseDatos.puerto,
  dialect: "mysql",
  logging: false
});

module.exports = sequelize;
