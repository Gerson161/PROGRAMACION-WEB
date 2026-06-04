const { Sequelize } = require("sequelize");
const { baseDatos } = require("./configuracion");

const sequelize = new Sequelize(baseDatos.nombre, baseDatos.usuario, baseDatos.contrasena, {
  host: baseDatos.servidor,
  port: baseDatos.puerto,
  dialect: "mysql",
  logging: false
});

module.exports = sequelize;
