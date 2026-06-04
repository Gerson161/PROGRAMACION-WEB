# Sistema Web de Gestion de Biblioteca

Proyecto simple con Node.js, Express, Sequelize y MySQL usando XAMPP.

## Instalacion

1. Encender MySQL en XAMPP.
2. Abrir phpMyAdmin en `http://localhost:8080/phpmyadmin/`.
3. Ejecutar el archivo `database/base_datos_biblioteca.sql`.
4. Copiar `.env.example` como `.env` si no existe.
5. Instalar dependencias:

```bash
npm install
```

6. Iniciar el servidor:

```bash
npm start
```

7. Abrir la pagina:

```text
http://localhost:3000
```

## Usuario administrador

```text
Correo: admin@biblioteca.com
Contrasena: 123456
```

## Rutas principales

```text
POST /autenticacion/registro
POST /autenticacion/ingreso
GET /libros
POST /libros
PUT /libros/:id
DELETE /libros/:id
GET /usuarios
POST /prestamos
GET /prestamos
PUT /prestamos/:id/aprobar
PUT /prestamos/:id/devolver
```
