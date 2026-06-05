const express = require("express");
const bcrypt = require("bcrypt");
const { Usuario } = require("./modelos");
const { verificarToken, soloAdmin } = require("./intermediarios");

const router = express.Router();

// AQUI EL ADMIN VE LA LISTA DE USUARIOS XD
router.get("/", verificarToken, soloAdmin, async (req, res) => {
  const listaUsuarios = await Usuario.findAll({
    attributes: ["id", "nombre", "correo", "rol"],
    order: [["id", "DESC"]]
  });
  res.json(listaUsuarios);
});

// AQUI EL ADMIN CREA USUARIOS XD
router.post("/", verificarToken, soloAdmin, async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;
  const hashContrasena = await bcrypt.hash(contrasena, 10);
  const usuario = await Usuario.create({ nombre, correo, contrasena: hashContrasena, rol });
  res.status(201).json({ mensaje: "Registro de usuario creado", usuario: { id: usuario.id, nombre, correo, rol } });
});

// AQUI EL ADMIN EDITA USUARIOS XD
router.put("/:id", verificarToken, soloAdmin, async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

  const datosActualizados = { ...req.body };
  if (datosActualizados.contrasena) {
    datosActualizados.contrasena = await bcrypt.hash(datosActualizados.contrasena, 10);
  }
  if (!datosActualizados.contrasena) delete datosActualizados.contrasena;

  await usuario.update(datosActualizados);
  res.json({ mensaje: "Datos del usuario actualizados" });
});

// AQUI EL ADMIN ELIMINA USUARIOS XD
router.delete("/:id", verificarToken, soloAdmin, async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

  await usuario.destroy();
  res.json({ mensaje: "Usuario eliminado correctamente" });
});

module.exports = router;
