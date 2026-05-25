/**
 * Code.gs
 * Punto de entrada principal y API (Controlador)
 */

function doGet(e) {
  // Inicializar esquema si es la primera vez (silenciosamente)
  try {
      SheetsService.initializeSchema();
  } catch(err) {
      console.warn("Fallo inicialización de esquema: " + err);
  }

  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Estudio Socioeconómico')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * ==========================================
 * API PARA EL FRONTEND (google.script.run)
 * ==========================================
 */

function getClientList() {
  return SheetsService.getClientList();
}

function getFormConfiguration(clienteId) {
  return SheetsService.getFormConfiguration(clienteId);
}

function suggestCurpRfc(datos) {
  return CurpRfcService.suggestCurpRfc(datos);
}

function uploadPhoto(base64Data, fileName, clientName, candidateName) {
  return DocsService.uploadPhoto(base64Data, fileName, clientName, candidateName);
}

function saveStudy(data) {
  try {
    var clienteId = data.cliente_id;
    var candidateName = data.nombre_completo || 'Desconocido';
    var clientName = DocsService.getClientName(clienteId);
    
    // Generar ID
    var studyId = data.id_estudio;
    if (!studyId) {
      studyId = generateStudyId(clientName);
      data.id_estudio = studyId;
    }
    
    // Validar integridad (Opcional, previene fallos)
    // var validation = SheetsService.validateDataIntegrity(data, schema);
    
    // 1. Escribir fila en base de datos Sheets
    var resultSheets = SheetsService.writeStudyRow(studyId, clienteId, data);
    
    // 2. Generar Documento final en PDF/Docs
    var resultDocs = DocsService.generateDocument(studyId, data, clienteId);
    
    if (resultSheets.success && resultDocs.success) {
      return { success: true, studyId: studyId };
    } else {
      return { success: false, error: resultDocs.error || "Error en guardado" };
    }
    
  } catch(e) {
    console.error("Error global guardando estudio: " + e);
    return { success: false, error: e.toString() };
  }
}

/**
 * ==========================================
 * UTILIDADES
 * ==========================================
 */

function generateStudyId(clientName) {
  var prefix = String(clientName).substring(0, 3).toUpperCase();
  if (prefix.length < 3) prefix = 'CLI';
  
  var now = new Date();
  var meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  
  var d = ('0' + now.getDate()).slice(-2);
  var m = meses[now.getMonth()];
  var y = now.getFullYear();
  
  var rnd = Math.floor(Math.random() * 900) + 100; // 3 digits random to avoid collisions
  
  return prefix + '-' + d + m + y + '-' + rnd;
}

/**
 * Función manual para sincronizar esquema del template con base de datos.
 * Se debe ejecutar manualmente o mediante menú administrativo.
 */
function syncSchemaWithTemplates() {
   // Esta función leería los templates activos y extraería los {{marcadores}} 
   // usando RegEx sobre el body, y luego llamaría a SheetsService.addMissingColumns.
   // Por ahora está implementada en tiempo de guardado dinámicamente en SheetsService.writeStudyRow.
}

/**
 * Función de diagnóstico y autorización.
 * Ejecútala manualmente desde el editor de Google Apps Script para otorgar permisos de Drive y Sheets.
 */
function testSystem() {
  console.log("Iniciando prueba de diagnóstico del sistema...");
  try {
    console.log("Intentando obtener la hoja de cálculo...");
    var ss = SheetsService.getSpreadsheet();
    console.log("¡Éxito! Hoja de cálculo obtenida: " + ss.getName() + " (ID: " + ss.getId() + ")");
    
    console.log("Inicializando esquema de base de datos...");
    SheetsService.initializeSchema();
    console.log("¡Éxito! Esquema inicializado correctamente.");
    
    console.log("Consultando lista de clientes...");
    var clientes = SheetsService.getClientList();
    console.log("¡Éxito! Clientes encontrados: " + JSON.stringify(clientes));
    
    console.log("--- DIAGNÓSTICO EXITOSO ---");
  } catch (e) {
    console.error("--- FALLO EN EL DIAGNÓSTICO ---");
    console.error(e.toString());
    throw e;
  }
}
