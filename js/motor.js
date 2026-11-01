export function crearEstado(historia) {
  return { escena: historia.inicio, variables: {} };
}

export function obtenerEscena(historia, estado) {
  if (!estado || typeof estado.escena !== "string" || !historia.escenas) return null;
  return historia.escenas[estado.escena] || null;
}

export function esFinal(escena) {
  return Boolean(escena && escena.final);
}

export function opcionesVisibles(escena, estado) {
  const opciones = escena && Array.isArray(escena.opciones) ? escena.opciones : [];
  const variables = estado && estado.variables ? estado.variables : {};
  return opciones.filter((opcion) => cumple(opcion && opcion.si, variables));
}

export function resolverSiguiente(siguiente, aleatorio = Math.random) {
  if (typeof siguiente === "string") return siguiente;
  if (!Array.isArray(siguiente) || siguiente.length === 0) return null;
  const ramas = [];
  for (const rama of siguiente) {
    if (!rama || typeof rama.id !== "string") continue;
    const peso = Number(rama.peso);
    ramas.push({ id: rama.id, peso: Number.isFinite(peso) ? peso : 1 });
  }
  const utiles = ramas.filter((rama) => rama.peso > 0);
  if (utiles.length === 0) return null;
  const total = utiles.reduce((suma, rama) => suma + rama.peso, 0);
  let marca = aleatorio() * total;
  for (const rama of utiles) {
    marca -= rama.peso;
    if (marca < 0) return rama.id;
  }
  return utiles[utiles.length - 1].id;
}

export function aplicarOpcion(estado, opcion, aleatorio = Math.random) {
  const variables = { ...(estado.variables || {}) };
  if (opcion && opcion.fijar && typeof opcion.fijar === "object") {
    Object.assign(variables, opcion.fijar);
  }
  return {
    escena: resolverSiguiente(opcion && opcion.siguiente, aleatorio),
    variables,
  };
}

export function revisarHistoria(historia) {
  const errores = [];
  if (!historia || typeof historia !== "object") return ["El archivo de la historia no es válido."];
  const escenas = historia.escenas;
  if (!escenas || typeof escenas !== "object") return ["Faltan las escenas."];
  if (typeof historia.titulo !== "string" || !historia.titulo.trim()) errores.push("Falta el título.");
  if (typeof historia.inicio !== "string" || !escenas[historia.inicio]) {
    errores.push("La escena inicial no existe.");
  }
  for (const [id, escena] of Object.entries(escenas)) {
    if (!escena || typeof escena !== "object") {
      errores.push(`La escena «${id}» no es válida.`);
      continue;
    }
    if (typeof escena.texto !== "string" || !escena.texto.trim()) {
      errores.push(`A «${id}» le falta el texto.`);
    }
    if (typeof escena.alt !== "string" || !escena.alt.trim()) {
      errores.push(`A «${id}» le falta el texto alternativo de la imagen.`);
    }
    if (escena.imagen !== undefined && (typeof escena.imagen !== "string" || !/^[a-z0-9-]+$/.test(escena.imagen))) {
      errores.push(`La imagen de «${id}» usa un nombre no permitido.`);
    }
    if (escena.final) continue;
    const opciones = Array.isArray(escena.opciones) ? escena.opciones : [];
    if (opciones.length === 0) {
      errores.push(`«${id}» no tiene opciones ni está marcada como final.`);
      continue;
    }
    for (const opcion of opciones) {
      if (!opcion || typeof opcion.texto !== "string" || !opcion.texto.trim()) {
        errores.push(`Una opción de «${id}» no tiene texto.`);
      }
      const destinos = destinosDe(opcion && opcion.siguiente);
      if (destinos.length === 0) {
        errores.push(`Una opción de «${id}» no dice a dónde sigue.`);
        continue;
      }
      for (const destino of destinos) {
        if (!escenas[destino]) errores.push(`«${id}» apunta a «${destino}», que no existe.`);
      }
    }
  }
  return errores;
}

function cumple(condicion, variables) {
  if (!condicion) return true;
  return Object.entries(condicion).every(([clave, valor]) => {
    const actual = variables[clave];
    if (actual === undefined && typeof valor === "boolean") return valor === false;
    return actual === valor;
  });
}

function destinosDe(siguiente) {
  if (typeof siguiente === "string") return [siguiente];
  if (!Array.isArray(siguiente)) return [];
  return siguiente
    .map((rama) => (rama && typeof rama.id === "string" ? rama.id : ""))
    .filter(Boolean);
}
