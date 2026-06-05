// Guardado de datos en navegador
const estado = {
  codigoAcceso: localStorage.getItem("codigoAcceso"),
  usuario: JSON.parse(localStorage.getItem("usuario") || "null")
};

// Manejo de HTML
const $ = (selector) => document.querySelector(selector);
const esAdmin = () => estado.usuario?.rol === "admin";
const datosForm = (form) => Object.fromEntries(new FormData(form));
const cuerpo = (datos) => ({ body: JSON.stringify(datos) });

// Mostrar mensaje de manera temporal
function mensaje(texto) {
  $("#mensaje").textContent = texto;
  setTimeout(() => $("#mensaje").textContent = "", 3500);
}

// Petición de datos al servidor
async function api(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(estado.codigoAcceso && { Authorization: `Bearer ${estado.codigoAcceso}` }),
      ...opciones.headers
    }
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.mensaje || "Error en la solicitud");
  return datos;
}

async function intentar(accion) {
  try {
    await accion();
  } catch (error) {
    mensaje(error.message);
  }
}

function guardarSesion({ codigoAcceso, usuario }) {
  Object.assign(estado, { codigoAcceso, usuario });
  localStorage.setItem("codigoAcceso", codigoAcceso);
  localStorage.setItem("usuario", JSON.stringify(usuario));
  pintarPantalla();
}

function cerrarSesion() {
  Object.assign(estado, { codigoAcceso: null, usuario: null });
  localStorage.removeItem("codigoAcceso");
  localStorage.removeItem("usuario");
  pintarPantalla();
}

// pa dibujar la pantalla
function pintarPantalla() {
  const conSesion = Boolean(estado.codigoAcceso);
  ["seccionAuth", "seccionSistema", "btnSalir", "panelAdminLibros", "panelUsuarios"].forEach((id) => {
    const ocultar = id === "seccionAuth" ? conSesion : id.includes("Admin") || id === "panelUsuarios" ? !esAdmin() : !conSesion;
    $(`#${id}`).classList.toggle("oculto", ocultar);
  });

  $("#tituloPrestamos").textContent = esAdmin() ? "Todos los prestamos" : "Mis prestamos";
  $("#datosUsuario").textContent = estado.usuario ? `${estado.usuario.nombre} (${estado.usuario.rol})` : "Sin sesion";

  if (conSesion) cargarTodo();
}

function cargarTodo() {
  cargarLibros();
  cargarPrestamos();
  if (esAdmin()) cargarUsuarios();
}

// AQUI CARGA EL CATALOGO DE LIBROS XD: LO VE USUARIO Y ADMIN
async function cargarLibros() {
  const buscar = encodeURIComponent($("#buscarLibro").value.trim());
  const libros = await api(`/libros${buscar ? `?buscar=${buscar}` : ""}`);
  $("#listaLibros").innerHTML = libros.map((libro) => `
    <article class="tarjeta">
      <h3>${libro.titulo}</h3>
      <p><strong>Autor:</strong> ${libro.autor}</p>
      <p><strong>Categoria:</strong> ${libro.categoria}</p>
      <p><strong>Cantidad:</strong> ${libro.cantidad}</p>
      <div class="accionesTarjeta">
        <button onclick="solicitarPrestamo(${libro.id})">Prestar</button>
        ${esAdmin() ? `<button onclick='editarLibro(${JSON.stringify(libro)})'>Editar</button><button onclick="eliminarLibro(${libro.id})">Eliminar</button>` : ""}
      </div>
    </article>`).join("");
}
// AQUI TERMINA LO DEL CATALOGO XD

// AQUI CARGA LOS PRESTAMOS XD: USUARIO VE LOS SUYOS Y ADMIN VE TODO
async function cargarPrestamos() {
  const prestamos = await api("/prestamos");
  const accion = (p) => p.estado === "pendiente"
    ? `<button onclick="cambiarPrestamo(${p.id}, 'aprobar')">Aprobar</button>`
    : p.estado === "prestado"
      ? `<button onclick="cambiarPrestamo(${p.id}, 'devolver')">Devolver</button>`
      : "Sin acciones";

  tabla("#listaPrestamos",
    ["Codigo", "Usuario", "Libro", "Fecha prestamo", "Fecha devolucion", "Estado", ...(esAdmin() ? ["Acciones"] : [])],
    prestamos.map((p) => [
      p.codigo, p.Usuario?.nombre || "", p.Libro?.titulo || "", p.fecha_prestamo,
      p.fecha_devolucion || "-", p.estado, ...(esAdmin() ? [accion(p)] : [])
    ])
  );
}
// AQUI TERMINA LO DE MOSTRAR PRESTAMOS XD

// AQUI CARGA LOS USUARIOS XD: SOLO LE SALE AL ADMIN
async function cargarUsuarios() {
  const usuarios = await api("/usuarios");
  tabla("#listaUsuarios", ["Nombre", "Correo", "Rol", "Acciones"], usuarios.map((u) => [
    u.nombre, u.correo, u.rol,
    `<button onclick='editarUsuario(${JSON.stringify(u)})'>Editar</button>
     <button onclick="eliminarUsuario(${u.id})">Eliminar</button>`
  ]));
}
// AQUI TERMINA LO DE USUARIOS DEL ADMIN XD

function tabla(selector, columnas, filas) {
  $(selector).innerHTML = `
    <table>
      <thead><tr>${columnas.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
      <tbody>${filas.map((fila) => `<tr>${fila.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
}

// AQUI EL USUARIO PIDE UN LIBRO PRESTADO XD
async function solicitarPrestamo(libroId) {
  await api("/prestamos", { method: "POST", ...cuerpo({ libro_id: libroId }) });
  mensaje("Prestamo solicitado");
  cargarPrestamos();
}

// AQUI EL ADMIN APRUEBA PRESTAMOS O LOS MARCA COMO DEVUELTOS XD
async function cambiarPrestamo(id, accion) {
  await api(`/prestamos/${id}/${accion}`, { method: "PUT" });
  mensaje(accion === "aprobar" ? "Prestamo aprobado" : "Devolucion registrada");
  cargarPrestamos();
  cargarLibros();
}

// LLenado de datos en el formulario
function llenarForm(form, datos) {
  Object.keys(datos).forEach((campo) => {
    if (form[campo]) form[campo].value = datos[campo] ?? "";
  });
}

// AQUI EL ADMIN CARGA UN LIBRO EN EL FORMULARIO PARA EDITARLO XD
function editarLibro(libro) {
  llenarForm($("#formLibro"), libro);
}

// AQUI EL ADMIN CARGA UN USUARIO EN EL FORMULARIO PARA EDITARLO XD
function editarUsuario(usuario) {
  llenarForm($("#formUsuario"), { ...usuario, contrasena: "" });
}

function limpiarForm(selector) {
  $(selector).reset();
  $(selector).id.value = "";
}

async function eliminar(ruta, texto, despues) {
  if (!confirm(texto)) return;
  await api(ruta, { method: "DELETE" });
  mensaje("Registro eliminado");
  despues();
}

const eliminarLibro = (id) => eliminar(`/libros/${id}`, "Desea eliminar este libro?", cargarLibros);
const eliminarUsuario = (id) => eliminar(`/usuarios/${id}`, "Desea eliminar este usuario?", cargarUsuarios);

// INICIO DE LA LOGICA DEL REGISTRO DE USUARIOS
$("#formRegistro").addEventListener("submit", (e) => intentar(async () => {
  e.preventDefault();
  await api("/autenticacion/registro", { method: "POST", ...cuerpo(datosForm(e.target)) });
  e.target.reset();
  mensaje("Registro correcto, ahora puede iniciar sesion");
}));
// FIN DE LA LOGICA DEL REGISTRO DE USUARIOS

// INICIO DE LA LOGICA DEL INGRESO / LOGIN
$("#formIngreso").addEventListener("submit", (e) => intentar(async () => {
  e.preventDefault();
  guardarSesion(await api("/autenticacion/ingreso", { method: "POST", ...cuerpo(datosForm(e.target)) }));
}));
// FIN DE LA LOGICA DEL INGRESO / LOGIN

// AQUI EL ADMIN GUARDA LIBROS XD: SI TIENE ID EDITA, SI NO TIENE ID CREA
$("#formLibro").addEventListener("submit", (e) => intentar(async () => {
  e.preventDefault();
  const datos = datosForm(e.target);
  datos.cantidad = Number(datos.cantidad);
  await api(datos.id ? `/libros/${datos.id}` : "/libros", { method: datos.id ? "PUT" : "POST", ...cuerpo(datos) });
  limpiarForm("#formLibro");
  mensaje(datos.id ? "Libro actualizado" : "Libro creado");
  cargarLibros();
}));
// AQUI TERMINA EL GUARDADO DE LIBROS DEL ADMIN XD

// AQUI EL ADMIN GUARDA USUARIOS XD: SI TIENE ID EDITA, SI NO TIENE ID CREA
$("#formUsuario").addEventListener("submit", (e) => intentar(async () => {
  e.preventDefault();
  const datos = datosForm(e.target);
  if (!datos.contrasena) delete datos.contrasena;
  await api(datos.id ? `/usuarios/${datos.id}` : "/usuarios", { method: datos.id ? "PUT" : "POST", ...cuerpo(datos) });
  limpiarForm("#formUsuario");
  mensaje(datos.id ? "Usuario actualizado" : "Usuario creado");
  cargarUsuarios();
}));
// AQUI TERMINA EL GUARDADO DE USUARIOS DEL ADMIN XD

$("#btnSalir").onclick = cerrarSesion;
$("#btnBuscar").onclick = () => intentar(cargarLibros);
$("#btnLimpiar").onclick = () => { $("#buscarLibro").value = ""; cargarLibros(); };
$("#btnCancelarLibro").onclick = () => limpiarForm("#formLibro");
$("#btnCancelarUsuario").onclick = () => limpiarForm("#formUsuario");

Object.assign(window, {
  solicitarPrestamo, cambiarPrestamo, editarLibro, editarUsuario, eliminarLibro, eliminarUsuario
});

pintarPantalla();
