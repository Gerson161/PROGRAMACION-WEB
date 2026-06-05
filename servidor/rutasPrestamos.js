const express = require("express");
const crypto = require("crypto");
const { Prestamo, Libro, Usuario } = require("./modelos");
const { verificarToken, soloAdmin } = require("./intermediarios");

const router = express.Router();

// AQUI EL USUARIO SOLICITA UN PRESTAMO XD
router.post("/", verificarToken, async (req, res) => {
  const libro = await Libro.findByPk(req.body.libro_id);
  if (!libro) return res.status(404).json({ mensaje: "Libro no encontrado" });
  if (libro.cantidad <= 0) return res.status(400).json({ mensaje: "No hay ejemplares disponibles" });

  const codigo = crypto.randomBytes(4).toString("hex").toUpperCase();
  const prestamo = await Prestamo.create({
    usuario_id: req.usuario.id,
    libro_id: libro.id,
    codigo,
    fecha_prestamo: new Date(),
    estado: "pendiente"
  });

  res.status(201).json({ mensaje: "Prestamo solicitado", prestamo });
});

// AQUI SE LISTAN PRESTAMOS XD: USUARIO VE LOS SUYOS Y ADMIN VE TODOS
router.get("/", verificarToken, async (req, res) => {
  const where = req.usuario.rol === "admin" ? {} : { usuario_id: req.usuario.id };
  const prestamos = await Prestamo.findAll({
    where,
    include: [
      { model: Usuario, attributes: ["id", "nombre", "correo"] },
      { model: Libro, attributes: ["id", "titulo", "autor"] }
    ],
    order: [["id", "DESC"]]
  });
  res.json(prestamos);
});

// AQUI EL ADMIN APRUEBA PRESTAMOS XD
router.put("/:id/aprobar", verificarToken, soloAdmin, async (req, res) => {
  const prestamo = await Prestamo.findByPk(req.params.id);
  if (!prestamo) return res.status(404).json({ mensaje: "Prestamo no encontrado" });
  if (prestamo.estado !== "pendiente") return res.status(400).json({ mensaje: "Solo se aprueban prestamos pendientes" });

  const libro = await Libro.findByPk(prestamo.libro_id);
  if (!libro || libro.cantidad <= 0) return res.status(400).json({ mensaje: "No hay ejemplares disponibles" });

  await libro.update({ cantidad: libro.cantidad - 1 });
  await prestamo.update({ estado: "prestado" });
  res.json({ mensaje: "Prestamo aprobado", prestamo });
});

// AQUI EL ADMIN REGISTRA DEVOLUCIONES XD
router.put("/:id/devolver", verificarToken, soloAdmin, async (req, res) => {
  const prestamo = await Prestamo.findByPk(req.params.id);
  if (!prestamo) return res.status(404).json({ mensaje: "Prestamo no encontrado" });
  if (prestamo.estado === "devuelto") return res.status(400).json({ mensaje: "El prestamo ya fue devuelto" });

  const libro = await Libro.findByPk(prestamo.libro_id);
  if (libro && prestamo.estado === "prestado") {
    await libro.update({ cantidad: libro.cantidad + 1 });
  }

  await prestamo.update({ estado: "devuelto", fecha_devolucion: new Date() });
  res.json({ mensaje: "Devolucion registrada", prestamo });
});

module.exports = router;
