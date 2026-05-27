const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://mcdjysjrezxmghmvannh.supabase.co";
const SUPABASE_KEY = "sb_publishable_2zg1_mv94Gvpl8b3lZOvMQ_xRlrgrQS";

// Pretty Spanish Label Mapping for common field IDs
const LABEL_MAPPING = {
  'nombre': 'Nombre Completo',
  'fecha_visita': 'Fecha de Visita',
  'fecha_nacimiento': 'Fecha de Nacimiento',
  'lugar_nacimiento': 'Lugar de Nacimiento',
  'genero': 'Género / Sexo',
  'estado_civil': 'Estado Civil',
  'curp': 'CURP',
  'rfc': 'RFC',
  'edad': 'Edad',
  'telefono_casa': 'Teléfono de Casa',
  'telefono_recados': 'Teléfono de Recados',
  'celular': 'Celular',
  'correo': 'Correo Electrónico',
  'tipo_sangre': 'Tipo de Sangre',
  'licencia': 'Tiene Licencia',
  'tipo_licencia': 'Tipo de Licencia',
  'vencimiento_licencia': 'Vencimiento de Licencia',
  'contacto_emergencia': 'Contacto de Emergencia',
  'emergencia_nombre': 'Nombre del Contacto de Emergencia',
  'emergencia_telefono': 'Teléfono de Emergencia',
  'nombre_padre': 'Nombre del Padre',
  'nombre_madre': 'Nombre de la Madre',
  'tiempo_en_domicilio': 'Tiempo en Domicilio',
  'nss': 'NSS',
  'acta_de_nacimiento': 'Acta de Nacimiento',
  'afiliacion_al_imss': 'Afiliación al IMSS',
  'comprobante_de_domicilio': 'Comprobante de Domicilio',
  'comprobante_de_estudios': 'Comprobante de Estudios',
  'credencial_de_elector': 'Credencial de Elector',
  'licencia_de_manejo': 'Licencia de Manejo',
  'cartas_de_recomendacion': 'Cartas de Recomendación',
  'recibos_de_nomina': 'Recibos de Nómina',
  'credito_infonavit': 'Crédito INFONAVIT',
  'ingreso_familiar_mensual': 'Ingreso Familiar Mensual',
  'egreso_familiar_mensual': 'Egreso Familiar Mensual',
  'la_casa_que_habita_es': 'Tipo de Vivienda (Casa es)',
  'banos': 'Número de Baños',
  'cocina': 'Cocina',
  'sala': 'Sala',
  'comedor': 'Comedor',
  'cuarto_de_servicios': 'Cuarto de Servicios',
  'recamaras': 'Recámaras',
  'niveles': 'Niveles',
  'estacionamiento': 'Estacionamiento',
  'tatuajes': '¿Tiene Tatuajes?',
  'alergias': '¿Tiene Alergias?',
  'fuma': '¿Fuma?',
  'toma': '¿Toma?',
  'practica_algun_deporte': '¿Practica algún deporte?',
  'enfermedades_cronicas_o_hereditarias': 'Enfermedades Crónicas/Hereditarias'
};

function toSnakeCase(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,:;()[\]{}'"“”]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeName(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function getPrettyLabel(id) {
  if (LABEL_MAPPING[id]) return LABEL_MAPPING[id];
  // Auto convert snake_case to Title Case beautifully
  return id
    .split('_')
    .map(word => {
      if (['de', 'del', 'la', 'el', 'en', 'y', 'con', 'por', 'para', 'a'].includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

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
    text.includes('costo') || text.includes('cantidad') || text.includes('cp') || text.includes('postal') ||
    text.includes('banos') || text.includes('recamaras') || text.includes('niveles')
  ) {
    return 'number';
  }
  if (
    text.includes('comentario') || text.includes('observacion') || text.includes('descripcion') || 
    text.includes('detalle') || text.includes('historia') || text.includes('trayectoria') ||
    text.includes('conclusiones')
  ) {
    return 'textarea';
  }
  
  // Custom dropdown indicators
  if (id === 'tipo_sangre') return 'select';
  if (id === 'genero') return 'select';
  if (id === 'licencia') return 'select';
  
  return 'text';
}

function extractPlaceholders(mdContent) {
  const regex = /\{\{([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9_]+?)\}\}/g;
  const placeholders = new Set();
  let match;
  while ((match = regex.exec(mdContent)) !== null) {
    placeholders.add(match[1].trim());
  }
  return Array.from(placeholders);
}

async function run() {
  const rootDir = path.join(__dirname, "..");
  const mdDir = path.join(rootDir, "Plantillas_Markdown");
  
  console.log("=======================================================================");
  console.log("🛠️  VINCULADOR INTELIGENTE DE PLANTILLAS STANDARDIZADAS A SUPABASE");
  console.log("=======================================================================\n");
  
  // 1. Obtener plantillas existentes en Supabase para cruzar por nombre
  console.log("1. Consultando plantillas existentes en la base de datos...");
  let dbTemplates = [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/socioeconomic_templates?select=*`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      }
    });
    if (res.ok) {
      dbTemplates = await res.json();
      console.log(`   Se encontraron ${dbTemplates.length} plantillas registradas en Supabase.\n`);
    } else {
      console.error("   [ERROR] No se pudieron cargar las plantillas de Supabase. Status:", res.status);
      console.error(await res.text());
      return;
    }
  } catch (err) {
    console.error("   [EXCEPCIÓN] Error consultando Supabase:", err);
    return;
  }
  
  // 2. Escanear archivos Markdown locales
  console.log("2. Escaneando la carpeta de Plantillas_Markdown...");
  if (!fs.existsSync(mdDir)) {
    console.error(`   [ERROR] No existe la carpeta ${mdDir}`);
    return;
  }
  
  const files = fs.readdirSync(mdDir).filter(f => f.endsWith(".md") && !f.startsWith("_"));
  console.log(`   Se encontraron ${files.length} archivos de plantilla Markdown listos.\n`);
  
  let successCount = 0;
  let addedCount = 0;
  let updatedCount = 0;
  
  // 3. Procesar y vincular cada plantilla
  for (let i = 0; i < files.length; i++) {
    const fname = files[i];
    const templateName = fname.replace(/\.md$/i, "");
    const filePath = path.join(mdDir, fname);
    
    // Leer contenido del archivo md
    const mdContent = fs.readFileSync(filePath, "utf-8");
    const placeholders = extractPlaceholders(mdContent);
    
    // Buscar si existe en la base de datos por coincidencia de nombre normalizado
    const normLocal = normalizeName(templateName);
    const existing = dbTemplates.find(t => normalizeName(t.name) === normLocal);
    
    // Obtener esquema existente si lo hay
    const existingSchema = existing ? (existing.form_schema || []) : [];
    const sectionsConfigField = existingSchema.find(f => f.id === '__sections_config__');
    
    // Construir nuevo form_schema mezclando inteligentemente propiedades guardadas (ej. opciones de dropdowns, dependencias)
    const newSchema = [];
    
    placeholders.forEach(key => {
      const existingField = existingSchema.find(f => f.id === key);
      
      if (existingField) {
        // Preservar campo existente con todas sus configuraciones y reglas de Supabase
        newSchema.push(existingField);
      } else {
        // Crear campo nuevo de forma robusta e inteligente
        const label = getPrettyLabel(key);
        const tipo = detectInputType(key, label);
        
        const newField = {
          id: key,
          label: label,
          tipo: tipo,
          requerido: true,
          placeholder: `Ingrese ${label.toLowerCase()}`,
          autogenerado: false
        };
        
        // Inyectar opciones para tipos select estándar
        if (key === 'tipo_sangre') {
          newField.opciones = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'No sabe'];
        } else if (key === 'genero') {
          newField.opciones = ['Masculino', 'Femenino'];
        } else if (key === 'licencia') {
          newField.opciones = ['No tiene', 'Sí tiene'];
        }
        
        newSchema.push(newField);
      }
    });
    
    // Inyectar la configuración especial de secciones si existía previamente
    if (sectionsConfigField) {
      newSchema.push(sectionsConfigField);
    }
    
    // Preparar payload para la base de datos
    const payload = {
      name: templateName,
      form_schema: newSchema,
      updated_at: new Date().toISOString()
    };
    
    let url = `${SUPABASE_URL}/rest/v1/socioeconomic_templates`;
    let method = "POST";
    let headers = {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    };
    
    if (existing) {
      // Si existe, hacemos PATCH filtrado por id
      url += `?id=eq.${existing.id}`;
      method = "PATCH";
      updatedCount++;
      console.log(`[${i+1}/${files.length}] 🔄 Actualizando plantilla: "${templateName}" (ID existente: ${existing.id}) | ${placeholders.length} campos detectados...`);
    } else {
      // Si es nueva, generamos un drive_file_id local y hacemos POST
      payload.drive_file_id = `local_template_${toSnakeCase(templateName)}`;
      payload.created_at = new Date().toISOString();
      addedCount++;
      console.log(`[${i+1}/${files.length}] 🆕 Registrando nueva plantilla: "${templateName}" | ${placeholders.length} campos detectados...`);
    }
    
    try {
      const res = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        successCount++;
      } else {
        console.error(`   [ERROR] Error al sincronizar "${templateName}". Status: ${res.status}`);
        console.error(await res.text());
      }
    } catch (err) {
      console.error(`   [EXCEPCIÓN] Fallo al subir "${templateName}":`, err);
    }
  }
  
  console.log("\n=======================================================================");
  console.log("🎉 PROCESO DE VINCULACIÓN COMPLETADO CON ÉXITO");
  console.log("=======================================================================");
  console.log(`- Total de plantillas procesadas localmente: ${files.length}`);
  console.log(`- Sincronizadas con éxito en Supabase: ${successCount}/${files.length}`);
  console.log(`  * Plantillas actualizadas (existentes): ${updatedCount}`);
  console.log(`  * Plantillas nuevas creadas en BD: ${addedCount}`);
  console.log("=======================================================================\n");
}

run();
