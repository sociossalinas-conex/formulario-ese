/**
 * Ecosistema de Automatización de Estudios Socioeconómicos
 * Backend de Sincronización Inteligente: Google Drive Docs a Supabase JSON Schemas
 * 
 * Desarrollado por: Arquitecto de Software Senior y Desarrollador Full-Stack
 */

const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno desde el archivo .env en admin-script/
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Configuración de constantes y fallback
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mcdjysjrezxmghmvannh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_2zg1_mv94Gvpl8b3lZOvMQ_xRlrgrQS';
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || '1M6naHKDM1HLCQvEbyq4tysiskXHD7uIW';
const CREDENTIALS_PATH = path.join(__dirname, '../config/credentials.json');

// Inicializar Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Función de normalización: Title Case manteniendo preposiciones en minúscula.
 * @param {string} str - Texto a normalizar
 * @returns {string} Texto normalizado
 */
function normalizeTitleCase(str) {
  if (!str) return '';
  
  // Preposiciones, artículos y conjunciones comunes en español que deben permanecer en minúscula
  const lowercaseWords = new Set([
    'de', 'del', 'la', 'las', 'el', 'los', 'en', 'y', 'o', 'u', 'con', 'por', 
    'para', 'a', 'e', 'un', 'una', 'unos', 'unas', 'sin', 'sobre', 'tras'
  ]);
  
  // Limpiar espacios y separar palabras
  const words = str.trim().toLowerCase().split(/\s+/);
  
  const formattedWords = words.map((word, index) => {
    // Quitar signos de puntuación comunes para validar si es preposición
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '');
    
    // Mantener en minúscula si está en el conjunto y NO es la primera palabra
    if (lowercaseWords.has(cleanWord) && index !== 0) {
      return word;
    }
    
    // Capitalizar la primera letra del resto de palabras
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  
  return formattedWords.join(' ');
}

/**
 * Normaliza nombres técnicos para convertirlos en identificadores (snake_case)
 * @param {string} str - Nombre o pregunta
 * @returns {string} ID técnico en snake_case
 */
function toSnakeCase(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD') // Quitar acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,:;()[\]{}'"“”]/g, '') // Eliminar puntuación
    .replace(/\s+/g, '_') // Espacios a guiones bajos
    .replace(/[^a-z0-9_]/g, '') // Eliminar caracteres no permitidos
    .replace(/_+/g, '_') // Evitar guiones bajos duplicados
    .replace(/^_+|_+$/g, ''); // Limpiar extremos
}

/**
 * Detecta el tipo de input idóneo según la etiqueta y la llave
 * @param {string} id - ID en snake_case
 * @param {string} label - Etiqueta legible
 * @returns {string} Tipo de input HTML
 */
function detectInputType(id, label) {
  const text = `${id} ${label}`.toLowerCase();
  
  if (text.includes('telefono') || text.includes('celular') || text.includes('tel') || text.includes('movil')) {
    return 'tel';
  }
  if (text.includes('correo') || text.includes('email') || text.includes('mail')) {
    return 'email';
  }
  if (text.includes('fecha') || text.includes('nacimiento') || text.includes('dia') || text.includes('mes') || text.includes('año')) {
    return 'date';
  }
  if (
    text.includes('edad') || text.includes('numero') || text.includes('monto') || 
    text.includes('sueldo') || text.includes('ingreso') || text.includes('egreso') || 
    text.includes('costo') || text.includes('cantidad') || text.includes('cp') || text.includes('postal')
  ) {
    return 'number';
  }
  if (
    text.includes('comentario') || text.includes('observacion') || text.includes('descripcion') || 
    text.includes('detalle') || text.includes('historia') || text.includes('trayectoria')
  ) {
    return 'textarea';
  }
  
  // Opciones booleanas o selección
  if (text.includes('tiene') || text.includes('cuenta con') || text.startsWith('es_') || text.startsWith('tiene_')) {
    // Dejamos text por defecto, pero marcamos como seleccionable en el frontend si es necesario
    return 'text'; 
  }
  
  return 'text';
}

/**
 * Extrae todo el texto plano de la estructura JSON del cuerpo de un Google Doc
 * @param {object} documentData - Datos del documento de la API de Google Docs
 * @returns {string} Texto acumulado
 */
function extractTextFromGoogleDoc(documentData) {
  let text = '';
  if (!documentData.body || !documentData.body.content) return text;
  
  const processElements = (elements) => {
    for (const element of elements) {
      if (element.paragraph) {
        for (const run of element.paragraph.elements) {
          if (run.textRun) {
            text += run.textRun.content;
          }
        }
      } else if (element.table) {
        for (const row of element.table.tableRows) {
          for (const cell of row.tableCells) {
            processElements(cell.content);
          }
        }
      } else if (element.tableOfContents) {
        processElements(element.tableOfContents.content);
      }
    }
  };
  
  processElements(documentData.body.content);
  return text;
}

/**
 * Parsea el texto del documento para extraer las preguntas y asociarles llaves.
 * Genera automáticamente llaves si el campo no las tiene de forma explícita.
 * @param {string} docText - Texto completo del documento
 * @returns {Array<object>} Esquema de campos JSON
 */
function parseDocumentFields(docText) {
  const fields = [];
  const lines = docText.split('\n');
  const seenIds = new Set();
  
  console.log(`\n--- INICIO DEL ANÁLISIS DE CAMPOS ---`);
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Ignorar títulos grandes u orientativos que no tengan pinta de ser preguntas o campos
    if (line.length > 150) continue;
    
    // Expresión regular para buscar llaves explícitas: {{llave}}
    const bracesRegex = /\{\{([^}]+)\}\}/;
    const bracesMatch = line.match(bracesRegex);
    
    if (bracesMatch) {
      // Caso 1: Tiene llaves explícitas
      const rawId = bracesMatch[1].trim();
      const id = toSnakeCase(rawId);
      
      // La etiqueta es todo el texto antes de las llaves, limpio
      let label = line.replace(bracesRegex, '').trim();
      label = label.replace(/[:_]+$/, '').trim(); // Quitar dos puntos y guiones finales
      
      if (!label) {
        label = normalizeTitleCase(rawId);
      } else {
        label = normalizeTitleCase(label);
      }
      
      if (!id || seenIds.has(id)) continue;
      seenIds.add(id);
      
      const tipo = detectInputType(id, label);
      
      fields.push({
        id,
        label,
        tipo,
        requerido: true,
        placeholder: `Ingrese ${label.toLowerCase()}`,
        autogenerado: false
      });
      
      console.log(`[Explícito] ID: ${id} | Etiqueta: "${label}" | Tipo: ${tipo}`);
    } else {
      // Caso 2: No tiene llaves explícitas, pero parece una pregunta o campo
      // Detectamos si tiene dos puntos (:), signo de interrogación final (?), o marcas de llenado (___, [ ])
      const isQuestion = line.endsWith('?') || line.includes('?');
      const hasColon = line.includes(':');
      const hasFillLines = line.includes('__') || line.includes('[ ]') || line.includes('[]');
      
      if (isQuestion || hasColon || hasFillLines) {
        // Extraer la etiqueta antes de los dos puntos o las líneas de llenado
        let rawLabel = line;
        if (hasColon) {
          rawLabel = line.split(':')[0];
        } else if (hasFillLines) {
          rawLabel = line.replace(/[_|[\]]+/g, '');
        }
        
        rawLabel = rawLabel.trim();
        if (rawLabel.length < 3 || rawLabel.length > 80) continue; // Descartar textos extraños
        
        const label = normalizeTitleCase(rawLabel);
        const id = toSnakeCase(rawLabel);
        
        if (!id || seenIds.has(id)) continue;
        seenIds.add(id);
        
        const tipo = detectInputType(id, label);
        
        fields.push({
          id,
          label,
          tipo,
          requerido: true,
          placeholder: `Ingrese ${label.toLowerCase()}`,
          autogenerado: true // Alerta de que no venía con llaves en el Doc original
        });
        
        console.log(`[Autogenerado] ID: ${id} (para "{{${id}}}") | Etiqueta: "${label}" | Tipo: ${tipo}`);
      }
    }
  }
  
  console.log(`--- FIN DEL ANÁLISIS. Total campos detectados: ${fields.length} ---\n`);
  return fields;
}

/**
 * Función Principal de Sincronización
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  console.log('================================================================');
  console.log('Sincronizador de Estudios Socioeconómicos - Google Docs a Supabase');
  console.log(`Modo: ${dryRun ? 'DRY-RUN (Simulación sin guardar en base de datos)' : 'PRODUCCIÓN (Sincronización real)'}`);
  console.log('================================================================\n');
  
  // 1. Validar la existencia de credentials.json
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`[ERROR] No se encontró el archivo de credenciales de Google en: ${CREDENTIALS_PATH}`);
    console.error('Por favor, coloca tu archivo JSON de Cuenta de Servicio allí y vuelve a ejecutar.');
    process.exit(1);
  }
  
  try {
    // 2. Autenticar con Google Drive usando Cuenta de Servicio
    console.log('1. Autenticando con Google Service Account...');
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/documents.readonly'
      ],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    const docs = google.docs({ version: 'v1', auth });
    
    // 3. Listar archivos de Google Docs en la carpeta del Drive
    console.log(`2. Listando archivos de la carpeta Drive ID: ${DRIVE_FOLDER_ID}...`);
    const listResponse = await drive.files.list({
      q: `'${DRIVE_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.document' and trashed = false`,
      fields: 'files(id, name)',
    });
    
    const files = listResponse.data.files;
    
    if (!files || files.length === 0) {
      console.log('No se encontraron archivos nativos de Google Docs en la carpeta especificada.');
      return;
    }
    
    console.log(`Se encontraron ${files.length} plantilla(s) de Google Docs:\n`);
    for (const file of files) {
      console.log(` - [${file.id}] ${file.name}`);
    }
    
    // 4. Procesar cada archivo encontrado
    for (const file of files) {
      console.log(`\n========================================================`);
      console.log(`Procesando Plantilla: "${file.name}" (ID: ${file.id})`);
      console.log(`========================================================`);
      
      // Obtener el contenido detallado del documento
      const docResponse = await docs.documents.get({
        documentId: file.id
      });
      
      const docText = extractTextFromGoogleDoc(docResponse.data);
      const schema = parseDocumentFields(docText);
      
      if (schema.length === 0) {
        console.warn(`[ADVERTENCIA] No se pudieron extraer campos de la plantilla "${file.name}". Verifica el formato.`);
        continue;
      }
      
      const payload = {
        drive_file_id: file.id,
        name: normalizeTitleCase(file.name.replace(/\.docx?$/i, '')),
        form_schema: schema,
        updated_at: new Date().toISOString()
      };
      
      if (dryRun) {
        console.log(`[DRY-RUN] Datos listos para guardar para "${payload.name}":`);
        console.log(JSON.stringify(payload, null, 2));
      } else {
        console.log(`Subiendo esquema de "${payload.name}" a Supabase...`);
        
        // Intentar upsert en Supabase
        const { data, error } = await supabase
          .from('socioeconomic_templates')
          .upsert(payload, { onConflict: 'drive_file_id' })
          .select();
        
        if (error) {
          console.error(`[ERROR SUPABASE] Ocurrió un error al subir a Supabase:`);
          console.error(error);
          
          if (error.code === '42P01') {
            console.error('\n[SUGERENCIA] Parece que la tabla "socioeconomic_templates" no existe en Supabase.');
            console.error('Por favor, ejecuta el siguiente query SQL en la consola de Supabase:\n');
            console.error(`
create table socioeconomic_templates (
  id uuid default gen_random_uuid() primary key,
  drive_file_id text unique not null,
  name text not null,
  form_schema jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
            `);
          }
        } else {
          console.log(`[ÉXITO] Plantilla "${payload.name}" guardada/actualizada con éxito en Supabase.`);
          console.log(`Campos registrados: ${schema.length}`);
        }
      }
    }
    
    console.log('\nSincronización finalizada con éxito.');
  } catch (err) {
    console.error('\n[ERROR FATAL] Ocurrió un error inesperado durante el proceso:');
    console.error(err.message || err);
  }
}

// Ejecutar el script principal
main();
