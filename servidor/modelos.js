const { DataTypes } = require("sequelize");
const sequelize = require("./baseDatos");

const Usuario = sequelize.define("Usuario", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.ENUM("admin", "usuario"), defaultValue: "usuario" }
}, {
  tableName: "usuarios",
  timestamps: false
});

const Libro = sequelize.define("Libro", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  autor: { type: DataTypes.STRING, allowNull: false },
  categoria: { type: DataTypes.STRING, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  tableName: "libros",
  timestamps: false
});

const Prestamo = sequelize.define("Prestamo", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  libro_id: { type: DataTypes.INTEGER, allowNull: false },
  codigo: { type: DataTypes.STRING(8), allowNull: false },
  fecha_prestamo: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_devolucion: { type: DataTypes.DATEONLY, allowNull: true },
  estado: { type: DataTypes.ENUM("pendiente", "prestado", "devuelto"), defaultValue: "pendiente" }
}, {
  tableName: "prestamos",
  timestamps: false
});

Usuario.hasMany(Prestamo, { foreignKey: "usuario_id" });
Libro.hasMany(Prestamo, { foreignKey: "libro_id" });
Prestamo.belongsTo(Usuario, { foreignKey: "usuario_id" });
Prestamo.belongsTo(Libro, { foreignKey: "libro_id" });

module.exports = { sequelize, Usuario, Libro, Prestamo };
