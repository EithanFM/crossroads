const lista = document.querySelector("#lista");

cargar();

async function cargar() {
  lista.textContent = "Cargando historias…";
  try {
    const respuesta = await fetch("/historias/indice.json");
    if (!respuesta.ok) throw new Error("indice");
    const indice = await respuesta.json();
    const historias = await Promise.all(idsValidos(indice).map(leerHistoria));
    pintar(historias);
  } catch {
    pintarError("No se pudieron cargar las historias.");
  }
}

function idsValidos(indice) {
  const listaIds = indice && Array.isArray(indice.historias) ? indice.historias : [];
  const vistos = new Set();
  const ids = [];
  for (const id of listaIds) {
    if (typeof id !== "string" || !/^[a-z0-9-]+$/.test(id) || vistos.has(id)) continue;
    vistos.add(id);
    ids.push(id);
  }
  return ids;
}

async function leerHistoria(id) {
  const respuesta = await fetch(`/historias/${id}.json`);
  if (!respuesta.ok) throw new Error(id);
  const historia = await respuesta.json();
  if (!historia || historia.id !== id || typeof historia.titulo !== "string") throw new Error(id);
  return historia;
}

function pintar(historias) {
  lista.replaceChildren();
  if (historias.length === 0) {
    const vacio = document.createElement("p");
    vacio.textContent = "Todavía no hay historias.";
    lista.append(vacio);
    return;
  }
  for (const historia of historias) lista.append(tarjeta(historia));
}

function tarjeta(historia) {
  const enlace = document.createElement("a");
  enlace.className = "tarjeta";
  enlace.href = `/leer/?historia=${encodeURIComponent(historia.id)}`;

  if (typeof historia.etiqueta === "string" && historia.etiqueta.trim()) {
    const etiqueta = document.createElement("p");
    etiqueta.className = "etiqueta";
    etiqueta.textContent = historia.etiqueta;
    enlace.append(etiqueta);
  }

  const titulo = document.createElement("h3");
  titulo.textContent = historia.titulo;
  enlace.append(titulo);

  if (typeof historia.resumen === "string" && historia.resumen.trim()) {
    const resumen = document.createElement("p");
    resumen.className = "resumen";
    resumen.textContent = historia.resumen;
    enlace.append(resumen);
  }

  const accion = document.createElement("span");
  accion.className = "accion";
  accion.textContent = "Leer";
  enlace.append(accion);
  return enlace;
}

function pintarError(mensaje) {
  lista.replaceChildren();
  const aviso = document.createElement("p");
  aviso.className = "aviso";
  aviso.textContent = mensaje;
  lista.append(aviso);
}
