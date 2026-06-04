const jwt = require("jsonwebtoken");
const { secretoSesion } = require("./configuracion");

function verificarToken(req, res, next) {
  const cabecera = req.headers.authorization || "";
  const codigoAcceso = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : null;

  if (!codigoAcceso) {
    return res.status(401).json({ mensaje: "Codigo de acceso no enviado" });
  }

  try {
    req.usuario = jwt.verify(codigoAcceso, secretoSesion);
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Codigo de acceso invalido" });
  }
}

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== "admin") {
    return res.status(403).json({ mensaje: "Solo el administrador puede realizar esta accion" });
  }
  next();
}

module.exports = { verificarToken, soloAdmin };
