const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Usuario } = require("./modelos");
const { secretoSesion } = require("./configuracion");

const router = express.Router();

// INICIO DE LA RUTA BACKEND PARA REGISTRO DE USUARIOS
router.post("/registro", async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ mensaje: "Complete nombre, correo y contrasena" });
    }

    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(400).json({ mensaje: "El correo ya esta registrado" });
    }

    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuario.create({
      nombre,
      correo,
      contrasena: contrasenaEncriptada,
      rol: "usuario"
    });

    res.status(201).json({ mensaje: "Usuario registrado", usuario: { id: usuario.id, nombre, correo, rol: usuario.rol } });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario" });
  }
});
// FIN DE LA RUTA BACKEND PARA REGISTRO DE USUARIOS

// INICIO DE LA RUTA BACKEND PARA INGRESO / LOGIN
router.post("/ingreso", async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const usuario = await Usuario.findOne({ where: { correo } });

    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const codigoAcceso = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
      secretoSesion,
      { expiresIn: "2h" }
    );

    res.json({
      mensaje: "Ingreso correcto",
      codigoAcceso,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al iniciar sesion" });
  }
});
// FIN DE LA RUTA BACKEND PARA INGRESO / LOGIN

module.exports = router;
