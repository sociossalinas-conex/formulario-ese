/**
 * Ecosistema de Automatización de Estudios Socioeconómicos
 * Frontend SPA Logic: app.js
 * 
 * Desarrollado por: Arquitecto de Software Senior y Desarrollador Full-Stack
 */

// 1. Inicialización Resiliente de Supabase Client
const SUPABASE_URL = "https://mcdjysjrezxmghmvannh.supabase.co";
const SUPABASE_KEY = "sb_publishable_2zg1_mv94Gvpl8b3lZOvMQ_xRlrgrQS";
let supabaseInstance = null;

function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;
  
  try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      return supabaseInstance;
    }
  } catch (err) {
    console.error("Error al inicializar el cliente de Supabase:", err);
  }
  return null;
}

// Funciones globales para etiquetas de ayuda y autocompletar candidatos
window.toggleHelpBlock = function(fieldId) {
  const block = document.getElementById(`help-block-${fieldId}`);
  if (block) {
    const isHidden = block.style.display === 'none';
    block.style.display = isHidden ? 'block' : 'none';
  }
};

window.loadCandidateData = function(capturedData, candidateExactName) {
  if (!capturedData) return;

  // Actualizar el nombre del candidato con el nombre exacto
  const candidateInput = document.getElementById('candidate-name-input');
  if (candidateInput) {
    candidateInput.value = candidateExactName;
    // Sincronizar sticky header
    const stickyHeader = document.getElementById('nav-candidate-name-container');
    const stickyName = document.getElementById('nav-candidate-name-text');
    if (stickyHeader && stickyName) {
      stickyHeader.style.display = 'flex';
      stickyName.innerText = candidateExactName;
    }
  }

  // Llenar cada campo del formulario
  let loadedCount = 0;
  Object.keys(capturedData).forEach(key => {
    const el = document.getElementById(`field-${key}`);
    if (el) {
      el.value = capturedData[key];
      // Trigger event to make sure conditional and mirroring logic runs!
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      loadedCount++;
    }
  });

  // Casos especiales (por ejemplo, detalles de demandas)
  if (capturedData['demandas_detalles']) {
    const demandasDetailsEl = document.getElementById('field-demandas-details');
    if (demandasDetailsEl) {
      demandasDetailsEl.value = capturedData['demandas_detalles'];
      demandasDetailsEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const demandasSelect = document.getElementById('field-demandas');
    if (demandasSelect) {
      demandasSelect.value = 'Sí';
      demandasSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Actualizar barra de progreso
  if (state && state.matchedTemplate && state.matchedTemplate.form_schema) {
    setupProgressTracking(state.matchedTemplate.form_schema);
  }

  // Esconder banner
  const banner = document.getElementById('candidate-lookup-banner');
  if (banner) banner.style.display = 'none';

  alert(`¡Datos del estudio previo cargados con éxito! (${loadedCount} campos autocompletados).`);
};

// Intentar inicialización inmediata
getSupabaseClient();

// 2. Estado Global de la Aplicación
let state = {
  templates: [],         // Lista de plantillas disponibles sincronizadas de Drive
  mappings: [],          // Mapeos de Cliente -> Nombre Comercial (Conexion Ejecutiva, etc.)
  capturesCount: 0,      // Total de capturas realizadas
  matchedTemplate: null, // Plantilla seleccionada actualmente en el formulario
  resolvedBrand: "Conexion Ejecutiva" // Nombre comercial resuelto para el cliente actual
};

// Mapeos locales de fallback en caso de que la tabla de Supabase no esté creada todavía
const localMappingsFallback = [
  { id: 1, client_name: "Google", commercial_brand: "Conexion Ejecutiva", config: {} },
  { id: 2, client_name: "Microsoft", commercial_brand: "Recurso Humano", config: {} },
  { id: 3, client_name: "Amazon", commercial_brand: "Nomipago", config: {} }
];

const brandLogos = {
  "Recurso Humano": "https://assets.zyrosite.com/mv0jx9EpjqtvVQwL/logo-recurso-humano-Yg2l1O8NW6H1Ok4r.webp",
  "Conexion Ejecutiva": "https://assets.zyrosite.com/mv0jx9EpjqtvVQwL/logo-conexion-ejecutiva-84xrFITDnFmwdUj0.webp",
  "Nomipago": "https://assets.zyrosite.com/mv0jx9EpjqtvVQwL/logo-nomipago-xJIve4m4PMtAmyvE.webp"
};

// ==========================================================================
// CONTROLADOR DE NAVEGACIÓN SPA DE ALTA FIDELIDAD
// ==========================================================================

function navigateTo(viewId) {
  // Ocultar todas las vistas y remover animación
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });

  // Habilitar adaptabilidad de escritorio para el Dashboard del Administrador
  const appContainer = document.querySelector('.app-container');
  if (viewId === 'view-admin-dashboard') {
    appContainer.classList.add('dashboard-active');
  } else {
    appContainer.classList.remove('dashboard-active');
  }

  // Activar la vista solicitada y disparar animación
  const activeView = document.getElementById(viewId);
  if (activeView) {
    activeView.classList.add('active');
    
    // Reinicializar iconos Lucide para nuevos elementos inyectados
    lucide.createIcons();
  }
}

// ==========================================================================
// CONTROL DE INICIO DE SESIÓN DEL ADMINISTRADOR (CREDANCIALES SEGURAS)
// ==========================================================================

function handleAdminLogin() {
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const errorMsg = document.getElementById('login-error-msg');

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Credenciales obligatorias indicadas por el usuario: Conex.369 / VanyaMtz06
  if (username === "Conex.369" && password === "VanyaMtz06") {
    errorMsg.classList.remove('active');
    errorMsg.innerText = "";
    
    // Limpiar campos
    usernameInput.value = "";
    passwordInput.value = "";
    
    // Cargar datos administrativos e ingresar
    loadAdminData();
    navigateTo('view-admin-dashboard');
  } else {
    errorMsg.innerText = "El usuario o la contraseña son incorrectos. Verifique.";
    errorMsg.classList.add('active');
  }
}

// ==========================================================================
// CARGAR DATOS EN PANEL DEL ADMINISTRADOR (KPIs Y CRUD MAPEOS)
// ==========================================================================

async function loadAdminData() {
  console.log("Cargando datos administrativos...");
  
  // 1. Obtener total de plantillas sincronizadas desde Supabase
  try {
    const client = getSupabaseClient();
    if (!client) throw new Error("Base de datos inaccesible.");
    
    const { data: templates, error } = await client
      .from('socioeconomic_templates')
      .select('*');
      
    if (!error && templates) {
      state.templates = templates;
      document.getElementById('kpi-templates-count').innerText = templates.length;
    }
  } catch (err) {
    console.error("Error al cargar plantillas en dashboard:", err);
  }

  // 2. Obtener mapeo de marcas comerciales
  await fetchClientMappings();

  // 3. Obtener conteo de capturas realizadas
  await fetchCapturesCount();
}

/**
 * Obtiene los mapeos de la base de datos de Supabase o usa el fallback local
 */
async function fetchClientMappings() {
  try {
    const client = getSupabaseClient();
    if (!client) throw new Error("Base de datos inaccesible.");

    const { data: dbMappings, error } = await client
      .from('client_mappings')
      .select('*');

    if (error) {
      console.warn("La tabla 'client_mappings' no existe o está inaccesible. Usando fallback local.");
      state.mappings = [...localMappingsFallback];
    } else if (dbMappings) {
      state.mappings = dbMappings;
    }
  } catch (err) {
    console.error("Falla de red al obtener mapeos. Usando fallback.");
    state.mappings = [...localMappingsFallback];
  }
  
  // Renderizar la tabla de mapeos y actualizar KPI
  renderMappingsTable();
  document.getElementById('kpi-mappings-count').innerText = state.mappings.length;
}

/**
 * Obtiene el conteo de capturas de la tabla correspondiente
 */
async function fetchCapturesCount() {
  try {
    const client = getSupabaseClient();
    if (!client) throw new Error("Base de datos inaccesible.");

    const { count, error } = await client
      .from('socioeconomic_captures')
      .select('*', { count: 'exact', head: true });

    if (!error) {
      state.capturesCount = count || 0;
    } else {
      state.capturesCount = 0;
    }
  } catch (err) {
    state.capturesCount = 0;
  }
  document.getElementById('kpi-captures-count').innerText = state.capturesCount;
}

/**
 * Dibuja la tabla de mapeo de marcas comerciales de forma responsiva
 */
function renderMappingsTable() {
  const tableBody = document.getElementById('mappings-table-body');
  tableBody.innerHTML = "";

  if (state.mappings.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-muted py-4">No hay mapeos de clientes registrados.</td>
      </tr>
    `;
    return;
  }

  // Guardar datos de mapeos en un mapa global para acceso seguro desde onclick
  window._mappingsById = {};
  state.mappings.forEach(m => {
    window._mappingsById[String(m.id)] = m;
  });

  state.mappings.forEach(mapping => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHTML(mapping.client_name)}</strong></td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="${brandLogos[mapping.commercial_brand] || brandLogos['Conexion Ejecutiva']}" style="height: 24px; object-fit: contain; padding: 2px; border-radius: 4px; background: rgba(0,0,0,0.05);" alt="Logo">
          <span class="commercial-badge">
            ${escapeHTML(mapping.commercial_brand)}
          </span>
        </div>
      </td>
      <td class="text-right">
        <div class="actions-row">
          <button class="btn-table-action edit" onclick="openEditMappingModal('${mapping.id}')">
            <i data-lucide="edit-3"></i>
          </button>
          <button class="btn-table-action delete" onclick="handleDeleteMapping('${mapping.id}')">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
  
  lucide.createIcons();
}

// ==========================================================================
// SEGURIDAD: VERIFICACIÓN DE EMPRESA (BÚSQUEDA CASE-INSENSITIVE SIN PISTAS)
// ==========================================================================

async function verifyAndLoadCompany() {
  const companyInput = document.getElementById('company-name-input');
  const validationMsg = document.getElementById('company-validation-msg');
  const inputVal = companyInput.value.trim();

  if (!inputVal) {
    showValidationMessage(validationMsg, "Por favor, escribe el nombre de la empresa.", "error-state");
    return;
  }

  showValidationMessage(validationMsg, "Buscando plantilla de forma segura...", "success-state");

  try {
    // 1. Descargar plantillas actualizadas desde Supabase
    const client = getSupabaseClient();
    if (!client) {
      showValidationMessage(validationMsg, "Error: No se pudo cargar el servicio de Supabase.", "error-state");
      return;
    }

    const { data: dbTemplates, error } = await client
      .from('socioeconomic_templates')
      .select('*');

    if (error || !dbTemplates || dbTemplates.length === 0) {
      showValidationMessage(validationMsg, "Error de red al conectar con el servidor. Inténtalo de nuevo.", "error-state");
      return;
    }

    // 2. Búsqueda exacta case-insensitive (Mayúsculas o minúsculas)
    const normalizedInput = inputVal.toLowerCase();
    const matched = dbTemplates.find(t => t.name.toLowerCase() === normalizedInput);

    if (matched) {
      // Éxito: Nombre de la empresa es válido
      state.matchedTemplate = matched;
      showValidationMessage(validationMsg, "Empresa válida. Cargando formulario...", "success-state");

      // 3. Resolver Marca Comercial para el Cliente actual
      await resolveCommercialBrand(matched.name);

      // Limpiar input y mensaje de error
      setTimeout(async () => {
        companyInput.value = "";
        validationMsg.classList.remove('active');
        
        // Cargar el formulario dinámico e ir a la vista de captura
        await buildDynamicForm(matched);
        navigateTo('view-form');
      }, 1000);

    } else {
      // Fallo: Nombre inválido (Alerta Roja sin dar pistas)
      showValidationMessage(validationMsg, "El nombre de la empresa no es válido. Verifique la ortografía.", "error-state");
    }
  } catch (err) {
    console.error(err);
    showValidationMessage(validationMsg, "Ocurrió un problema de comunicación con el servidor.", "error-state");
  }
}

/**
 * Resuelve la marca comercial del cliente actual consultando la configuración
 */
async function resolveCommercialBrand(clientName) {
  // Aseguramos tener los mapeos actualizados
  try {
    const client = getSupabaseClient();
    if (client) {
      const { data: dbMappings } = await client.from('client_mappings').select('*');
      if (dbMappings) {
        state.mappings = dbMappings;
      }
    }
  } catch (e) {}

  const normalizedClient = clientName.toLowerCase();
  const found = state.mappings.find(m => m.client_name.toLowerCase() === normalizedClient);

  if (found) {
    state.resolvedBrand = found.commercial_brand;
    state.resolvedConfig = found.config || {};
  } else {
    // Por defecto Conexion Ejecutiva
    state.resolvedBrand = "Conexion Ejecutiva"; 
    state.resolvedConfig = {};
  }
}

function showValidationMessage(element, text, stateClass) {
  element.innerText = text;
  element.className = `validation-message active ${stateClass}`;
}

// ==========================================================================
// CONSTRUCTOR INTELIGENTE DE FORMULARIOS DINÁMICOS MOBILE-FIRST
// ==========================================================================

const MEXICAN_STATES = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua",
  "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero",
  "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro",
  "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
  "Yucatán", "Zacatecas"
];

const DROPDOWNS_COTEJADOS = ["Original", "Copia", "Impresión", "Digital"];
const DROPDOWNS_ESCOLAR = ["Historial académico", "Cardex", "Certificado", "Boleta", "Credencial escolar"];
const DROPDOWNS_INMUEBLES = ["Factura", "Carta Poder", "Escrituras", "Ticket"];

// Secciones del Wizard (Pasos Dinámicos)
let activeWizardSections = [
  { id: 'sec-estudio', label: '1. Estudio Socioeconómico' },
  { id: 'sec-personales', label: '2. Datos Personales' },
  { id: 'sec-escolaridad', label: '3. Escolaridad e Inmuebles' },
  { id: 'sec-economia', label: '4. Familiar y Economía' },
  { id: 'sec-entorno', label: '5. Entorno y Salud' },
  { id: 'sec-referencias', label: '6. Referencias' },
  { id: 'sec-laboral', label: '7. Historial Laboral' },
  { id: 'sec-evidencias', label: '8. Documentos y Evidencias' }
];

let currentWizardStep = 0;

function classifyFieldSection(fieldId) {
  const id = fieldId.toLowerCase();
  
  // 1. Estudio Socioeconómico (Módulo 1)
  if (id.match(/fecha.*solicitud/) || id.match(/fecha.*visita/) || id.match(/elaborado_por/) || id === 'puesto' || id === 'puesto_solicitado' || id.match(/demandas/) || id.match(/resultado/) || id.match(/solicitado_por/)) return 'sec-estudio';
  
  // 7. Historial Laboral y Omitidos (Módulos 7 y 8)
  // Check this before personal data so "Puesto" inside laboral doesn't get confused
  if (id.includes('empresa') || id.includes('giro') || id.includes('contrato') || id.match(/fecha.*ingreso/) || id.match(/fecha.*salida/) || id.includes('sueldo') || id.match(/motivo.*salida/) || id.match(/jefe/) || id.includes('puntualidad') || id.includes('asistencia') || id.includes('companero') || id.match(/relacion.*compañero/) || id.match(/relacion.*superior/) || id.includes('responsabilidad') || id.includes('honestidad') || id.includes('equipo') || id.includes('disciplina') || id.includes('confiabilidad') || id.includes('iniciativa') || id.match(/calidad.*trabajo/) || id.includes('observaciones_laboral') || id.includes('falta') || id.includes('incapacidad') || id.includes('recomendable') || id.includes('omitido') || id.includes('proporciono_informacion') || id.includes('puesto') || id.includes('persona_informacion')) return 'sec-laboral';
  
  // 8. Documentos y Evidencias (Módulo 4.2 y 5.5)
  if (id.includes('doc_') || id.match(/documento.*acta/) || id.match(/^acta.*nacimiento$/) || id.includes('rfc') || id.includes('curp') || id.includes('imss') || id.includes('nss') || id.includes('ine') || id.includes('folio') || id.includes('tipo_documento') || id.includes('emergencia') || id.includes('foto') || id.includes('mapa') || id.includes('ubicacion') || id.includes('comprobante_domicilio') || id.includes('recomendacion') || id.includes('nomina') || id.includes('infonavit') || id.includes('cartilla') || id.includes('pasaporte')) return 'sec-evidencias';

  // 6. Referencias Personales
  if (id.match(/tiempo.*conocerlo/) || id.match(/como.*describiria/)) return 'sec-referencias';

  // 3. Escolaridad e Inmuebles (Módulo 4.1 y Vivienda)
  if (id.includes('grado') || id.includes('escolar') || id.includes('escuela') || id.includes('documento_obtenido') || id.includes('inmueble') || id.includes('automovil') || id.includes('moto') || id.includes('tipo_casa') || id === 'casa' || id.includes('terreno') || id.match(/valor.*aproximado/) || id.includes('dueño') || id.includes('comprobatorio') || id.includes('habit') || id.includes('limpieza') || id.includes('construccion') || id.includes('baño') || id.includes('bano') || id.includes('cocina') || id.includes('sala') || id.includes('comedor') || id.includes('cuarto') || id.includes('recamara') || id.includes('nivel') || id.includes('estacionamiento') || id.includes('urbana') || id.includes('mueble') || id.match(/años.*escuela/)) return 'sec-escolaridad';

  // 4. Familiar y Economía (Módulos 3 y 5)
  if (id.includes('parentesco') || id.includes('ocupacion') || id.match(/telefono.*empleo/) || id.includes('aportador') || id.includes('ingreso') || id.includes('egreso') || id.includes('predial') || id.includes('hipoteca') || id.includes('renta') || id.includes('servicios') || id.includes('luz') || id.includes('agua') || id.includes('gas') || id.includes('cable') || id.includes('internet') || id.includes('pavimentacion') || id.includes('vigilancia') || id.includes('alumbrado') || id.includes('alimentacion') || id.includes('transporte') || id.includes('educacion') || id.includes('colegiatura') || id.includes('vestido') || id.includes('diversion') || id.includes('gastos_medicos') || id.includes('entretenimiento') || id.match(/plan.*celular/) || id.includes('mascotas_gasto') || id.includes('mantenimiento') || id.includes('deuda') || id.includes('observaciones_familia') || id.includes('ref_eco_')) return 'sec-economia';

  // 5. Entorno y Salud (Módulo 6)
  if (id.includes('originario') || id.includes('densidad') || id.includes('migratorio') || id.includes('farmaco') || id.includes('vandalismo') || id.includes('club') || id.includes('asociacion') || id.includes('deportivo') || id.includes('religion') || id.includes('pasatiempo') || id.match(/mascotas.*cantidad/) || id.includes('tatuaje') || id.includes('alergia') || id.includes('fuma') || id.includes('toma') || id.includes('peso') || id.includes('altura') || id.includes('deporte') || id.includes('enfermedad') || id.includes('patologico') || id.includes('dental') || id.includes('aspecto') || id.match(/familiar.*empresa/) || id.match(/laborado.*empresa/) || id.includes('enteró_vacante') || id.includes('autodescripcion') || id.includes('meta') || id.match(/mas.*importante/)) return 'sec-entorno';

  // 2. Datos Personales (Fallback - Módulo 2)
  return 'sec-personales';
}

async function buildDynamicForm(template) {
  document.getElementById('form-company-badge').innerText = template.name;
  
  const brandLogoUrl = brandLogos[state.resolvedBrand] || brandLogos["Conexion Ejecutiva"];
  const logoImg = document.getElementById('form-brand-logo');
  if (logoImg) {
    logoImg.src = brandLogoUrl;
    logoImg.style.display = "block";
  }
  
  document.getElementById('form-title').innerText = `Estudio Socioeconómico`;
  
  const formContainer = document.getElementById('dynamic-capture-form');
  formContainer.innerHTML = "";
  document.getElementById('form-progress').style.width = "0%";
  
  // Bug fix: Clean previous data completely
  document.getElementById('candidate-name-input').value = "";
  const navCandidateName = document.getElementById('nav-candidate-name-container');
  if (navCandidateName) navCandidateName.style.display = 'none';
  const lookupBanner = document.getElementById('candidate-lookup-banner');
  if (lookupBanner) lookupBanner.style.display = 'none';

  let schema = template.form_schema;
  
  if (!schema || schema.length === 0) {
    formContainer.innerHTML = `<p class="text-center text-muted">La plantilla no contiene campos válidos.</p>`;
    return;
  }

  // 1. Cargar reglas globales de campos en tiempo real desde Supabase
  let globalRules = [];
  try {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client.from('global_field_rules').select('*');
      if (!error && data) {
        globalRules = data;
      }
    }
  } catch (err) {
    console.error("Error al obtener reglas globales en captura:", err);
  }

  // 2. Filtrar metadatos especiales
  schema = schema.filter(f => {
    if (f.id === '__sections_config__') return false;
    if (f.id.toLowerCase() === 'nombre' || f.id.toLowerCase() === 'nombre_candidato') return false;
    return true;
  });

  // 3. Fusionar reglas globales y aplicar sobreescrituras por defecto (tipo de sangre y fechas)
  schema.forEach(field => {
    const rule = globalRules.find(r => r.field_id === field.id);
    if (rule) {
      field.tipo = rule.tipo;
      field.transform = rule.transform;
      field.requerido = rule.requerido;
      field.placeholder = rule.placeholder;
      field.ayuda = rule.ayuda;
      field.dependsOn = rule.depends_on;
      field.dependsOnValue = rule.depends_on_value;
      field.linkFrom = rule.link_from;
      field.opciones = rule.opciones;
      field.defaultToday = rule.default_today;
    }
    
    // Regla global por defecto para tipo de sangre
    if (field.id.toLowerCase().includes('sangre')) {
      field.tipo = 'select';
      field.opciones = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'No sabe'];
      if (!field.label || field.label === field.id) field.label = 'Tipo de Sangre';
    }
    
    // Regla global por defecto para fecha de visita
    if (field.id.toLowerCase().includes('fecha_visita') || field.id.toLowerCase().includes('fecha_de_visita') || field.id.toLowerCase().includes('fecha_visita_domiciliaria')) {
      field.defaultToday = true;
    }
  });
  
  // Inyectar campos globales faltantes en el capturador
  globalRules.forEach(rule => {
    if (rule.is_global) {
      const exists = schema.some(f => f.id === rule.field_id);
      if (!exists) {
        const cleanLabel = rule.field_id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const validSection = (rule.section && typeof rule.section === 'string' && rule.section.startsWith('sec-')) ? rule.section : classifyFieldSection(rule.field_id);
        schema.push({
          id: rule.field_id,
          label: cleanLabel,
          tipo: rule.tipo,
          section: validSection,
          placeholder: rule.placeholder || '',
          ayuda: rule.ayuda || '',
          dependsOn: rule.depends_on || '',
          dependsOnValue: rule.depends_on_value || '',
          linkFrom: rule.link_from || '',
          opciones: rule.opciones || [],
          defaultToday: rule.default_today || false,
          requerido: rule.requerido || false,
          transform: rule.transform || 'none'
        });
      }
    }
  });

  // 4. Ordenar lógicamente la sección de Datos Personales
  const fieldOrderPriority = [
    'genero', 'género', 'sexo',
    'estado_civil',
    'fecha_nacimiento', 'fecha_de_nacimiento', 'fecha_nac',
    'lugar_nacimiento', 'lugar_de_nacimiento', 'estado_nacimiento',
    'edad',
    'curp',
    'rfc'
  ];

  schema.sort((a, b) => {
    const aSec = a.section || classifyFieldSection(a.id);
    const bSec = b.section || classifyFieldSection(b.id);
    
    if (aSec === bSec && aSec === 'sec-personales') {
      const getPriority = (id) => {
        const idLower = id.toLowerCase();
        for (let i = 0; i < fieldOrderPriority.length; i++) {
          if (idLower.includes(fieldOrderPriority[i])) return i;
        }
        return 999;
      };
      return getPriority(a.id) - getPriority(b.id);
    }
    return 0;
  });

  // Cargar configuración de secciones dinámica si existe
  const defaultSections = [
    { id: 'sec-estudio', label: '1. Estudio Socioeconómico' },
    { id: 'sec-personales', label: '2. Datos Personales' },
    { id: 'sec-escolaridad', label: '3. Escolaridad e Inmuebles' },
    { id: 'sec-economia', label: '4. Familiar y Economía' },
    { id: 'sec-entorno', label: '5. Entorno y Salud' },
    { id: 'sec-referencias', label: '6. Referencias' },
    { id: 'sec-laboral', label: '7. Historial Laboral' },
    { id: 'sec-evidencias', label: '8. Documentos y Evidencias' }
  ];
  
  const sectionsConfigField = template.form_schema.find(f => f.id === '__sections_config__');
  if (sectionsConfigField && sectionsConfigField.sections) {
    activeWizardSections = JSON.parse(JSON.stringify(sectionsConfigField.sections));
  } else {
    activeWizardSections = JSON.parse(JSON.stringify(defaultSections));
  }

  const config = state.resolvedConfig || {};
  const formatLabel = (str) => str.replace(/_/g, ' ');

  // 1. Create Wizard Stepper Header
  const stepper = document.createElement('div');
  stepper.className = 'wizard-stepper';
  
  activeWizardSections.forEach((sec, idx) => {
    const tab = document.createElement('button');
    tab.className = `wizard-step-tab ${idx === 0 ? 'active' : ''}`;
    tab.innerText = sec.label;
    tab.type = 'button';
    tab.onclick = () => goToWizardStep(idx);
    stepper.appendChild(tab);
  });
  formContainer.appendChild(stepper);

  // 2. Create Wizard Sections
  const sectionContainers = {};
  activeWizardSections.forEach((sec, idx) => {
    const container = document.createElement('div');
    container.className = `wizard-section ${idx === 0 ? 'active' : ''}`;
    container.id = `wizard-section-${idx}`;
    sectionContainers[sec.id] = container;
    formContainer.appendChild(container);
  });

  // 3. Render Fields by Semantic Class
  schema.forEach(field => {
    if (config.hideFields !== false) {
      if (field.id === 'fecha_solicitud' || field.id === 'resultado_final' || field.id === 'fecha_de_solicitud' || field.id.match(/fecha.*estudio/)) {
        return;
      }
    }

    const secId = field.section || classifyFieldSection(field.id);
    if (secId === 'hidden') return;
    const targetContainer = sectionContainers[secId];
    
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    
    const isConditional = field.dependsOn && field.dependsOn.trim() !== '';
    if (isConditional) {
      formGroup.classList.add('conditional-field');
      formGroup.dataset.dependsOn = field.dependsOn.trim();
      formGroup.dataset.dependsOnValue = field.dependsOnValue ? field.dependsOnValue.trim() : '';
      formGroup.style.display = 'none';
    }
    const linkFromAttr = field.linkFrom && field.linkFrom.trim() !== '' ? `data-link-from="${field.linkFrom.trim()}"` : '';
    
    // Lógica especial para Demandas
    if (config.dynamicDemandas !== false && field.id === 'demandas') {
      const helpText = "Preguntar si ¿Alguna vez a tenido alguna demanda? no importa qué tipo de demanda";
      const tooltipHtml = `
        <button type="button" class="field-help-toggle" onclick="toggleHelpBlock('${field.id}')" aria-label="Ayuda">
          <i data-lucide="help-circle" style="width:16px;height:16px;"></i>
        </button>
      `;
      const helpBlockHtml = `
        <div id="help-block-${field.id}" class="field-help-block" style="display:none;">
          ${escapeHTML(helpText)}
        </div>
      `;

      formGroup.innerHTML = `
        <div class="field-label-row">
          <label class="field-label-v2">
            ${escapeHTML(formatLabel(field.label))} ${field.requerido ? '<span class="required-star">*</span>' : ''}
          </label>
          ${tooltipHtml}
        </div>
        ${helpBlockHtml}
        <div class="select-wrapper" style="width: 100%;">
          <i data-lucide="scale" class="select-icon"></i>
          <select id="field-${field.id}" class="form-select" ${field.requerido ? 'required' : ''}>
            <option value="" disabled selected>Seleccione...</option>
            <option value="No">No</option>
            <option value="Sí">Sí</option>
          </select>
        </div>
        <div id="demandas-details-container" style="display:none; margin-top: 12px; width: 100%;">
          <textarea id="field-demandas-details" class="form-textarea" placeholder="Relate de manera detallada: ¿como fué la demanda, ¿contra quien? ¿en que año fue? ¿cual fue la resolución? etc."></textarea>
        </div>
      `;
      targetContainer.appendChild(formGroup);
      setTimeout(() => {
        const selectEl = document.getElementById(`field-${field.id}`);
        const detailsEl = document.getElementById('demandas-details-container');
        if (selectEl && detailsEl) {
          selectEl.addEventListener('change', (e) => {
            if (e.target.value === 'Sí') {
              detailsEl.style.display = 'block';
              document.getElementById('field-demandas-details').setAttribute('required', 'true');
            } else {
              detailsEl.style.display = 'none';
              document.getElementById('field-demandas-details').removeAttribute('required');
            }
          });
        }
      }, 50);
      return;
    }

    // Dropdowns Específicos
    let dropdownOptions = null;
    let isAge = false;
    
    if (field.tipo === 'select' && field.opciones && field.opciones.length > 0) dropdownOptions = field.opciones;
    else if (field.id.includes('lugar_nacimiento') || field.id.includes('ciudad')) dropdownOptions = MEXICAN_STATES;
    else if (field.id.includes('tipo_doc')) dropdownOptions = DROPDOWNS_COTEJADOS;
    else if (field.id.includes('documento_obtenido')) dropdownOptions = DROPDOWNS_ESCOLAR;
    else if (field.id.includes('documento_comprobatorio')) dropdownOptions = DROPDOWNS_INMUEBLES;
    
    if (field.id === 'edad') isAge = true;

    // Tooltips especiales y dinámicos (Rediseño de Ayuda en Bloque)
    let helpText = '';
    if (field.ayuda && field.ayuda.trim() !== '') {
      helpText = field.ayuda.trim();
    } else if (field.id.includes('puesto') && secId === 'sec-estudio') {
      helpText = "Puesto al que concursa dentro del proceso de la empresa";
    }

    let tooltipHtml = '';
    let helpBlockHtml = '';
    if (helpText) {
      tooltipHtml = `
        <button type="button" class="field-help-toggle" onclick="toggleHelpBlock('${field.id}')" aria-label="Ayuda">
          <i data-lucide="help-circle" style="width:16px;height:16px;"></i>
        </button>
      `;
      helpBlockHtml = `
        <div id="help-block-${field.id}" class="field-help-block" style="display:none;">
          ${escapeHTML(helpText)}
        </div>
      `;
    }

    if (dropdownOptions) {
      formGroup.innerHTML = `
        <div class="field-label-row">
          <label class="field-label-v2">
            ${escapeHTML(formatLabel(field.label))} ${field.requerido ? '<span class="required-star">*</span>' : ''}
          </label>
          ${tooltipHtml}
        </div>
        ${helpBlockHtml}
        <div class="select-wrapper" style="width: 100%;">
          <i data-lucide="list" class="select-icon"></i>
          <select id="field-${field.id}" class="form-select" ${linkFromAttr} ${field.requerido ? 'required' : ''}>
            <option value="" disabled selected>Seleccione...</option>
            ${dropdownOptions.map(o => `<option value="${escapeHTML(o)}">${escapeHTML(o)}</option>`).join('')}
          </select>
        </div>
      `;
    } else if (field.tipo === 'textarea') {
      formGroup.innerHTML = `
        <div class="field-label-row">
          <label class="field-label-v2">
            ${escapeHTML(formatLabel(field.label))} ${field.requerido ? '<span class="required-star">*</span>' : ''}
          </label>
          ${tooltipHtml}
        </div>
        ${helpBlockHtml}
        <div style="width: 100%;">
          <textarea id="field-${field.id}" class="form-textarea" placeholder="${escapeHTML(field.placeholder || '')}" data-transform="${field.transform || 'none'}" ${linkFromAttr} ${field.requerido ? 'required' : ''}></textarea>
        </div>
      `;
    } else {
      let iconName = 'edit-2';
      let extraAttrs = '';
      if (field.tipo === 'tel') {
        iconName = 'phone';
        extraAttrs = 'pattern="[0-9]{10}" title="El número telefónico debe tener exactamente 10 dígitos." maxlength="10"';
      }
      else if (field.tipo === 'email') iconName = 'mail';
      else if (field.tipo === 'date') iconName = 'calendar';
      else if (field.tipo === 'number') iconName = 'numeric';

      let defaultValAttr = '';
      if (field.tipo === 'date' && field.defaultToday) {
        const today = new Date();
        // Adjust for local timezone
        const offset = today.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(today - offset)).toISOString().split('T')[0];
        defaultValAttr = `value="${localISOTime}"`;
      }

      formGroup.innerHTML = `
        <div class="field-label-row">
          <label class="field-label-v2">
            ${escapeHTML(formatLabel(field.label))} ${field.requerido ? '<span class="required-star">*</span>' : ''}
          </label>
          ${tooltipHtml}
        </div>
        ${helpBlockHtml}
        <div style="position:relative; width: 100%;">
          <i data-lucide="${iconName}" class="input-icon" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--color-text-dark); width: 18px; height: 18px;"></i>
          <input type="${field.tipo}" id="field-${field.id}" class="form-input" ${extraAttrs} placeholder="${escapeHTML(field.placeholder || (field.id.includes('año') ? 'ej. 3 años' : ''))}" ${defaultValAttr} data-transform="${field.transform || 'none'}" ${linkFromAttr} ${field.requerido ? 'required' : ''} autocomplete="off" style="width: 100%; padding-left: 42px; padding-top: 10px; padding-bottom: 10px; box-sizing: border-box;">
        </div>
      `;
    }

    targetContainer.appendChild(formGroup);
  });

  // 4. Agregar Botones de Navegación del Wizard
  activeWizardSections.forEach((sec, idx) => {
    const container = sectionContainers[sec.id];
    
    // Si la sección está vacía, agregar mensaje
    if (container.querySelectorAll('.form-group').length === 0) {
      container.innerHTML = `<p class="text-center text-muted" style="margin: 20px 0;">No hay preguntas para esta sección en la plantilla.</p>`;
    }

    const footer = document.createElement('div');
    footer.className = 'wizard-footer';
    
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'btn btn-secondary';
    backBtn.innerText = '← Atrás';
    backBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
    backBtn.onclick = () => goToWizardStep(idx - 1);
    
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn-primary';
    
    if (idx === activeWizardSections.length - 1) {
      nextBtn.innerText = 'Guardar Captura';
      nextBtn.onclick = submitCapturedForm;
    } else {
      nextBtn.innerText = 'Siguiente →';
      nextBtn.onclick = () => goToWizardStep(idx + 1);
    }

    footer.appendChild(backBtn);
    footer.appendChild(nextBtn);
    container.appendChild(footer);
  });

  // Init Wizard State
  currentWizardStep = 0;
  lucide.createIcons();
  setupProgressTracking(schema);
  
  if (config.autoDate !== false) {
    const today = new Date().toISOString().split('T')[0];
    const fechaVisita = document.getElementById('field-fecha_visita') || document.getElementById('field-fecha_de_visita');
    if (fechaVisita) fechaVisita.value = today;
  }

  // Setup Calculations and Autocompletes trigger dynamically
  setupCustomAutocompleteAndCalculations();

  // Trigger initial visibility conditions and linkings on form load
  setTimeout(() => {
    const allFormInputs = formContainer.querySelectorAll('.form-input, .form-select, .form-textarea');
    allFormInputs.forEach(input => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }, 200);

  // Lógica de género y estado civil dinámico
  const bindGenderAndMaritalStatus = () => {
    const genderSelect = document.querySelector('select[id*="genero"], select[id*="género"]');
    const maritalSelect = document.querySelector('select[id*="estado_civil"]');
    
    if (genderSelect && maritalSelect) {
      console.log("Detectados campos de Género y Estado Civil. Vinculando comportamiento dinámico...");
      
      // Asegurar que género tenga Masculino y Femenino
      if (genderSelect.options.length <= 1) {
        genderSelect.innerHTML = `
          <option value="" disabled selected>Seleccione...</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
        `;
      }
      
      const updateMaritalOptions = () => {
        const gender = genderSelect.value;
        const previousVal = maritalSelect.value;
        
        if (!gender) {
          maritalSelect.innerHTML = `<option value="" disabled selected>Seleccione género primero...</option>`;
          maritalSelect.disabled = true;
          return;
        }
        
        maritalSelect.disabled = false;
        
        let options = [];
        if (gender === 'Masculino') {
          options = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Libre'];
        } else if (gender === 'Femenino') {
          options = ['Soltera', 'Casada', 'Divorciada', 'Viuda', 'Unión Libre'];
        }
        
        maritalSelect.innerHTML = `
          <option value="" disabled selected>Seleccione...</option>
          ${options.map(o => `<option value="${escapeHTML(o)}">${escapeHTML(o)}</option>`).join('')}
        `;
        
        // Mapear valor anterior si existía y coincide en género
        if (previousVal) {
          let matchedOption = '';
          if (gender === 'Masculino') {
            if (previousVal.startsWith('Solter')) matchedOption = 'Soltero';
            else if (previousVal.startsWith('Casad')) matchedOption = 'Casado';
            else if (previousVal.startsWith('Divorciad')) matchedOption = 'Divorciado';
            else if (previousVal.startsWith('Viud')) matchedOption = 'Viudo';
            else if (previousVal === 'Unión Libre') matchedOption = 'Unión Libre';
          } else if (gender === 'Femenino') {
            if (previousVal.startsWith('Solter')) matchedOption = 'Soltera';
            else if (previousVal.startsWith('Casad')) matchedOption = 'Casada';
            else if (previousVal.startsWith('Divorciad')) matchedOption = 'Divorciada';
            else if (previousVal.startsWith('Viud')) matchedOption = 'Viuda';
            else if (previousVal === 'Unión Libre') matchedOption = 'Unión Libre';
          }
          
          if (matchedOption) {
            maritalSelect.value = matchedOption;
            maritalSelect.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      };
      
      genderSelect.addEventListener('change', updateMaritalOptions);
      genderSelect.addEventListener('input', updateMaritalOptions);
      updateMaritalOptions();
    }
  };

  bindGenderAndMaritalStatus();
}

function goToWizardStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= activeWizardSections.length) return;
  
  // Validar campos obligatorios al intentar avanzar
  if (stepIndex > currentWizardStep) {
    const currentSection = document.getElementById(`wizard-section-${currentWizardStep}`);
    if (currentSection) {
      const requiredInputs = currentSection.querySelectorAll('input[required], select[required], textarea[required]');
      let firstInvalid = null;
      for (const input of requiredInputs) {
        // Ignorar campos ocultos por lógica condicional
        const closestConditional = input.closest('.conditional-field');
        if (closestConditional && closestConditional.style.display === 'none') {
          continue;
        }
        if (!input.value || input.value.trim() === '') {
          firstInvalid = input;
          break;
        }
      }
      if (firstInvalid) {
        alert("Por favor complete todos los campos obligatorios antes de continuar.");
        firstInvalid.focus();
        try { firstInvalid.reportValidity(); } catch(e) {}
        return;
      }
    }
  }
  
  document.querySelectorAll('.wizard-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.wizard-step-tab').forEach(el => el.classList.remove('active'));
  
  document.getElementById(`wizard-section-${stepIndex}`).classList.add('active');
  
  const activeTab = document.querySelectorAll('.wizard-step-tab')[stepIndex];
  if (activeTab) {
    activeTab.classList.add('active');
    // Recorrer la pestaña de la sección para visualizarla centrada en pantallas pequeñas
    activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  
  currentWizardStep = stepIndex;
  window.scrollTo(0, 0); // Volver arriba al cambiar de pestaña
}

/**
 * Monitorea el progreso del llenado de campos requeridos para la barra superior
 */
function setupProgressTracking(schema) {
  const progressBar = document.getElementById('form-progress');
  const candidateInput = document.getElementById('candidate-name-input');
  
  const updateProgress = () => {
    let totalRequired = 1; // Incluyendo el nombre del candidato
    let completedRequired = candidateInput.value.trim() !== "" ? 1 : 0;
    
    schema.forEach(field => {
      if (field.requerido) {
        totalRequired++;
        const element = document.getElementById(`field-${field.id}`);
        if (element && element.value.trim() !== "") {
          completedRequired++;
        }
      }
    });

    const percent = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;
    progressBar.style.width = `${percent}%`;

    // Actualizar estado 'completed' de las pestañas del Wizard
    activeWizardSections.forEach((sec, idx) => {
      const container = document.getElementById(`wizard-section-${idx}`);
      const tab = document.querySelectorAll('.wizard-step-tab')[idx];
      if (container && tab) {
        // Verificar si hay al menos un campo lleno en esta sección
        const inputs = container.querySelectorAll('input:not([type="hidden"]), select, textarea');
        let hasData = false;
        inputs.forEach(input => {
          if (input.value && input.value.trim() !== '') hasData = true;
        });
        
        if (hasData) {
          tab.classList.add('completed');
          // Añadir checkmark si no lo tiene
          if (!tab.innerHTML.includes('lucide="check-circle"')) {
            tab.innerHTML = `<i data-lucide="check-circle" style="width:14px; height:14px; color:var(--color-accent);"></i> ` + tab.innerHTML;
            lucide.createIcons();
          }
        } else {
          tab.classList.remove('completed');
          // Remover checkmark si existe
          const icon = tab.querySelector('.lucide-check-circle');
          if (icon) icon.remove();
        }
      }
    });
  };

  // Capitalización de Nombres Propios
  const capitalizeProperNoun = (str) => {
    const prepositions = ['de', 'del', 'la', 'las', 'el', 'los', 'en', 'y', 'o', 'u', 'con', 'por', 'para', 'a', 'e', 'un', 'una', 'unos', 'unas'];
    return str.split(' ').map((word, index) => {
      const lower = word.toLowerCase();
      if (index !== 0 && prepositions.includes(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + lower.slice(1);
    }).join(' ');
  };

  // Escuchar eventos en todo el formulario
  candidateInput.addEventListener('input', (e) => {
    // Capitalizar y sincronizar con sticky header
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    e.target.value = capitalizeProperNoun(e.target.value);
    e.target.setSelectionRange(start, end);
    
    const stickyHeader = document.getElementById('nav-candidate-name-container');
    const stickyName = document.getElementById('nav-candidate-name-text');
    
    if (e.target.value.trim() !== "") {
      stickyHeader.style.display = 'flex';
      stickyName.innerText = e.target.value;
    } else {
      stickyHeader.style.display = 'none';
    }
    
    updateProgress();
  });

  schema.forEach(field => {
    const element = document.getElementById(`field-${field.id}`);
    if (element) {
      const idLower = field.id.toLowerCase();
      if (idLower.includes('nombre') || idLower.includes('direccion') || idLower.includes('dirección') || idLower.includes('calle') || idLower.includes('colonia') || idLower.includes('lugar') || idLower.includes('estado') || idLower.includes('ciudad') || idLower.includes('municipio') || idLower.includes('delegacion') || idLower.includes('referencia')) {
        element.addEventListener('input', (e) => {
          const start = e.target.selectionStart;
          const end = e.target.selectionEnd;
          e.target.value = capitalizeProperNoun(e.target.value);
          try { e.target.setSelectionRange(start, end); } catch (err) {}
        });
      }
      element.addEventListener('input', updateProgress);
      element.addEventListener('change', updateProgress);
    }
  });
}

// ==========================================================================
// ENVÍO DE FORMULARIO DE CAPTURA COMPLETADO A SUPABASE
// ==========================================================================

async function submitCapturedForm(e) {
  const candidateInput = document.getElementById('candidate-name-input');
  const candidateName = candidateInput.value.trim();

  if (!candidateName) {
    alert("Por favor, ingrese el Nombre del Candidato.");
    candidateInput.focus();
    return;
  }

  // Validar el resto de los campos obligatorios nativos de HTML5
  const form = document.getElementById('dynamic-capture-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Deshabilitar el botón de envío para evitar doble clic y dar feedback visual en vivo
  const submitBtn = e && e.currentTarget ? e.currentTarget : null;
  let originalBtnText = '';
  if (submitBtn) {
    originalBtnText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = 'Guardando captura en base de datos... ⏳';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.cursor = 'not-allowed';
  }

  // Acumular las respuestas asociándolas a sus llaves ("braces") correspondientes
  const answers = {};
  state.matchedTemplate.form_schema.forEach(field => {
    const element = document.getElementById(`field-${field.id}`);
    if (element) {
      answers[field.id] = element.value.trim();
    }
    // Agregar el campo detalle de demandas si existe
    if (field.id === 'demandas') {
      const detailsElement = document.getElementById('field-demandas-details');
      if (detailsElement && answers[field.id] === 'Sí') {
        answers['demandas_detalles'] = detailsElement.value.trim();
      }
    }
  });

  const payload = {
    client_name: state.matchedTemplate.name,
    template_name: state.matchedTemplate.name,
    brand_assigned: state.resolvedBrand,
    payload: {
      candidate_name: candidateName,
      answers: answers
    },
    created_at: new Date().toISOString()
  };

  console.log("Subiendo captura finalizada a Supabase...", payload);

  try {
    const client = getSupabaseClient();
    if (!client) {
      alert("Error: El cliente de base de datos no está inicializado.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
      }
      return;
    }

    // Verificar duplicidad antes de guardar para evitar múltiples registros del mismo candidato
    console.log("Verificando si ya existe una captura previa para evitar duplicados...");
    let existingRecordId = null;
    let existingDocUrl = null;
    let existingDocName = null;
    
    try {
      const { data: existingData, error: searchError } = await client
        .from('socioeconomic_captures')
        .select('id, payload')
        .eq('client_name', payload.client_name)
        .ilike('payload->>candidate_name', candidateName)
        .limit(1);
        
      if (!searchError && existingData && existingData.length > 0) {
        existingRecordId = existingData[0].id;
        existingDocUrl = existingData[0].payload && existingData[0].payload.docUrl ? existingData[0].payload.docUrl : null;
        existingDocName = existingData[0].payload && existingData[0].payload.docName ? existingData[0].payload.docName : null;
        
        if (existingDocUrl) {
          payload.payload.docUrl = existingDocUrl;
        }
        if (existingDocName) {
          payload.payload.docName = existingDocName;
        }
      }
    } catch (searchErr) {
      console.warn("No se pudo comprobar duplicados, procediendo con inserción estándar:", searchErr);
    }

    let saveResult;
    if (existingRecordId) {
      console.log(`Registro duplicado detectado (ID: ${existingRecordId}). Actualizando información existente...`);
      saveResult = await client
        .from('socioeconomic_captures')
        .update(payload)
        .eq('id', existingRecordId)
        .select();
    } else {
      console.log("No se detectó registro duplicado. Insertando nueva captura...");
      saveResult = await client
        .from('socioeconomic_captures')
        .insert(payload)
        .select();
    }

    const { data, error } = saveResult;

    if (error) {
      console.error(error);
      if (error.code === '42P01') {
        alert("Excelente captura. La tabla 'socioeconomic_captures' no existe en tu Supabase. Se muestra en consola el JSON listo para guardar.");
        console.log(JSON.stringify(payload, null, 2));
      } else {
        alert("Error al guardar la captura en la base de datos.");
      }
      
      // Restaurar botón en caso de error
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
      }
      return;
    }

    // 1. Guardado exitoso en Supabase
    const mappingConfig = state.resolvedConfig || {};
    
    // 2. Sincronizar de forma síncrona/await con Google Apps Script si hay URL de Web App configurada
    if (mappingConfig.appsScriptUrl) {
      if (submitBtn) {
        submitBtn.innerText = 'Rellenando documento en Google Drive... 📂';
      }
      
      try {
        console.log("URL de Google Apps Script detectada. Enviando webhook de rellenado de documento...");
        const response = await fetch(mappingConfig.appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8' // Content-Type simple evita CORS preflight blocks
          },
          body: JSON.stringify({
            action: 'fillDoc',
            clientName: state.matchedTemplate.name,
            candidateName: candidateName,
            answers: answers,
            templateId: mappingConfig.templateId || ''
          })
        });
        
        const text = await response.text();
        let resData = null;
        try {
          resData = JSON.parse(text);
        } catch (e) {
          console.error("Error al parsear respuesta JSON de Apps Script:", e);
        }
        
        if (resData && resData.success) {
          const recordToUpdateId = data[0].id;
          const updatedPayload = {
            ...payload.payload,
            docUrl: resData.docUrl,
            docName: resData.docName
          };
          
          console.log(`Webhook exitoso. Guardando docUrl: "${resData.docUrl}" en el registro ${recordToUpdateId}`);
          
          const { error: updateError } = await client
            .from('socioeconomic_captures')
            .update({ payload: updatedPayload })
            .eq('id', recordToUpdateId);
            
          if (updateError) {
            console.error("Error al actualizar la captura con el link del documento:", updateError);
          }

          if (resData.createdNew) {
            alert(`¡Estudio guardado con éxito!\n\n⚠️ No se encontró ningún Docs editable en la carpeta del candidato, por lo que creamos una copia de tu plantilla base en su lugar:\n\n"${resData.docName}"`);
          } else {
            alert(`¡Estudio guardado con éxito!\n\nDocumento actualizado en Google Drive:\n"${resData.docName}"`);
          }
        } else {
          const errorMsg = resData ? resData.error : 'Respuesta inválida del servidor de Google.';
          alert(`¡Guardado en base de datos!\n\n⚠️ Sin embargo, hubo un problema al volcar la información en Google Drive:\n\n${errorMsg}\n\nPor favor, verifica las carpetas y archivos manualmente.`);
        }
      } catch (err) {
        console.error("Error al disparar Google Apps Script:", err);
        alert("¡Guardado en base de datos!\n\n⚠️ No se pudo confirmar la inyección en Google Drive debido a restricciones de red o CORS del navegador. Los datos de captura se almacenaron correctamente en tu Panel.");
      }
    } else {
      alert("¡Estudio Socioeconómico guardado con éxito!");
    }
    
    // Regresar al inicio
    navigateTo('view-welcome');
  } catch (err) {
    console.error(err);
    alert("Error de conexión al subir la captura.");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
    }
  }
}

// ==========================================================================
// CRUD PANEL ADMINISTRADOR: GESTIÓN DE MAPEOS (MODAL COMPORTAMIENTO)
// ==========================================================================

let mappingModal = null; // Se inicializa en DOMContentLoaded

// Los listeners del modal se mueven a DOMContentLoaded para garantizar que el DOM esté listo

async function _saveMappingForm() {
  const idVal = document.getElementById('mapping-id').value;
  const clientName = document.getElementById('mapping-client-name').value.trim();
  const commercialBrand = document.getElementById('mapping-commercial-brand').value;

  const templateIdEl = document.getElementById('config-template-id');
  let templateIdStr = templateIdEl ? templateIdEl.value.trim() : '';
  if (templateIdStr.includes('/d/')) {
    const match = templateIdStr.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      templateIdStr = match[1];
    }
  }

  const configObj = {
    autoDate: document.getElementById('config-auto-date').checked,
    hideFields: document.getElementById('config-hide-fields').checked,
    dynamicDemandas: document.getElementById('config-dynamic-demandas').checked,
    appsScriptUrl: document.getElementById('config-apps-script-url').value.trim(),
    templateId: templateIdStr
  };

  const payload = {
    client_name: clientName,
    commercial_brand: commercialBrand,
    config: configObj
  };

  try {
    const client = getSupabaseClient();
    
    if (idVal) {
      // Editar existente en Supabase o local
      const idx = state.mappings.findIndex(m => String(m.id) === String(idVal));
      if (idx !== -1) {
        state.mappings[idx].commercial_brand = commercialBrand;
        state.mappings[idx].config = configObj;
      }
      
      // Intentar actualizar en DB
      if (client) {
        const { error } = await client
          .from('client_mappings')
          .update({ commercial_brand: commercialBrand, config: configObj })
          .eq('id', idVal);
          
        if (error) {
          console.error("Error actualizando en Supabase:", error);
          alert("Error guardando en la base de datos (Supabase). Verifica permisos o RLS: " + error.message);
        }
      }
        
    } else {
      // Agregar nuevo en Supabase o local
      const newId = Date.now();
      state.mappings.push({ id: newId, client_name: clientName, commercial_brand: commercialBrand, config: configObj });
      
      // Intentar insertar en DB
      if (client) {
        const { error } = await client
          .from('client_mappings')
          .insert(payload);
          
        if (error) {
          console.error("Error insertando en Supabase:", error);
          alert("Error insertando en la base de datos (Supabase). Verifica permisos o RLS: " + error.message);
        }
      }
    }
  } catch (err) {
    console.warn("DB offline o tabla inexistente. Modificación realizada de forma local temporal.");
  }

  // Recargar tabla, cerrar modal y actualizar conteo
  renderMappingsTable();
  document.getElementById('kpi-mappings-count').innerText = state.mappings.length;
  mappingModal.classList.remove('active');
}

function openEditMappingModal(id) {
  // Obtener datos del mapeo desde el mapa global (evita inyección HTML via onclick)
  const mapping = window._mappingsById && window._mappingsById[String(id)];
  if (!mapping) {
    console.error('Mapeo no encontrado para id:', id);
    return;
  }

  const config = mapping.config || {};

  document.getElementById('mapping-id').value = mapping.id;
  document.getElementById('mapping-client-name').value = mapping.client_name;
  document.getElementById('mapping-client-name').setAttribute('readonly', 'true'); // No cambiar el cliente, solo su marca
  document.getElementById('mapping-commercial-brand').value = mapping.commercial_brand;
  document.getElementById('config-auto-date').checked = config.autoDate !== false;
  document.getElementById('config-hide-fields').checked = config.hideFields !== false;
  document.getElementById('config-dynamic-demandas').checked = config.dynamicDemandas !== false;
  document.getElementById('config-apps-script-url').value = config.appsScriptUrl || '';
  document.getElementById('config-template-id') && (document.getElementById('config-template-id').value = config.templateId || '');

  document.getElementById('modal-title-action').innerText = "Editar Mapeo de Marca";
  mappingModal.classList.add('active');
}

async function handleDeleteMapping(id) {
  if (confirm("¿Está seguro de que desea eliminar este mapeo?")) {
    state.mappings = state.mappings.filter(m => String(m.id) !== String(id));
    
    try {
      const client = getSupabaseClient();
      if (client) {
        await client
          .from('client_mappings')
          .delete()
          .eq('id', id);
      }
    } catch (e) {}

    renderMappingsTable();
    document.getElementById('kpi-mappings-count').innerText = state.mappings.length;
  }
}

// ==========================================================================
// INICIALIZADORES Y LISTENERS GLOBALES
// ==========================================================================

function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  // Revisar si hay tema guardado
  const savedTheme = localStorage.getItem('app-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  if (savedTheme === 'dark') {
    themeIcon.setAttribute('data-lucide', 'sun');
  }

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('app-theme', target);
    
    themeIcon.setAttribute('data-lucide', target === 'dark' ? 'sun' : 'moon');
    lucide.createIcons();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Comprobar si venimos de admin.html
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'true') {
    // Autologin silencioso y cargar panel de administración
    loadAdminData();
    navigateTo('view-admin-dashboard');
    // Limpiar url param sin recargar
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Inicializar el modal de mapeos aquí para asegurar que el DOM está listo
  mappingModal = document.getElementById('mapping-modal');

  // Listeners del Modal de Mapeos (dentro de DOMContentLoaded para garantizar DOM disponible)
  document.getElementById('btn-open-mapping-modal').addEventListener('click', () => {
    document.getElementById('mapping-id').value = "";
    document.getElementById('mapping-client-name').value = "";
    document.getElementById('mapping-client-name').removeAttribute('readonly');
    document.getElementById('mapping-commercial-brand').value = "Conexion Ejecutiva";
    document.getElementById('config-apps-script-url').value = "";
    const tmplEl = document.getElementById('config-template-id');
    if (tmplEl) tmplEl.value = "";
    document.getElementById('modal-title-action').innerText = "Agregar Mapeo de Marca";
    mappingModal.classList.add('active');
  });

  document.getElementById('btn-close-mapping-modal').addEventListener('click', () => {
    mappingModal.classList.remove('active');
  });

  document.getElementById('btn-cancel-mapping').addEventListener('click', () => {
    mappingModal.classList.remove('active');
  });

  // Guardar o Editar Mapeo
  document.getElementById('mapping-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await _saveMappingForm();
  });

  initTheme();
  
  // Asignar listeners del Home
  document.getElementById('btn-to-capture').addEventListener('click', () => {
    navigateTo('view-search');
  });
  
  document.getElementById('btn-to-login').addEventListener('click', () => {
    navigateTo('view-admin-login');
  });

  // Listener de Verificación de Empresa
  document.getElementById('btn-verify-company').addEventListener('click', verifyAndLoadCompany);
  document.getElementById('company-name-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      verifyAndLoadCompany();
    }
  });

  // Abortar Formulario
  document.getElementById('btn-abort-form').addEventListener('click', () => {
    if (confirm("¿Desea abortar la captura del estudio socioeconómico? Los datos ingresados se perderán.")) {
      // Limpiar candidato
      document.getElementById('candidate-name-input').value = '';
      const navCandidateName = document.getElementById('nav-candidate-name-container');
      if (navCandidateName) navCandidateName.style.display = 'none';
      const lookupBanner = document.getElementById('candidate-lookup-banner');
      if (lookupBanner) lookupBanner.style.display = 'none';
      document.getElementById('dynamic-capture-form').innerHTML = ''; // reset content
      navigateTo('view-welcome');
    }
  });

  // Búsqueda en base de datos para Candidatos existentes (Autocompletado histórico)
  const candidateInput = document.getElementById('candidate-name-input');
  if (candidateInput) {
    let lookupTimeout = null;
    candidateInput.addEventListener('input', (e) => {
      const banner = document.getElementById('candidate-lookup-banner');
      if (banner) banner.style.display = 'none';

      const name = e.target.value.trim();
      if (name.length < 3) return;

      if (lookupTimeout) clearTimeout(lookupTimeout);
      lookupTimeout = setTimeout(async () => {
        try {
          const client = getSupabaseClient();
          if (!client) return;

          console.log(`Buscando coincidencias para candidate_name en payload: "${name}"...`);
          const { data, error } = await client
            .from('socioeconomic_captures')
            .select('*')
            .ilike('payload->>candidate_name', `%${name}%`)
            .order('created_at', { ascending: false })
            .limit(1);

          if (error) {
            console.error("Error al buscar candidato:", error);
            return;
          }

          if (data && data.length > 0) {
            const match = data[0];
            const hasPayload = match.payload && typeof match.payload === 'object';
            const matchedName = hasPayload ? match.payload.candidate_name : 'Candidato';
            const foundData = hasPayload ? match.payload.answers : null;
            
            const bannerMessage = document.getElementById('lookup-banner-message');
            const btnLoad = document.getElementById('btn-load-candidate-data');
            
            if (bannerMessage && btnLoad && banner) {
              bannerMessage.innerText = `¡Estudio previo encontrado para "${matchedName}"!`;
              banner.style.display = 'block';
              
              btnLoad.onclick = () => {
                if (foundData && typeof window.loadCandidateData === 'function') {
                  window.loadCandidateData(foundData, matchedName);
                }
              };
            }
          }
        } catch (err) {
          console.error("Excepción en búsqueda de candidato:", err);
        }
      }, 600); // 600ms debounce
    });
  }

  // Guardar Captura
  const btnSubmitCapture = document.getElementById('btn-submit-capture');
  if (btnSubmitCapture) {
    btnSubmitCapture.addEventListener('click', submitCapturedForm);
  }

  // Iniciar Sesión de Administrador
  document.getElementById('btn-execute-login').addEventListener('click', handleAdminLogin);
  document.getElementById('login-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleAdminLogin();
    }
  });

  // Cerrar Sesión Panel Admin
  document.getElementById('btn-logout').addEventListener('click', () => {
    navigateTo('view-welcome');
  });

  // Aplicar Reglas de Formato Automático al salir del campo (blur)
  document.addEventListener('blur', (e) => {
    if (e.target.matches('.form-input, .form-textarea')) {
      const transform = e.target.getAttribute('data-transform');
      if (transform && transform !== 'none') {
        let val = e.target.value;
        if (transform === 'uppercase') val = val.toUpperCase();
        else if (transform === 'lowercase') val = val.toLowerCase();
        else if (transform === 'titlecase') val = toTitleCase(val);
        e.target.value = val;
      }
    }
  }, true);

  // Lógica de Autocompletar (Espejo) y Condiciones de Visibilidad
  const handleDynamicFields = (e) => {
    if (e.target.matches('.form-input, .form-textarea, .form-select')) {
      const sourceId = e.target.id.replace('field-', '');
      const newValue = e.target.value;
      
      // 1. Autocompletar (Espejo)
      const targets = document.querySelectorAll(`[data-link-from="${sourceId}"]`);
      targets.forEach(target => {
        if (target !== e.target) {
          target.value = newValue;
        }
      });
      
      // 2. Condiciones de Visibilidad
      const dependentGroups = document.querySelectorAll(`.conditional-field[data-depends-on="${sourceId}"]`);
      dependentGroups.forEach(group => {
        const requiredValue = group.dataset.dependsOnValue;
        if (newValue.toLowerCase() === requiredValue.toLowerCase()) {
          group.style.display = 'block';
          const innerInput = group.querySelector('.form-input, .form-select, .form-textarea');
          if (innerInput && innerInput.hasAttribute('data-was-required')) {
            innerInput.setAttribute('required', 'true');
          }
        } else {
          group.style.display = 'none';
          const innerInput = group.querySelector('.form-input, .form-select, .form-textarea');
          if (innerInput) {
            innerInput.value = '';
            if (innerInput.hasAttribute('required')) {
              innerInput.removeAttribute('required');
              innerInput.setAttribute('data-was-required', 'true');
            }
          }
        }
      });
    }
  };

  document.addEventListener('input', handleDynamicFields);
  document.addEventListener('change', handleDynamicFields);

  // Validar y Formatear Números Telefónicos (10 dígitos, solo números, o bypass para "No tiene", "No cuenta", "No", "N/A")
  const bypassValues = ['no tiene', 'no cuenta', 'no', 'n/a', 'na'];

  function checkDuplicatePhoneNumbers() {
    const phoneInputs = Array.from(document.querySelectorAll('input[type="tel"]'));
    // 1. Limpiar validez anterior para duplicados primero
    phoneInputs.forEach(input => {
      if (input.validationMessage === "Los números telefónicos no se pueden duplicar.") {
        input.setCustomValidity("");
      }
    });

    // 2. Agrupar valores para encontrar duplicados
    const valueMap = {};
    phoneInputs.forEach(input => {
      const val = input.value.trim().toLowerCase();
      // Ignorar si está vacío o si es un valor de bypass
      if (val !== '' && !bypassValues.includes(val)) {
        if (!valueMap[val]) {
          valueMap[val] = [];
        }
        valueMap[val].push(input);
      }
    });

    // 3. Marcar los duplicados
    Object.keys(valueMap).forEach(val => {
      const inputs = valueMap[val];
      if (inputs.length > 1) {
        inputs.forEach(input => {
          input.setCustomValidity("Los números telefónicos no se pueden duplicar.");
        });
      }
    });
  }

  document.addEventListener('input', (e) => {
    if (e.target.matches('input[type="tel"]')) {
      const val = e.target.value.trim().toLowerCase();
      
      // Si el valor es vacío o es un prefijo de algún valor de bypass, permitimos letras
      const isBypassPrefix = bypassValues.some(b => b.startsWith(val)) || val === '';
      
      if (isBypassPrefix) {
        if (bypassValues.includes(val) || val === '') {
          e.target.setCustomValidity("");
        } else {
          e.target.setCustomValidity("El número telefónico debe tener exactamente 10 dígitos o ser 'No tiene', 'No cuenta', 'No' o 'N/A'.");
        }
      } else {
        const start = e.target.selectionStart;
        const originalLen = e.target.value.length;
        e.target.value = e.target.value.replace(/\D/g, '');
        const newLen = e.target.value.length;
        e.target.setSelectionRange(start - (originalLen - newLen), start - (originalLen - newLen));
        
        if (e.target.value.length > 0 && e.target.value.length !== 10) {
          e.target.setCustomValidity("El número telefónico debe tener exactamente 10 dígitos.");
        } else {
          e.target.setCustomValidity("");
        }
      }
      
      checkDuplicatePhoneNumbers();
    }
  });

  document.addEventListener('blur', (e) => {
    if (e.target.matches('input[type="tel"]')) {
      const val = e.target.value.trim().toLowerCase();
      if (bypassValues.includes(val) || val === '') {
        e.target.setCustomValidity("");
      } else {
        e.target.value = e.target.value.replace(/\D/g, '');
        if (e.target.value.length > 0 && e.target.value.length !== 10) {
          e.target.setCustomValidity("El número telefónico debe tener exactamente 10 dígitos o ser 'No tiene', 'No cuenta', 'No' o 'N/A'.");
          try { e.target.reportValidity(); } catch(err) {}
        } else {
          e.target.setCustomValidity("");
        }
      }
      checkDuplicatePhoneNumbers();
    }
  }, true);

  // Inicializar Iconos Lucide al inicio
  lucide.createIcons();
});

// ==========================================================================
// UTILIDADES SEGURAS DE ESCAPADO
// ==========================================================================

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function escapeJS(str) {
  if (!str) return '';
  return str.replace(/['"\\\n\r\u2028\u2029]/g, char => {
    switch (char) {
      case "'": return "\\'";
      case '"': return '\\"';
      case '\\': return '\\\\';
      case '\n': return '\\n';
      case '\r': return '\\r';
      default: return '';
    }
  });
}

function toTitleCase(str) {
  if (!str) return '';
  const prepositions = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 'a', 'ante', 'bajo', 'cabe', 'con', 'contra', 'desde', 'en', 'entre', 'hacia', 'hasta', 'para', 'por', 'según', 'sin', 'so', 'sobre', 'tras'];
  
  return str.toLowerCase().split(/\s+/).map((word, index) => {
    if (word.length === 0) return '';
    if (index > 0 && prepositions.includes(word)) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

function parseDateString(dateStr) {
  if (!dateStr) return null;
  // Standard ISO YYYY-MM-DD
  let match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10),
      day: parseInt(match[3], 10)
    };
  }
  // Spanish DD/MM/YYYY or DD-MM-YYYY
  match = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    return {
      year: parseInt(match[3], 10),
      month: parseInt(match[2], 10),
      day: parseInt(match[1], 10)
    };
  }
  return null;
}

// ==========================================================================
// MOTOR DE CÁLCULO DE CURP, RFC Y EDAD MEXICANOS (CLIENT-SIDE PORT)
// ==========================================================================
const MexicanCalculationsEngine = {
  calculateCURP: function(nombre, apPaterno, apMaterno, fechaNac, sexo, estado) {
    if (!nombre || !apPaterno || !fechaNac || !sexo || !estado) return '';
    try {
      nombre = this.cleanString(nombre);
      apPaterno = this.cleanString(apPaterno);
      apMaterno = apMaterno ? this.cleanString(apMaterno) : '';
      
      var nombresList = nombre.split(' ');
      if (nombresList.length > 1 && (nombresList[0] === 'JOSE' || nombresList[0] === 'MARIA' || nombresList[0] === 'J' || nombresList[0] === 'MA')) {
        nombre = nombresList[1];
      } else {
        nombre = nombresList[0];
      }

      apPaterno = this.removeArticles(apPaterno);
      apMaterno = this.removeArticles(apMaterno);

      var curp = '';
      
      // 1. Primera letra y vocal del apellido paterno
      curp += apPaterno.charAt(0);
      curp += this.getVocalInterna(apPaterno);
      
      // 2. Primera letra del apellido materno (o X si no tiene)
      curp += apMaterno ? apMaterno.charAt(0) : 'X';
      
      // 3. Primera letra del nombre
      curp += nombre.charAt(0);
      
      // Filtro de palabras altisonantes
      curp = this.filterBadWords(curp);
      
      // 4. Fecha de nacimiento (YYMMDD)
      var parsed = parseDateString(fechaNac);
      if (!parsed) return '';
      var yy = parsed.year.toString().substring(2, 4);
      var mm = ('0' + parsed.month).slice(-2);
      var dd = ('0' + parsed.day).slice(-2);
      curp += yy + mm + dd;
      
      // 5. Sexo (H o M)
      var s = String(sexo).toUpperCase().charAt(0);
      var sexLetter = (s === 'F' || s === 'M' && String(sexo).toUpperCase() === 'MUJER') ? 'M' : 'H';
      curp += sexLetter;
      
      // 6. Entidad Federativa (2 letras)
      curp += this.getStateCode(estado);
      
      // 7. Consonantes internas
      curp += this.getConsonanteInterna(apPaterno);
      curp += apMaterno ? this.getConsonanteInterna(apMaterno) : 'X';
      curp += this.getConsonanteInterna(nombre);
      
      // 8. Homoclave (letra para >= 2000, dígito para < 2000)
      curp += (parsed.year >= 2000) ? 'A' : '0';
      
      // 9. Dígito verificador
      curp += '1'; 
      
      return curp.toUpperCase();
    } catch(e) {
      console.error("Error calculando CURP: " + e);
      return '';
    }
  },

  calculateRFC: function(nombre, apPaterno, apMaterno, fechaNac) {
     if (!nombre || !apPaterno || !fechaNac) return '';
     try {
         var baseCurp = this.calculateCURP(nombre, apPaterno, apMaterno, fechaNac, 'H', 'DF').substring(0, 10);
         return baseCurp + 'XXX';
     } catch(e) {
         return '';
     }
  },

  cleanString: function(str) {
      if (!str) return '';
      return str.toUpperCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remover acentos nativamente
                .replace(/Ü/g, 'U')
                .trim();
  },

  removeArticles: function(str) {
      var prefixes = ['DA ', 'DAS ', 'DE ', 'DEL ', 'DER ', 'DI ', 'DIE ', 'DD ', 'EL ', 'LA ', 'LOS ', 'LAS ', 'LE ', 'LES ', 'MAC ', 'MC ', 'VAN ', 'VON ', 'Y '];
      var words = str.split(' ');
      var result = [];
      for (var i = 0; i < words.length; i++) {
          var isPrefix = false;
          for (var j = 0; j < prefixes.length; j++) {
              if (words[i] + ' ' === prefixes[j]) {
                  isPrefix = true;
                  break;
              }
          }
          if (!isPrefix) result.push(words[i]);
      }
      return result.join(' ');
  },

  getVocalInterna: function(str) {
      var m = str.substring(1).match(/[AEIOU]/);
      return m ? m[0] : 'X';
  },

  getConsonanteInterna: function(str) {
      var m = str.substring(1).match(/[^AEIOU\s]/);
      return m ? m[0] : 'X';
  },

  getStateCode: function(estadoNombre) {
      if (!estadoNombre) return 'NE';
      var state = String(estadoNombre).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      
      if (state.length === 2) return state;

      var states = {
          "AGUASCALIENTES": "AS",
          "BAJA CALIFORNIA": "BC",
          "BAJA CALIFORNIA SUR": "BS",
          "CAMPECHE": "CC",
          "COAHUILA": "CL",
          "COLIMA": "CM",
          "CHIAPAS": "CS",
          "CHIHUAHUA": "CH",
          "CIUDAD DE MEXICO": "DF",
          "CIUDAD DE MÉXICO": "DF",
          "DISTRITO FEDERAL": "DF",
          "DURANGO": "DG",
          "GUANAJUATO": "GT",
          "GUERRERO": "GR",
          "HIDALGO": "HG",
          "JALISCO": "JC",
          "MEXICO": "MC",
          "ESTADO DE MEXICO": "MC",
          "ESTADO DE MÉXICO": "MC",
          "MICHOACAN": "MN",
          "MICHOACÁN": "MN",
          "MORELOS": "MS",
          "NAYARIT": "NT",
          "NUEVO LEON": "NL",
          "NUEVO LEÓN": "NL",
          "OAXACA": "OC",
          "PUEBLA": "PL",
          "QUERETARO": "QT",
          "QUERÉTARO": "QT",
          "QUINTANA ROO": "QR",
          "SAN LUIS POTOSI": "SP",
          "SAN LUIS POTOSÍ": "SP",
          "SINALOA": "SL",
          "SONORA": "SR",
          "TABASCO": "TC",
          "TAMAULIPAS": "TS",
          "TLAXCALA": "TL",
          "VERACRUZ": "VZ",
          "YUCATAN": "YN",
          "YUCATÁN": "YN",
          "ZACATECAS": "ZS",
          "EXTRANJERO": "NE"
      };

      return states[state] || 'NE';
  },

  filterBadWords: function(word4) {
      var badWords = [
          "BACA", "BAKA", "BUEI", "BUEY", "CACA", "CACO", "CAGA", "CAGO", "CAKA", "CAKO",
          "COGE", "COGI", "COJA", "COJE", "COJI", "COJO", "COLA", "CULO", "FALO", "FETO",
          "GETA", "GUEI", "GUEY", "JETA", "JOTO", "KACA", "KACO", "KAGA", "KAGO", "KAKA",
          "KAKO", "KOGE", "KOGI", "KOJA", "KOJE", "KOJI", "KOJO", "KOLA", "KULO", "LILO",
          "LOCA", "LOCO", "LOKA", "LOKO", "MAME", "MAMI", "MAMO", "MEAR", "MEAS", "MEON",
          "MIAR", "MION", "MOCO", "MOKO", "MULA", "MULO", "NACA", "NACO", "PEDA", "PEDO",
          "PENE", "PIPI", "PITO", "POPO", "PUTA", "PUTO", "QULO", "RATA", "ROBA", "ROBE",
          "ROBO", "RUIN", "SENO", "TETA", "VACA", "VAGA", "VAGO", "VAKA", "VUEI", "VUEY",
          "WUEI", "WUEY"
      ];
      if (badWords.indexOf(word4) !== -1) {
          return word4.charAt(0) + 'X' + word4.substring(2);
      }
      return word4;
  }
};

// ==========================================================================
// CONFIGURAR LISTENERS Y TRIGGERS DE COMPORTAMIENTOS DINÁMICOS
// ==========================================================================
function setupCustomAutocompleteAndCalculations() {
  const candidateInput = document.getElementById('candidate-name-input');
  const dobInput = document.querySelector('input[type="date"][id*="nacimiento"], input[type="date"][id*="nac"]');
  const genderSelect = document.querySelector('select[id*="genero"], select[id*="género"], select[id*="sexo"]');
  const stateSelect = document.querySelector('select[id*="lugar_nacimiento"], select[id*="lugar_de_nacimiento"], select[id*="estado_nacimiento"]');
  
  if (candidateInput) {
    candidateInput.addEventListener('input', triggerMexicanCalculations);
    candidateInput.addEventListener('change', triggerMexicanCalculations);
  }
  if (dobInput) {
    dobInput.addEventListener('input', triggerMexicanCalculations);
    dobInput.addEventListener('change', triggerMexicanCalculations);
  }
  if (genderSelect) {
    genderSelect.addEventListener('change', triggerMexicanCalculations);
    genderSelect.addEventListener('input', triggerMexicanCalculations);
  }
  if (stateSelect) {
    stateSelect.addEventListener('change', triggerMexicanCalculations);
    stateSelect.addEventListener('input', triggerMexicanCalculations);
  }
  
  // Ejecutar auto-cálculos una vez al inicializar
  triggerMexicanCalculations();
  
  // Inyectar píldoras rápidas para Egresos, Contribuyentes y Entorno Familiar
  const familyNameInputs = document.querySelectorAll('input[id*="ref_eco_nombre"], input[id*="fam_nombre"], input[id*="ing_nombre"], input[id*="aportador_nombre"], input[id*="economica_nombre"], input[id*="egresos_nombre"], input[id*="nombre_familiar"]');
  familyNameInputs.forEach(input => {
    let pillContainer = input.parentNode.querySelector('.quick-familiar-pills');
    if (!pillContainer) {
      pillContainer = document.createElement('div');
      pillContainer.className = 'quick-familiar-pills';
      pillContainer.style.cssText = 'display: flex; gap: 6px; overflow-x: auto; padding: 4px 0; margin-top: 4px;';
      input.parentNode.appendChild(pillContainer);
      
      const roles = ['Padre', 'Madre', 'Hermano', 'Candidato'];
      pillContainer.innerHTML = roles.map(r => `
        <button type="button" class="btn-pill" style="background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.12); color: #10b981; padding: 4px 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onclick="quickFillFamiliarName('${input.id}', '${r}')">
          ${r}
        </button>
      `).join('');
    }
  });
  
  // Inyectar píldoras rápidas para Contacto de Emergencia
  const emergencyInputs = document.querySelectorAll('input[id*="emergencia_nombre"], input[id*="contacto_emergencia"], input[id*="nombre_emergencia"]');
  emergencyInputs.forEach(input => {
    let pillContainer = input.parentNode.querySelector('.quick-emergency-pills');
    if (!pillContainer) {
      pillContainer = document.createElement('div');
      pillContainer.className = 'quick-emergency-pills';
      pillContainer.style.cssText = 'display: flex; gap: 6px; overflow-x: auto; padding: 4px 0; margin-top: 4px;';
      input.parentNode.appendChild(pillContainer);
      
      const roles = ['Madre', 'Padre', 'Hermano', 'Cónyuge'];
      pillContainer.innerHTML = roles.map(r => `
        <button type="button" class="btn-pill" style="background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.12); color: var(--color-primary); padding: 4px 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onclick="quickFillEmergencyContact('${input.id}', '${r}')">
          ${r}
        </button>
      `).join('');
    }
  });
}

// Trigger principal de auto-cálculos editables
function triggerMexicanCalculations() {
  const candidateInput = document.getElementById('candidate-name-input');
  const candidateName = candidateInput ? candidateInput.value.trim() : '';
  
  const dobInput = document.querySelector('input[type="date"][id*="nacimiento"], input[type="date"][id*="nac"]');
  const genderSelect = document.querySelector('select[id*="genero"], select[id*="género"], select[id*="sexo"]');
  const stateSelect = document.querySelector('select[id*="lugar_nacimiento"], select[id*="lugar_de_nacimiento"], select[id*="estado_nacimiento"]');
  
  const curpField = document.querySelector('input[id*="curp"]');
  const rfcField = document.querySelector('input[id*="rfc"]');
  const ageField = document.querySelector('input[id*="edad"]');
  
  if (!dobInput || !dobInput.value) {
    if (ageField) {
      ageField.value = '';
      ageField.dispatchEvent(new Event('input', { bubbles: true }));
      ageField.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return;
  }
  
  // 1. Edad
  const dobVal = dobInput.value;
  const dobParsed = parseDateString(dobVal);
  const today = new Date();
  
  if (!dobParsed || dobParsed.year < 1900 || dobParsed.year > today.getFullYear()) {
    return; // Ignorar fechas parciales/inválidas mientras escribe
  }
  
  let calcAge = today.getFullYear() - dobParsed.year;
  const monthDiff = today.getMonth() - (dobParsed.month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobParsed.day)) {
    calcAge--;
  }
  if (calcAge >= 0 && ageField) {
    // Solo sobreescribir si el valor actual no ha sido editado por el usuario a un valor distinto
    const currentAgeVal = ageField.value.trim();
    if (currentAgeVal === '' || currentAgeVal == calcAge || parseInt(currentAgeVal) == calcAge) {
      ageField.value = calcAge;
      ageField.dispatchEvent(new Event('input', { bubbles: true }));
      ageField.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  if (!candidateName) return;
  
  // 2. CURP y RFC
  const sexo = genderSelect ? genderSelect.value : 'Masculino';
  const estado = stateSelect ? stateSelect.value : 'Ciudad de México';
  
  let n = '';
  let ap = '';
  let am = '';
  
  const partes = candidateName.split(' ');
  if (partes.length >= 3) {
    n = partes[0] + (partes.length > 3 ? ' ' + partes[1] : '');
    ap = partes[partes.length - 2];
    am = partes[partes.length - 1];
  } else if (partes.length === 2) {
    n = partes[0];
    ap = partes[partes.length - 1];
    am = '';
  } else {
    n = partes[0] || '';
    ap = '';
    am = '';
  }
  
  if (n && ap) {
    const curp = MexicanCalculationsEngine.calculateCURP(n, ap, am, dobVal, sexo, estado);
    const rfc = MexicanCalculationsEngine.calculateRFC(n, ap, am, dobVal);
    
    if (curp && curpField) {
      const currentCurpVal = curpField.value.trim().toUpperCase();
      // Solo sobreescribir si está vacío o si coincide con un cálculo previo parcial
      if (currentCurpVal === '' || currentCurpVal.substring(0, 10) === curp.substring(0, 10) || currentCurpVal.length < 10) {
        curpField.value = curp;
        curpField.dispatchEvent(new Event('input', { bubbles: true }));
        curpField.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    if (rfc && rfcField) {
      const currentRfcVal = rfcField.value.trim().toUpperCase();
      if (currentRfcVal === '' || currentRfcVal.substring(0, 10) === rfc.substring(0, 10) || currentRfcVal.length < 10) {
        rfcField.value = rfc;
        rfcField.dispatchEvent(new Event('input', { bubbles: true }));
        rfcField.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }
}

// Búsqueda dinámica de nombres capturados
function lookupCapturedName(role) {
  const roleLower = role.toLowerCase();
  if (roleLower === 'candidato') {
    const candInput = document.getElementById('candidate-name-input');
    return candInput ? candInput.value.trim() : '';
  }
  
  const possibleFields = document.querySelectorAll('.form-input, .form-textarea, .form-select');
  for (const f of possibleFields) {
    const id = f.id.toLowerCase();
    if (id.includes(roleLower) && id.includes('nombre') && !id.includes('parentesco') && !id.includes('edad') && !id.includes('telefono') && !id.includes('tel')) {
      if (f.value && f.value.trim() !== '') return f.value.trim();
    }
  }
  
  // Buscar en Entorno Familiar si existe algún familiar con ese parentesco
  const parentescoFields = Array.from(document.querySelectorAll('select[id*="parentesco"], input[id*="parentesco"]'));
  const matchField = parentescoFields.find(f => f.value && f.value.toLowerCase() === roleLower);
  if (matchField) {
    const numMatch = matchField.id.match(/\d+/);
    if (numMatch) {
      const index = numMatch[0];
      // Obtener el prefijo del ID (ej. fam_parentesco_1 -> fam)
      const prefix = matchField.id.split('_parentesco')[0];
      const nameField = document.getElementById(`${prefix}_nombre_${index}`) || document.getElementById(`field-${prefix}_nombre_${index}`) || document.getElementById(`${prefix}_nombre`) || document.getElementById(`field-${prefix}_nombre`);
      if (nameField && nameField.value && nameField.value.trim() !== '') {
        return nameField.value.trim();
      }
    }
  }
  
  return '';
}

// Búsqueda dinámica de teléfonos capturados
function lookupCapturedPhone(role) {
  const roleLower = role.toLowerCase();
  const possibleFields = document.querySelectorAll('.form-input, .form-textarea, .form-select');
  
  if (roleLower === 'candidato') {
    for (const f of possibleFields) {
      const id = f.id.toLowerCase();
      if ((id.includes('telefono') || id.includes('tel') || id.includes('celular')) && !id.includes('padre') && !id.includes('madre') && !id.includes('emergencia') && !id.includes('trabajo') && !id.includes('empleo')) {
        if (f.value && f.value.trim() !== '') return f.value.trim();
      }
    }
  }
  
  for (const f of possibleFields) {
    const id = f.id.toLowerCase();
    if (id.includes(roleLower) && (id.includes('telefono') || id.includes('tel') || id.includes('celular') || id.includes('recados'))) {
      if (f.value && f.value.trim() !== '') return f.value.trim();
    }
  }
  
  return '';
}

// Rellenar familiar de un solo clic
window.quickFillFamiliarName = (inputId, role) => {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const name = lookupCapturedName(role);
  if (name) {
    input.value = name;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Auto-rellenar parentesco en la misma fila
    const possibleParentescoIds = [
      inputId.replace('nombre', 'parentesco'),
      inputId.replace('nombre', 'relacion'),
      inputId.replace('aportador', 'parentesco'),
      `field-emergencia_parentesco`
    ];
    
    for (const id of possibleParentescoIds) {
      const pField = document.getElementById(id);
      if (pField && pField.id !== inputId) {
        pField.value = role;
        pField.dispatchEvent(new Event('input', { bubbles: true }));
        pField.dispatchEvent(new Event('change', { bubbles: true }));
        break;
      }
    }
  } else {
    alert(`Aún no se ha capturado el nombre de: ${role}.`);
  }
};

// Rellenar contacto de emergencia
window.quickFillEmergencyContact = (inputId, role) => {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const name = lookupCapturedName(role);
  const phone = lookupCapturedPhone(role);
  
  if (name) {
    input.value = name;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Rellenar teléfono de emergencia
    const possiblePhoneSelectors = [
      inputId.replace('nombre', 'telefono'),
      inputId.replace('nombre', 'tel'),
      `input[id*="emergencia_telefono"]`,
      `input[id*="emergencia_tel"]`,
      `input[id*="telefono_emergencia"]`
    ];
    
    for (const sel of possiblePhoneSelectors) {
      const pField = document.getElementById(sel) || document.querySelector(sel);
      if (pField && pField.id !== inputId) {
        pField.value = phone || '';
        pField.dispatchEvent(new Event('input', { bubbles: true }));
        pField.dispatchEvent(new Event('change', { bubbles: true }));
        break;
      }
    }
    
    // Rellenar parentesco de emergencia
    const pField = document.getElementById('field-emergencia_parentesco') || document.querySelector('[id*="emergencia_parentesco"]');
    if (pField) {
      pField.value = role;
      pField.dispatchEvent(new Event('input', { bubbles: true }));
      pField.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else {
    alert(`Aún no se ha capturado el nombre de: ${role}.`);
  }
};

// Autocompletar dominios de correo en tiempo real
document.addEventListener('input', (e) => {
  if (e.target.matches('input[type="email"], input[id*="correo"], input[id*="email"]')) {
    const emailInput = e.target;
    const val = emailInput.value.trim();
    let suggestionsContainer = emailInput.parentNode.querySelector('.email-suggestions');
    
    if (!suggestionsContainer) {
      suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'email-suggestions';
      suggestionsContainer.style.cssText = 'display: flex; gap: 6px; overflow-x: auto; padding: 4px 0; margin-top: 4px; z-index: 10;';
      emailInput.parentNode.appendChild(suggestionsContainer);
    }
    
    if (val && !val.includes('@')) {
      const domains = ['@gmail.com', '@outlook.com', '@hotmail.com', '@yahoo.com.mx', '@icloud.com'];
      suggestionsContainer.innerHTML = domains.map(d => `
        <button type="button" class="btn-suggestion" style="background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.12); color: var(--color-primary); padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.2s;" onclick="completeEmailField('${emailInput.id}', '${d}')">
          ${d}
        </button>
      `).join('');
      suggestionsContainer.style.display = 'flex';
    } else {
      suggestionsContainer.style.display = 'none';
    }
  }
});

window.completeEmailField = (inputId, domain) => {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = input.value.trim() + domain;
    const suggestionsContainer = input.parentNode.querySelector('.email-suggestions');
    if (suggestionsContainer) suggestionsContainer.style.display = 'none';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.focus();
  }
};

