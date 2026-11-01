export const respaldoImagen = "/img/generica.svg";

export async function obtenerImagen(escena, estado) {
  void estado;
  const id = escena && typeof escena.imagen === "string" ? escena.imagen : "";
  const alt = escena && typeof escena.alt === "string" && escena.alt.trim()
    ? escena.alt
    : "Imagen de prueba";
  if (!/^[a-z0-9-]+$/.test(id)) return { src: respaldoImagen, alt };
  return { src: `/img/${id}.svg`, alt };
}
