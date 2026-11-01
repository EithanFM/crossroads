import { aplicarOpcion, crearEstado, esFinal, obtenerEscena, opcionesVisibles, revisarHistoria } from "./motor.js";
import { obtenerImagen, respaldoImagen } from "./imagen.js";
import { obtenerTexto } from "./texto.js";

const app = document.querySelector("#app");
const id = new URLSearchParams(location.search).get("historia");

if (!id || !/^[a-z0-9-]+$/.test(id)) {
  pintarAviso("Elige una historia desde el inicio.");
} else {
  cargar(id);
}

async function cargar(idHistoria) {
  let historia;
  try {
    const respuesta = await fetch(`/historias/${idHistoria}.json`);
    if (!respuesta.ok) throw new Error("respuesta");
    historia = await respuesta.json();
  } catch {
    pintarAviso("No se encontró la historia.");
    return;
  }

  if (!historia || historia.id !== idHistoria) {
    pintarAviso("No se encontró la historia.");
    return;
  }

  const errores = revisarHistoria(historia);
  document.title = `${historia.titulo || "Historia"} — Crossroads`;
  if (errores.length) {
    pintarAviso("Esta historia todavía no se puede leer.", errores, historia.titulo);
    return;
  }

  const meta = document.querySelector('meta[name="description"]');
  if (meta && typeof historia.resumen === "string" && historia.resumen.trim()) {
    meta.setAttribute("content", historia.resumen);
  }

  let estado = crearEstado(historia);

  async function mostrar(moverFoco) {
    const escena = obtenerEscena(historia, estado);
    if (!escena) {
      pintarAviso("Esta escena no existe.", [], historia.titulo);
      return;
    }

    let texto;
    let imagen;
    try {
      texto = await obtenerTexto(escena, estado);
      imagen = await obtenerImagen(escena, estado);
    } catch {
      pintarAviso("No se pudo mostrar la escena.", [], historia.titulo);
      return;
    }

    const final = esFinal(escena);
    const opciones = final ? [] : opcionesVisibles(escena, estado);
    const articulo = document.createElement("article");
    articulo.append(cabecera(historia.etiqueta), encabezado(historia.titulo), figura(imagen), parrafo(texto));

    if (final) {
      articulo.append(marcaFinal(), cierre());
    } else if (opciones.length === 0) {
      const aviso = document.createElement("p");
      aviso.className = "aviso";
      aviso.textContent = "Esta escena no tiene salida.";
      articulo.append(aviso, cierre());
    } else {
      articulo.append(listaOpciones(opciones));
    }

    app.replaceChildren(articulo);
    window.scrollTo(0, 0);
    if (moverFoco) articulo.querySelector("h1").focus({ preventScroll: true });
  }

  function listaOpciones(opciones) {
    const lista = document.createElement("div");
    lista.className = "opciones";
    opciones.forEach((opcion, indice) => {
      const boton = document.createElement("button");
      boton.type = "button";
      const numero = document.createElement("span");
      numero.className = "numero";
      numero.setAttribute("aria-hidden", "true");
      numero.textContent = String(indice + 1).padStart(2, "0");
      const nombre = document.createElement("span");
      nombre.textContent = opcion.texto;
      boton.append(numero, nombre);
      boton.addEventListener("click", async () => {
        for (const otro of lista.querySelectorAll("button")) otro.disabled = true;
        estado = aplicarOpcion(estado, opcion);
        await mostrar(true);
      });
      lista.append(boton);
    });
    return lista;
  }

  function cierre() {
    const acciones = document.createElement("div");
    acciones.className = "cierre";
    const reintentar = document.createElement("button");
    reintentar.type = "button";
    reintentar.textContent = "Volver a jugar";
    reintentar.addEventListener("click", async () => {
      estado = crearEstado(historia);
      await mostrar(true);
    });
    acciones.append(reintentar, enlaceInicio("Volver al inicio"));
    return acciones;
  }

  await mostrar(false);
}

function cabecera(etiqueta) {
  const fila = document.createElement("div");
  fila.className = "cabecera";
  fila.append(marcaSitio(), etiquetaDe(etiqueta));
  return fila;
}

function marcaSitio() {
  const enlace = document.createElement("a");
  enlace.className = "volver";
  enlace.href = "/";
  enlace.textContent = "Crossroads";
  return enlace;
}

function etiquetaDe(texto) {
  const etiqueta = document.createElement("p");
  etiqueta.className = "etiqueta";
  etiqueta.textContent = typeof texto === "string" && texto.trim() ? texto : "Historia";
  return etiqueta;
}

function encabezado(texto) {
  const titulo = document.createElement("h1");
  titulo.tabIndex = -1;
  titulo.textContent = texto;
  return titulo;
}

function figura(imagen) {
  const marco = document.createElement("figure");
  const img = document.createElement("img");
  const src = imagen && typeof imagen.src === "string" ? imagen.src : respaldoImagen;
  img.alt = imagen && typeof imagen.alt === "string" && imagen.alt.trim() ? imagen.alt : "Imagen de prueba";
  img.width = 800;
  img.height = 500;
  img.addEventListener("error", () => {
    if (img.dataset.respaldo === "1") return;
    img.dataset.respaldo = "1";
    img.src = respaldoImagen;
  });
  marco.append(img);
  img.src = src;
  return marco;
}

function parrafo(texto) {
  const bloque = document.createElement("p");
  bloque.className = "escena";
  bloque.textContent = typeof texto === "string" ? texto : "";
  return bloque;
}

function marcaFinal() {
  const marca = document.createElement("p");
  marca.className = "marca-final";
  marca.textContent = "Final";
  return marca;
}

function enlaceInicio(texto) {
  const enlace = document.createElement("a");
  enlace.className = "enlace-inicio";
  enlace.href = "/";
  enlace.textContent = texto;
  return enlace;
}

function pintarAviso(mensaje, detalles = [], titulo) {
  if (!titulo) document.title = "Historia no encontrada — Crossroads";
  app.replaceChildren();
  const encabezadoPagina = document.createElement("h1");
  encabezadoPagina.textContent = titulo || "Crossroads";
  const aviso = document.createElement("p");
  aviso.className = "aviso";
  aviso.textContent = mensaje;
  app.append(encabezadoPagina, aviso);
  if (detalles.length) {
    const lista = document.createElement("ul");
    lista.className = "errores";
    for (const detalle of detalles) {
      const item = document.createElement("li");
      item.textContent = detalle;
      lista.append(item);
    }
    app.append(lista);
  }
  const enlace = document.createElement("a");
  enlace.className = "enlace-texto";
  enlace.href = "/";
  enlace.textContent = "Volver al inicio";
  app.append(enlace);
}
