const express = require("express");
const bcrypt = require("bcrypt");
const { Usuario } = require("./modelos");
const { verificarToken, soloAdmin } = require("./middleware");

const router = express.Router();

router.get("/", verificarToken, soloAdmin, async (req, res) => {
  const usuarios = await Usuario.findAll({
    attributes: ["id", "nombre", "email", "rol"],
    order: [["id", "DESC"]]
  });
  res.json(usuarios);
});

router.post("/", verificarToken, soloAdmin, async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const passwordEncriptado = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ nombre, email, password: passwordEncriptado, rol });
  res.status(201).json({ mensaje: "Usuario creado", usuario: { id: usuario.id, nombre, email, rol } });
});

router.put("/:id", verificarToken, soloAdmin, async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

  const datos = { ...req.body };
  if (datos.password) datos.password = await bcrypt.hash(datos.password, 10);
  if (!datos.password) delete datos.password;

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
