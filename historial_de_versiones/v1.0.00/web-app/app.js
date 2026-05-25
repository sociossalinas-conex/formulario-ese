/**
 * Ecosistema de Automatización de Estudios Socioeconómicos
 * Frontend SPA Logic: app.js
 * 
 * Desarrollado por: Arquitecto de Software Senior y Desarrollador Full-Stack
 */

// 1. Inicialización Resiliente de Supabase Client
const SUPABASE_URL = "https://mcdjysjrezxmghmvannh.supabase.co";
const SUPABASE_KEY = "sb_publishable_2zg1_mv94Gvpl8b3lZOvMQ_xRlrgrQS";
let supabase = null;

function getSupabaseClient() {
  if (supabase) return supabase;
  
  try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      return supabase;
    }
  } catch (err) {
    console.error("Error al inicializar el cliente de Supabase:", err);
  }
  return null;
}

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
  { id: 1, client_name: "Google", commercial_brand: "Conexion Ejecutiva" },
  { id: 2, client_name: "Microsoft", commercial_brand: "Recurso Humano" },
  { id: 3, client_name: "Amazon", commercial_brand: "Nomipago" }
];

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

  state.mappings.forEach(mapping => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHTML(mapping.client_name)}</strong></td>
      <td>
        <span class="commercial-badge">
          ${escapeHTML(mapping.commercial_brand)}
        </span>
      </td>
      <td class="text-right">
        <div class="actions-row">
          <button class="btn-table-action edit" onclick="openEditMappingModal(${mapping.id}, '${escapeJS(mapping.client_name)}', '${escapeJS(mapping.commercial_brand)}')">
            <i data-lucide="edit-3"></i>
          </button>
          <button class="btn-table-action delete" onclick="handleDeleteMapping(${mapping.id})">
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
  } else {
    // Por defecto Conexion Ejecutiva
    state.resolvedBrand = "Conexion Ejecutiva"; 
  }
}

function showValidationMessage(element, text, stateClass) {
  element.innerText = text;
  element.className = `validation-message active ${stateClass}`;
}

// ==========================================================================
// CONSTRUCTOR INTELIGENTE DE FORMULARIOS DINÁMICOS MOBILE-FIRST
// ==========================================================================

function buildDynamicForm(template) {
  // Ajustar cabecera metadata
  document.getElementById('form-company-badge').innerText = template.name;
  document.getElementById('form-brand-badge').innerText = state.resolvedBrand;
  document.getElementById('form-title').innerText = `Estudio Socioeconómico`;
  
  // Limpiar campos anteriores y reiniciar progreso
  const formContainer = document.getElementById('dynamic-capture-form');
  formContainer.innerHTML = "";
  document.getElementById('form-progress').style.width = "0%";
  document.getElementById('candidate-name-input').value = "";

  const schema = template.form_schema;
  
  if (!schema || schema.length === 0) {
    formContainer.innerHTML = `<p class="text-center text-muted">La plantilla no contiene campos válidos.</p>`;
    return;
  }

  // Agrupar campos por su naturaleza de forma visual (ej. Generales, Datos de Contacto)
  const generalGroup = document.createElement('div');
  generalGroup.className = 'card-inner-field';
  
  const innerTitle = document.createElement('h3');
  innerTitle.className = 'inner-section-title';
  innerTitle.innerText = 'Preguntas de la Visita';
  generalGroup.appendChild(innerTitle);

  schema.forEach(field => {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    // Generar estructura según el tipo de campo (tel, email, number, date, textarea, text)
    if (field.tipo === 'textarea') {
      formGroup.innerHTML = `
        <label class="form-group-select-label" style="margin-bottom:6px;">${escapeHTML(field.label)} ${field.requerido ? '*' : ''}</label>
        <textarea id="field-${field.id}" class="form-textarea" placeholder="${escapeHTML(field.placeholder)}" ${field.requerido ? 'required' : ''}></textarea>
      `;
    } else {
      // Obtener icono idóneo para el input wrapper
      let iconName = 'help-circle';
      if (field.tipo === 'tel') iconName = 'phone';
      else if (field.tipo === 'email') iconName = 'mail';
      else if (field.tipo === 'date') iconName = 'calendar';
      else if (field.tipo === 'number') iconName = 'numeric';

      formGroup.innerHTML = `
        <div class="input-wrapper">
          <i data-lucide="${iconName}" class="input-icon"></i>
          <input type="${field.tipo}" id="field-${field.id}" class="form-input" placeholder=" " ${field.requerido ? 'required' : ''} autocomplete="off">
          <label for="field-${field.id}" class="form-label">${escapeHTML(field.label)} ${field.requerido ? '*' : ''}</label>
        </div>
      `;
    }

    generalGroup.appendChild(formGroup);
  });

  formContainer.appendChild(generalGroup);
  
  // Agregar detector para actualizar barra de progreso
  setupProgressTracking(schema);
  lucide.createIcons();
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
  };

  // Escuchar eventos en todo el formulario
  candidateInput.addEventListener('input', updateProgress);
  schema.forEach(field => {
    const element = document.getElementById(`field-${field.id}`);
    if (element) {
      element.addEventListener('input', updateProgress);
      element.addEventListener('change', updateProgress);
    }
  });
}

// ==========================================================================
// ENVÍO DE FORMULARIO DE CAPTURA COMPLETADO A SUPABASE
// ==========================================================================

async function submitCapturedForm() {
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

  // Acumular las respuestas asociándolas a sus llaves ("braces") correspondientes
  const answers = {};
  state.matchedTemplate.form_schema.forEach(field => {
    const element = document.getElementById(`field-${field.id}`);
    if (element) {
      answers[field.id] = element.value.trim();
    }
  });

  const payload = {
    template_id: state.matchedTemplate.id,
    client_name: state.matchedTemplate.name,
    candidate_name: candidateName,
    commercial_brand: state.resolvedBrand,
    captured_data: answers,
    created_at: new Date().toISOString()
  };

  console.log("Subiendo captura finalizada a Supabase...", payload);

  try {
    const client = getSupabaseClient();
    if (!client) {
      alert("Error: El cliente de base de datos no está inicializado.");
      return;
    }

    const { data, error } = await client
      .from('socioeconomic_captures')
      .insert(payload)
      .select();

    if (error) {
      console.error(error);
      
      // Si la tabla no existe en la consola de Supabase todavía
      if (error.code === '42P01') {
        alert("Excelente captura. La tabla 'socioeconomic_captures' no existe en tu Supabase. Se muestra en consola el JSON listo para guardar.");
        console.log(JSON.stringify(payload, null, 2));
      } else {
        alert("Error al guardar la captura en la base de datos.");
      }
    } else {
      alert("¡Estudio Socioeconómico guardado con éxito!");
    }
    
    // Regresar al inicio
    navigateTo('view-welcome');
  } catch (err) {
    console.error(err);
    alert("Error de conexión al subir la captura.");
  }
}

// ==========================================================================
// CRUD PANEL ADMINISTRADOR: GESTIÓN DE MAPEOS (MODAL COMPORTAMIENTO)
// ==========================================================================

const mappingModal = document.getElementById('mapping-modal');

document.getElementById('btn-open-mapping-modal').addEventListener('click', () => {
  document.getElementById('mapping-id').value = "";
  document.getElementById('mapping-client-name').value = "";
  document.getElementById('mapping-client-name').removeAttribute('readonly');
  document.getElementById('mapping-commercial-brand').value = "Conexion Ejecutiva";
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
  
  const idVal = document.getElementById('mapping-id').value;
  const clientName = document.getElementById('mapping-client-name').value.trim();
  const commercialBrand = document.getElementById('mapping-commercial-brand').value;

  const payload = {
    client_name: clientName,
    commercial_brand: commercialBrand
  };

  try {
    const client = getSupabaseClient();
    
    if (idVal) {
      // Editar existente en Supabase o local
      const idNum = parseInt(idVal);
      const idx = state.mappings.findIndex(m => m.id === idNum);
      if (idx !== -1) {
        state.mappings[idx].commercial_brand = commercialBrand;
      }
      
      // Intentar actualizar en DB
      if (client) {
        await client
          .from('client_mappings')
          .update({ commercial_brand: commercialBrand })
          .eq('id', idNum);
      }
        
    } else {
      // Agregar nuevo en Supabase o local
      const newId = Date.now();
      state.mappings.push({ id: newId, client_name: clientName, commercial_brand: commercialBrand });
      
      // Intentar insertar en DB
      if (client) {
        await client
          .from('client_mappings')
          .insert(payload);
      }
    }
  } catch (err) {
    console.warn("DB offline o tabla inexistente. Modificación realizada de forma local temporal.");
  }

  // Recargar tabla, cerrar modal y actualizar conteo
  renderMappingsTable();
  document.getElementById('kpi-mappings-count').innerText = state.mappings.length;
  mappingModal.classList.remove('active');
});

function openEditMappingModal(id, clientName, commercialBrand) {
  document.getElementById('mapping-id').value = id;
  document.getElementById('mapping-client-name').value = clientName;
  document.getElementById('mapping-client-name').setAttribute('readonly', 'true'); // No cambiar el cliente, solo su marca
  document.getElementById('mapping-commercial-brand').value = commercialBrand;
  document.getElementById('modal-title-action').innerText = "Editar Mapeo de Marca";
  mappingModal.classList.add('active');
}

async function handleDeleteMapping(id) {
  if (confirm("¿Está seguro de que desea eliminar este mapeo?")) {
    state.mappings = state.mappings.filter(m => m.id !== id);
    
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

document.addEventListener('DOMContentLoaded', () => {
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
      navigateTo('view-welcome');
    }
  });

  // Guardar Captura
  document.getElementById('btn-submit-capture').addEventListener('click', submitCapturedForm);

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
