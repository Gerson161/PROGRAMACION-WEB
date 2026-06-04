const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Usuario } = require("./modelos");
const { jwtSecreto } = require("./configuracion");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Complete nombre, email y password" });
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ mensaje: "El email ya esta registrado" });
    }

    const passwordEncriptado = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({
      nombre,
      email,
      password: passwordEncriptado,
      rol: "usuario"
    });

    res.status(201).json({ mensaje: "Usuario registrado", usuario: { id: usuario.id, nombre, email, rol: usuario.rol } });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      jwtSecreto,
      { expiresIn: "2h" }
    );

    res.json({
      mensaje: "Login correcto",
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al iniciar sesion" });
  }
});

module.exports = router;
