const express = require("express");
const { Op } = require("sequelize");
const { Libro } = require("./modelos");
const { verificarToken, soloAdmin } = require("./intermediarios");

const router = express.Router();

// AQUI EL USUARIO Y ADMIN PIDEN LA LISTA DE LIBROS XD
router.get("/", verificarToken, async (req, res) => {
  const buscar = req.query.buscar || "";
  const where = buscar ? { titulo: { [Op.like]: `%${buscar}%` } } : {};
  const libros = await Libro.findAll({ where, order: [["id", "DESC"]] });
  res.json(libros);
});

// AQUI EL ADMIN CREA LIBROS XD
router.post("/", verificarToken, soloAdmin, async (req, res) => {
  const { titulo, autor, categoria, cantidad } = req.body;
  const libro = await Libro.create({ titulo, autor, categoria, cantidad });
  res.status(201).json({ mensaje: "Libro creado", libro });
});

// AQUI EL ADMIN EDITA LIBROS XD
router.put("/:id", verificarToken, soloAdmin, async (req, res) => {
  const libro = await Libro.findByPk(req.params.id);
  if (!libro) return res.status(404).json({ mensaje: "Libro no encontrado" });

  await libro.update(req.body);
  res.json({ mensaje: "Libro actualizado", libro });
});

// AQUI EL ADMIN ELIMINA LIBROS XD
router.delete("/:id", verificarToken, soloAdmin, async (req, res) => {
  const libro = await Libro.findByPk(req.params.id);
  if (!libro) return res.status(404).json({ mensaje: "Libro no encontrado" });

  await libro.destroy();
  res.json({ mensaje: "Libro eliminado" });
});

module.exports = router;
