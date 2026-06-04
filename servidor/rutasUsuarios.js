const express = require("express");
const bcrypt = require("bcrypt");
const { Usuario } = require("./modelos");
const { verificarToken, soloAdmin } = require("./intermediarios");

const router = express.Router();

router.get("/", verificarToken, soloAdmin, async (req, res) => {
  const usuarios = await Usuario.findAll({
    attributes: ["id", "nombre", "correo", "rol"],
    order: [["id", "DESC"]]
  });
  res.json(usuarios);
});

router.post("/", verificarToken, soloAdmin, async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;
  const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);
  const usuario = await Usuario.create({ nombre, correo, contrasena: contrasenaEncriptada, rol });
  res.status(201).json({ mensaje: "Usuario creado", usuario: { id: usuario.id, nombre, correo, rol } });
});

router.put("/:id", verificarToken, soloAdmin, async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

  const datos = { ...req.body };
  if (datos.contrasena) datos.contrasena = await bcrypt.hash(datos.contrasena, 10);
  if (!datos.contrasena) delete datos.contrasena;

  await usuario.update(datos);
  res.json({ mensaje: "Usuario actualizado" });
});

router.delete("/:id", verificarToken, soloAdmin, async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

  await usuario.destroy();
  res.json({ mensaje: "Usuario eliminado" });
});

module.exports = router;
