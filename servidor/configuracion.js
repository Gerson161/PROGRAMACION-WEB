require("dotenv").config();

module.exports = {
  puerto: process.env.PORT || 3000,
  jwtSecreto: process.env.JWT_SECRET || "clave_secreta_biblioteca",
  baseDatos: {
    host: process.env.DB_HOST || "localhost",
    usuario: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    nombre: process.env.DB_NAME || "biblioteca_db",
    puerto: process.env.DB_PORT || 3306
  }
};
