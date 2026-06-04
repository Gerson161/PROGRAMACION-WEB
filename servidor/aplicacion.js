const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const { puerto } = require("./configuracion");
const { sequelize, Usuario, Libro } = require("./modelos");
const rutasAutenticacion = require("./rutasAutenticacion");
const rutasLibros = require("./rutasLibros");
const rutasPrestamos = require("./rutasPrestamos");
const rutasUsuarios = require("./rutasUsuarios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "publico")));

app.use("/autenticacion", rutasAutenticacion);
app.use("/libros", rutasLibros);
app.use("/prestamos", rutasPrestamos);
app.use("/usuarios", rutasUsuarios);

app.get("/salud", (req, res) => {
  res.json({ mensaje: "Servidor funcionando" });
});

async function crearDatosIniciales() {
  const totalUsuarios = await Usuario.count();
  if (totalUsuarios === 0) {
    await Usuario.create({
      nombre: "Administrador",
      correo: "admin@biblioteca.com",
      contrasena: await bcrypt.hash("123456", 10),
      rol: "admin"
    });
  }

  const totalLibros = await Libro.count();
  if (totalLibros === 0) {
    await Libro.bulkCreate([
      { titulo: "Cien anos de soledad", autor: "Gabriel Garcia Marquez", categoria: "Novela", cantidad: 5 },
      { titulo: "El principito", autor: "Antoine de Saint-Exupery", categoria: "Literatura", cantidad: 4 },
      { titulo: "Clean Code", autor: "Robert C. Martin", categoria: "Programacion", cantidad: 2 }
    ]);
  }
}

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await crearDatosIniciales();
    app.listen(puerto, () => {
      console.log(`Servidor iniciado en http://localhost:${puerto}`);
    });
  } catch (error) {
    console.error("Error al conectar con MySQL. Verifique que XAMPP/MySQL este encendido.");
    console.error(error.message);
  }
}

iniciarServidor();
