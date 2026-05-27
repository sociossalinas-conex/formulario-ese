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
      setTimeout(() => {
        companyInput.value = "";
        validationMsg.classList.remove('active');
        
        // Cargar el formulario dinámico e ir a la vista de captura
        buildDynamicForm(matched);
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

function buildDynamicForm(template) {
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
  
  const sectionsConfigField = schema.find(f => f.id === '__sections_config__');
  if (sectionsConfigField && sectionsConfigField.sections) {
    activeWizardSections = JSON.parse(JSON.stringify(sectionsConfigField.sections));
  } else {
    activeWizardSections = JSON.parse(JSON.stringify(defaultSections));
  }

  // Filtrar el campo especial de secciones y duplicados de Nombre
  schema = schema.filter(f => {
    if (f.id === '__sections_config__') return false;
    if (f.id.toLowerCase() === 'nombre' || f.id.toLowerCase() === 'nombre_candidato') return false;
    return true;
  });

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

  // Setup Age calculation trigger for ALL templates and fields dynamically
  const dobFields = document.querySelectorAll('input[type="date"][id*="nacimiento"]');
  const ageFields = document.querySelectorAll('input[id*="edad"]');
  
  if (dobFields.length > 0 && ageFields.length > 0) {
    dobFields.forEach(dobField => {
      const handleAgeCalc = () => {
        if (dobField.value) {
          const dob = new Date(dobField.value);
          const today = new Date();
          let calcAge = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            calcAge--;
          }
          if (calcAge >= 0) {
            ageFields.forEach(ageField => {
              ageField.value = calcAge;
              // Trigger input/change events to update progress and conditional visibilities
              ageField.dispatchEvent(new Event('input', { bubbles: true }));
              ageField.dispatchEvent(new Event('change', { bubbles: true }));
            });
          }
        }
      };
      
      dobField.addEventListener('input', handleAgeCalc);
      dobField.addEventListener('change', handleAgeCalc);
    });
  }

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
      if (field.id.includes('direccion') || field.id.includes('calle') || field.id.includes('colonia') || field.id.includes('nombre')) {
        element.addEventListener('input', (e) => {
          const start = e.target.selectionStart;
          const end = e.target.selectionEnd;
          e.target.value = capitalizeProperNoun(e.target.value);
          e.target.setSelectionRange(start, end);
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

  // Validar y Formatear Números Telefónicos (10 dígitos, sin espacios, solo números)
  document.addEventListener('input', (e) => {
    if (e.target.matches('input[type="tel"]')) {
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
  });

  document.addEventListener('blur', (e) => {
    if (e.target.matches('input[type="tel"]')) {
      if (e.target.value.length > 0 && e.target.value.length !== 10) {
        e.target.setCustomValidity("El número telefónico debe tener exactamente 10 dígitos.");
        try { e.target.reportValidity(); } catch(err) {}
      } else {
        e.target.setCustomValidity("");
      }
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
