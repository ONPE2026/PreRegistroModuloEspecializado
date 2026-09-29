/**
 * ERM2026 - Prerregistro Módulo Especializado
 * Backend en Google Apps Script para el formulario index.html.
 *
 * CÓMO USARLO:
 * 1. Crea una Google Sheet nueva (o usa una que ya tengas para ERM2026).
 * 2. En esa Sheet: Extensiones > Apps Script.
 * 3. Borra el contenido de Code.gs que aparece por defecto y pega este archivo completo.
 * 4. Ajusta, si quieres, el nombre de la hoja en SHEET_NAME (abajo).
 * 5. Implementar > Nueva implementación > tipo "Aplicación web":
 *      - Ejecutar como: Yo (tu cuenta)
 *      - Quién tiene acceso: Cualquier usuario
 *    Copia la URL que termina en /exec.
 * 6. Pega esa URL en la constante API_URL de index.html (reemplaza la de EG2026).
 * 7. Prueba: llena el formulario y revisa que aparezca una fila nueva en la hoja
 *    "Registros" (se crea sola la primera vez que alguien envía o valida algo).
 */

const SHEET_NAME = 'Registros';

// Columnas cuyo valor puede empezar con '+' (como el celular con código de país)
// y por eso deben forzarse a texto, o Sheets las toma como el inicio de una fórmula.
const COLUMNAS_TEXTO_FORZADO = ['celular'];

const COLUMNAS = [
  'marcaTemporal',
  'submissionId',
  'sentAt',
  'tipoInstitucion',
  'tipoInstitucionLabel',
  'entidadNombre',
  'paisNombre',
  'ruc',
  'tipoDocumento',
  'tipoDocumentoLabel',
  'numeroDocumento',
  'nombres',
  'apellidos',
  'celular',
  'correoElectronico'
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'checkInstitution') {
      return responderJson(manejarCheckInstitution(body));
    }

    if (action === 'submitRegistration') {
      return responderJson(manejarSubmitRegistration(body));
    }

    return responderJson({ status: 'error', message: 'Acción no reconocida.' });
  } catch (error) {
    return responderJson({ status: 'error', message: String(error) });
  }
}

// Algunos navegadores (sendBeacon con no-cors, o llamadas de prueba) hacen GET;
// respondemos algo simple para que no truene si alguien abre la URL directo.
function doGet(e) {
  return ContentService.createTextOutput('ERM2026 - Prerregistro: endpoint activo.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function manejarCheckInstitution(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const hoja = obtenerHoja();
    const filas = hoja.getDataRange().getValues();
    const encabezados = filas[0];

    const idxTipo = encabezados.indexOf('tipoInstitucion');
    const idxEntidad = encabezados.indexOf('entidadNombre');
    const idxPais = encabezados.indexOf('paisNombre');

    const tipo = normalizar(body.tipoInstitucion);
    const entidadNombre = normalizar(body.entidadNombre);
    const paisNombre = normalizar(body.paisNombre);

    for (let i = 1; i < filas.length; i++) {
      const fila = filas[i];
      const mismoTipo = normalizar(fila[idxTipo]) === tipo;
      const mismaEntidad = normalizar(fila[idxEntidad]) === entidadNombre;

      if (!mismoTipo || !mismaEntidad) continue;

      if (tipo === 'mision_observacion') {
        const mismoPais = normalizar(fila[idxPais]) === paisNombre;
        if (mismoPais) return { status: 'duplicate' };
      } else {
        return { status: 'duplicate' };
      }
    }

    return { status: 'available' };
  } finally {
    lock.releaseLock();
  }
}

function manejarSubmitRegistration(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const hoja = obtenerHoja();

    // Deduplicar reintentos: sendWithInvisibleRetries() puede mandar el mismo
    // submissionId hasta 3-4 veces. Si ya existe, no lo volvemos a insertar.
    if (body.submissionId && yaExisteSubmission(hoja, body.submissionId)) {
      return { status: 'ok', deduped: true };
    }

    const fila = COLUMNAS.map((col) => {
      if (col === 'marcaTemporal') return new Date();
      const valor = body[col] !== undefined ? body[col] : '';
      if (COLUMNAS_TEXTO_FORZADO.indexOf(col) !== -1 && valor !== '') {
        return "'" + valor; // fuerza texto: evita que "+51 9..." se lea como fórmula
      }
      return valor;
    });

    hoja.appendRow(fila);
    return { status: 'ok' };
  } finally {
    lock.releaseLock();
  }
}

function yaExisteSubmission(hoja, submissionId) {
  const filas = hoja.getDataRange().getValues();
  const encabezados = filas[0];
  const idx = encabezados.indexOf('submissionId');
  if (idx === -1) return false;

  for (let i = 1; i < filas.length; i++) {
    if (filas[i][idx] === submissionId) return true;
  }
  return false;
}

function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(SHEET_NAME);

  if (!hoja) {
    hoja = libro.insertSheet(SHEET_NAME);
    hoja.appendRow(COLUMNAS);
    hoja.setFrozenRows(1);

    COLUMNAS_TEXTO_FORZADO.forEach((col) => {
      const idx = COLUMNAS.indexOf(col);
      if (idx === -1) return;
      // Columna completa (menos el encabezado) como texto plano ('@').
      hoja.getRange(2, idx + 1, hoja.getMaxRows() - 1, 1).setNumberFormat('@');
    });
  }

  return hoja;
}

function normalizar(valor) {
  return String(valor || '').trim().toUpperCase();
}

function responderJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
