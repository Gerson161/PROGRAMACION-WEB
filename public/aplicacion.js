// pa guardar los datos en el nauegador
const estado = {
  codigoAcceso: localStorage.getItem("codigoAcceso"),
  usuario: JSON.parse(localStorage.getItem("usuario") || "null")
};

// pa elejir cosas del html mas rapido
const $ = (selector) => document.querySelector(selector);
const esAdmin = () => estado.usuario?.rol === "admin";
const datosForm = (form) => Object.fromEntries(new FormData(form));
const cuerpo = (datos) => ({ body: JSON.stringify(datos) });

// pa mostrar un mesaje ke dsp c borra
function mensaje(texto) {
  $("#mensaje").textContent = texto;
  setTimeout(() => $("#mensaje").textContent = "", 3500);
}

// pa pedirle datos al serbidor
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

async function cargarUsuarios() {
  const usuarios = await api("/usuarios");
  tabla("#listaUsuarios", ["Nombre", "Correo", "Rol", "Acciones"], usuarios.map((u) => [
    u.nombre, u.correo, u.rol,
    `<button onclick='editarUsuario(${JSON.stringify(u)})'>Editar</button>
     <button onclick="eliminarUsuario(${u.id})">Eliminar</button>`
  ]));
}

function tabla(selector, columnas, filas) {
  $(selector).innerHTML = `
    <table>
      <thead><tr>${columnas.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
      <tbody>${filas.map((fila) => `<tr>${fila.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
}

async function solicitarPrestamo(libroId) {
  await api("/prestamos", { method: "POST", ...cuerpo({ libro_id: libroId }) });
  mensaje("Prestamo solicitado");
  cargarPrestamos();
}

async function cambiarPrestamo(id, accion) {
  await api(`/prestamos/${id}/${accion}`, { method: "PUT" });
  mensaje(accion === "aprobar" ? "Prestamo aprobado" : "Devolucion registrada");
  cargarPrestamos();
  cargarLibros();
}

// pa rellenar el formulario con los datos
function llenarForm(form, datos) {
  Object.keys(datos).forEach((campo) => {
    if (form[campo]) form[campo].value = datos[campo] ?? "";
  });
}

function editarLibro(libro) {
  llenarForm($("#formLibro"), libro);
}

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

$("#formRegistro").addEventListener("submit", (e) => intentar(async () => {
  e.preventDefault();
  await api("/autenticacion/registro", { method: "POST", ...cuerpo(datosForm(e.target)) });
  e.target.reset();
  mensaje("Registro correcto, ahora puede iniciar sesion");
}));

$("#formIngreso").addEventListener("submit", (e) => intentar(async () => {
  e.preventDefault();
  guardarSesion(await api("/autenticacion/ingreso", { method: "POST", ...cuerpo(datosForm(e.target)) }));
}));

$("#formLibro").addEventListener("submit", (e) => intentar(async () => {
  e.preventDefault();
  const datos = datosForm(e.target);
  datos.cantidad = Number(datos.cantidad);
  await api(datos.id ? `/libros/${datos.id}` : "/libros", { method: datos.id ? "PUT" : "POST", ...cuerpo(datos) });
  limpiarForm("#formLibro");
  mensaje(datos.id ? "Libro actualizado" : "Libro creado");
  cargarLibros();
}));

$("#formUsuario").addEventListener("submit", (e) => intentar(async () => {
  e.preventDefault();
  const datos = datosForm(e.target);
  if (!datos.contrasena) delete datos.contrasena;
  await api(datos.id ? `/usuarios/${datos.id}` : "/usuarios", { method: datos.id ? "PUT" : "POST", ...cuerpo(datos) });
  limpiarForm("#formUsuario");
  mensaje(datos.id ? "Usuario actualizado" : "Usuario creado");
  cargarUsuarios();
}));

$("#btnSalir").onclick = cerrarSesion;
$("#btnBuscar").onclick = () => intentar(cargarLibros);
$("#btnLimpiar").onclick = () => { $("#buscarLibro").value = ""; cargarLibros(); };
$("#btnCancelarLibro").onclick = () => limpiarForm("#formLibro");
$("#btnCancelarUsuario").onclick = () => limpiarForm("#formUsuario");

Object.assign(window, {
  solicitarPrestamo, cambiarPrestamo, editarLibro, editarUsuario, eliminarLibro, eliminarUsuario
});

pintarPantalla();
