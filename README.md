# Crossroads

Sitio de historias interactivas en español. El lector elige y algunas ramas se sortean. Lo que eligió antes puede cambiar las opciones que vienen después.

El sitio es HTML, CSS y JavaScript estáticos. Vercel lo publica sin paso de compilación.

Hoy el texto y las imágenes salen de archivos del repositorio. `js/texto.js` y `js/imagen.js` son los únicos puntos que entregan la escena: el lector los llama con la escena y el estado (`escena` y `variables`). Más adelante se puede sustituir cualquiera de los dos por un generador, sin tocar el resto.

## Agregar una historia

1. Copia `historias/historia-de-prueba.json` a `historias/mi-relato.json`.
2. Cambia el `id` a `mi-relato` (minúsculas, números y guiones, igual que el nombre del archivo).
3. Agrega `"mi-relato"` en `historias/indice.json`.
4. Si hace falta una imagen nueva, guarda un SVG en `img/` (menos de 500 KB) y usa ese nombre en `imagen`, con su `alt`.

La portada lee el índice y muestra `titulo`, `resumen` y `etiqueta`. La historia abre en `/leer/?historia=mi-relato`.

### Escenas

- `inicio`: id de la primera escena.
- `escenas`: cada clave es una escena, con `texto`, `imagen`, `alt` y `opciones`.
- `opciones[].siguiente`: id de la escena que sigue, o una lista `{ "id", "peso" }` si el destino se sortea. Más peso, más probable.
- `opciones[].fijar`: variables que quedan guardadas. Ejemplo: `{ "tieneLlave": true }`.
- `opciones[].si`: la opción solo aparece si esas variables coinciden. Si falta una variable booleana, cuenta como `false`.
- `final`: `true` en un desenlace. No lleva opciones.

Cada camino tiene que poder llegar a un final. Conviene dejar, en cada escena que no es final, una opción sin `si`.

`historia-de-prueba` es solo un ensayo para probar el lector. No es un relato de Crossroads.
