// ---------- Datos y utilidades ----------
let reportes = [];
const etiquetas = { alto: ["Nivel alto", "text-bg-danger"], medio: ["Nivel medio", "text-bg-warning"], bajo: ["Nivel bajo", "text-bg-success"] };
const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function formatoFecha(iso) {
  const [a, m, d] = iso.split("-");
  return `${d} ${meses[Number(m) - 1]} ${a}`;
}

// ---------- Navegación entre pantallas ----------
function mostrarVista(id) {
  document.querySelectorAll(".vista").forEach(v => v.classList.toggle("d-none", v.id !== id));
  window.scrollTo(0, 0);
}

document.querySelectorAll("[data-vista]").forEach(enlace => {
  enlace.addEventListener("click", e => {
    e.preventDefault();
    mostrarVista(enlace.dataset.vista);
    const menu = document.getElementById("menu");           // cierra el menú en celular
    if (menu.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  });
});

// ---------- Lista de reportes (desde JSON) ----------
async function cargarReportes() {
  try {
    const respuesta = await fetch("data/reportes.json");
    reportes = await respuesta.json();
    mostrarTarjetas(reportes);
  } catch (error) {
    console.warn("No se pudo cargar reportes.json; se usan las tarjetas estáticas del HTML.", error);
  }
}

function mostrarTarjetas(lista) {
  const contenedor = document.getElementById("listaReportes");
  contenedor.innerHTML = lista.map(r => `
    <div class="card tarjeta shadow-sm tarjeta-reporte" role="button" tabindex="0" data-id="${r.id}">
      <div class="card-body d-flex justify-content-between align-items-start">
        <div><strong>${r.lugar}</strong><br>
          <span class="small text-secondary">${r.tipo} · ${formatoFecha(r.fecha)}</span></div>
        <span class="badge ${etiquetas[r.nivel][1]}">${etiquetas[r.nivel][0]}</span>
      </div>
    </div>`).join("");
}

// ---------- Ficha del punto (modal) ----------
function abrirFicha(id) {
  const r = reportes.find(x => x.id === Number(id));
  if (!r) return;
  document.getElementById("fichaTitulo").textContent = r.lugar;
  const nivel = document.getElementById("fichaNivel");
  nivel.textContent = etiquetas[r.nivel][0];
  nivel.className = `badge ms-2 ${etiquetas[r.nivel][1]}`;
  document.getElementById("fichaTipo").textContent = r.tipo;
  document.getElementById("fichaFecha").textContent = formatoFecha(r.fecha);
  document.getElementById("fichaDescripcion").textContent = r.descripcion;
  document.getElementById("fichaRuta").href = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("modalFicha")).show();
}

// Clic (o Enter) en tarjetas y marcadores
document.addEventListener("click", e => {
  const el = e.target.closest(".tarjeta-reporte, .marcador");
  if (el) abrirFicha(el.dataset.id);
});
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.classList.contains("tarjeta-reporte")) abrirFicha(e.target.dataset.id);
});

// ---------- Buscador (filtra por nombre del lugar) ----------
document.getElementById("formBuscador").addEventListener("submit", e => {
  e.preventDefault();
  const texto = document.getElementById("buscador").value.trim().toLowerCase();
  mostrarTarjetas(reportes.filter(r => r.lugar.toLowerCase().includes(texto)));
});

// ---------- Validación del formulario ----------
function validarFormulario() {
  const campos = document.querySelectorAll("#formReporte [required]");
  let valido = true;
  campos.forEach(c => {
    const vacio = !c.value.trim();
    c.classList.toggle("is-invalid", vacio);
    if (vacio) valido = false;
  });
  return valido;
}

document.getElementById("formReporte").addEventListener("submit", e => {
  e.preventDefault();
  const aviso = document.getElementById("confirmacion");
  if (validarFormulario()) {
    aviso.classList.remove("d-none");
    e.target.reset();
  } else {
    aviso.classList.add("d-none");
  }
});

cargarReportes();