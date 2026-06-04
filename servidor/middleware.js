const jwt = require("jsonwebtoken");
const { jwtSecreto } = require("./configuracion");

function verificarToken(req, res, next) {
  const cabecera = req.headers.authorization || "";
  const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : null;

  if (!token) {
    return res.status(401).json({ mensaje: "Token no enviado" });
  }

  try {
    req.usuario = jwt.verify(token, jwtSecreto);
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token invalido" });
  }
}

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== "admin") {
    return res.status(403).json({ mensaje: "Solo el administrador puede realizar esta accion" });
  }
  next();
}

module.exports = { verificarToken, soloAdmin };
