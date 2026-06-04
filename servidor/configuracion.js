require("dotenv").config();

module.exports = {
  puerto: process.env.PORT || 3000,
  secretoSesion: process.env.SECRETO_SESION || "clave_secreta_biblioteca",
  baseDatos: {
    servidor: process.env.BD_SERVIDOR || "localhost",
    usuario: process.env.BD_USUARIO || "root",
    contrasena: process.env.BD_CONTRASENA || "",
    nombre: process.env.BD_NOMBRE || "biblioteca_db",
    puerto: process.env.BD_PUERTO || 3306
  }
};
