CREATE DATABASE IF NOT EXISTS biblioteca_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE biblioteca_db;

DROP TABLE IF EXISTS prestamos;
DROP TABLE IF EXISTS libros;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('admin','usuario') NOT NULL DEFAULT 'usuario'
);

CREATE TABLE libros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  autor VARCHAR(120) NOT NULL,
  categoria VARCHAR(80) NOT NULL,
  cantidad INT NOT NULL DEFAULT 0
);

CREATE TABLE prestamos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  libro_id INT NOT NULL,
  codigo VARCHAR(8) NOT NULL,
  fecha_prestamo DATE NOT NULL,
  fecha_devolucion DATE NULL,
  estado ENUM('pendiente','prestado','devuelto') NOT NULL DEFAULT 'pendiente',
  CONSTRAINT fk_prestamos_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_prestamos_libros FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE
);

INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
('Administrador', 'admin@biblioteca.com', '$2b$10$W9CCKDFcVkc8DH6JMVP8YebAv6hftnNZ1P3c/u43gkWN/CV3vTiL6', 'admin');

INSERT INTO libros (titulo, autor, categoria, cantidad) VALUES
('Cien anos de soledad', 'Gabriel Garcia Marquez', 'Novela', 5),
('El principito', 'Antoine de Saint-Exupery', 'Literatura', 4),
('Clean Code', 'Robert C. Martin', 'Programacion', 2);
