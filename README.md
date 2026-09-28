# ERM2026 - Prerregistro Módulo Especializado

Formulario de prerregistro para el módulo especializado de las Elecciones Regionales y Municipales 2026 (ERM2026), adaptado a partir del formulario de `RegistroModuloEspecializado` (EG2026).

## Qué cambia respecto al formulario de EG2026

- **Título de la página:** "ERM2026 - Prerregistro Módulo Especializado".
- **Vigencia del registro:** ya no espera una fecha de apertura; el formulario está disponible desde que se publica y se cierra automáticamente a partir del **5 de octubre de 2026, 00:00 (hora de Perú)** — es decir, el último día para registrarse es el **4 de octubre de 2026**. Esto se controla en la función `formularioHabilitado()` dentro de `index.html`.
- **Banner:** se reemplazó la imagen `banner.jpg` por un banner-placeholder en CSS/HTML ("ERM 2026 · Prerregistro — Módulo Especializado · Próximamente el banner oficial"), para no depender de una imagen final que aún no existe. Cuando tengas el banner definitivo, puedes volver a usar una etiqueta `<img class="banner" src="...">` en los dos lugares donde aparece `.banner-placeholder` (pantalla de espera/cerrado y pantalla del formulario), o simplemente reemplazar el contenido del `<div class="banner banner-placeholder">`.
- **Resto del formulario:** sin cambios — mismos campos, mismas validaciones, mismos JSON de catálogos (`instituciones_publicas.json`, `organizaciones_politicas.json`, `misiones_observacion.json`, `encuestadoras_vigentes.json`, `paises.json`), copiados idénticos desde el repositorio original.

## Pendiente antes de publicar

1. **`API_URL`** (dentro de `index.html`): actualmente apunta al mismo Web App de Google Apps Script que usa el formulario de EG2026. Si no quieres mezclar los registros de ERM2026 con los de EG2026 en la misma hoja/base, crea un Web App independiente para ERM2026 y reemplaza el valor de `API_URL`.
2. **Correo de contacto en el pie de página:** el archivo original tenía el correo ofuscado por Cloudflare (`data-cfemail`) y el HTML llegó cortado/incompleto en ese punto (sin cerrar `</a>`, `</body>`, `</html>`). Se reparó el HTML y se dejó un placeholder `CORREO_PENDIENTE_DE_DEFINIR@onpe.gob.pe` en su lugar — reemplázalo por el correo de contacto real de ERM2026 antes de publicar.
3. Cuando tengas el banner definitivo, súbelo (por ejemplo como `banner.jpg`) y actualiza las referencias como se indica arriba.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo (por ejemplo `ERM2026-PrerregistroModuloEspecializado`) en la organización que corresponda.
2. Sube el contenido de esta carpeta.
3. Activa GitHub Pages (rama `main`, carpeta raíz).
4. Actualiza `API_URL` y el correo de contacto según los puntos pendientes arriba.
