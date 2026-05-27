const SUPABASE_URL = "https://mcdjysjrezxmghmvannh.supabase.co";
const SUPABASE_KEY = "sb_publishable_2zg1_mv94Gvpl8b3lZOvMQ_xRlrgrQS";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let templates = [];
let currentTemplate = null;

// Lógica de Clasificación copiada para pre-llenar los vacíos
function getSuggestedSection(fieldId) {
  if (!fieldId) return 'sec-personales';
  const id = fieldId.toLowerCase();
  
  if (id.match(/fecha.*solicitud/) || id.match(/fecha.*visita/) || id.match(/elaborado_por/) || id === 'puesto' || id === 'puesto_solicitado' || id.match(/demandas/) || id.match(/resultado/) || id.match(/solicitado_por/)) return 'sec-estudio';
  
  if (id.includes('empresa') || id.includes('giro') || id.includes('contrato') || id.match(/fecha.*ingreso/) || id.match(/fecha.*salida/) || id.includes('sueldo') || id.match(/motivo.*salida/) || id.match(/jefe/) || id.includes('puntualidad') || id.includes('asistencia') || id.includes('companero') || id.match(/relacion.*compañero/) || id.match(/relacion.*superior/) || id.includes('responsabilidad') || id.includes('honestidad') || id.includes('equipo') || id.includes('disciplina') || id.includes('confiabilidad') || id.includes('iniciativa') || id.match(/calidad.*trabajo/) || id.includes('observaciones_laboral') || id.includes('falta') || id.includes('incapacidad') || id.includes('recomendable') || id.includes('omitido') || id.includes('proporciono_informacion') || id.includes('puesto') || id.includes('persona_informacion')) return 'sec-laboral';
  
  if (id.includes('doc_') || id.match(/documento.*acta/) || id.match(/^acta.*nacimiento$/) || id.includes('rfc') || id.includes('curp') || id.includes('imss') || id.includes('nss') || id.includes('ine') || id.includes('folio') || id.includes('tipo_documento') || id.includes('emergencia') || id.includes('foto') || id.includes('mapa') || id.includes('ubicacion') || id.includes('comprobante_domicilio') || id.includes('recomendacion') || id.includes('nomina') || id.includes('infonavit') || id.includes('cartilla') || id.includes('pasaporte')) return 'sec-evidencias';

  if (id.match(/tiempo.*conocerlo/) || id.match(/como.*describiria/)) return 'sec-referencias';

  if (id.includes('grado') || id.includes('escolar') || id.includes('escuela') || id.includes('documento_obtenido') || id.includes('inmueble') || id.includes('automovil') || id.includes('moto') || id.includes('tipo_casa') || id === 'casa' || id.includes('terreno') || id.match(/valor.*aproximado/) || id.includes('dueño') || id.includes('comprobatorio') || id.includes('habit') || id.includes('limpieza') || id.includes('construccion') || id.includes('baño') || id.includes('bano') || id.includes('cocina') || id.includes('sala') || id.includes('comedor') || id.includes('cuarto') || id.includes('recamara') || id.includes('nivel') || id.includes('estacionamiento') || id.includes('urbana') || id.includes('mueble') || id.match(/años.*escuela/)) return 'sec-escolaridad';

  if (id.includes('parentesco') || id.includes('ocupacion') || id.match(/telefono.*empleo/) || id.includes('aportador') || id.includes('ingreso') || id.includes('egreso') || id.includes('predial') || id.includes('hipoteca') || id.includes('renta') || id.includes('servicios') || id.includes('luz') || id.includes('agua') || id.includes('gas') || id.includes('cable') || id.includes('internet') || id.includes('pavimentacion') || id.includes('vigilancia') || id.includes('alumbrado') || id.includes('alimentacion') || id.includes('transporte') || id.includes('educacion') || id.includes('colegiatura') || id.includes('vestido') || id.includes('diversion') || id.includes('gastos_medicos') || id.includes('entretenimiento') || id.match(/plan.*celular/) || id.includes('mascotas_gasto') || id.includes('mantenimiento') || id.includes('deuda') || id.includes('observaciones_familia') || id.includes('ref_eco_')) return 'sec-economia';

  if (id.includes('originario') || id.includes('densidad') || id.includes('migratorio') || id.includes('farmaco') || id.includes('vandalismo') || id.includes('club') || id.includes('asociacion') || id.includes('deportivo') || id.includes('religion') || id.includes('pasatiempo') || id.match(/mascotas.*cantidad/) || id.includes('tatuaje') || id.includes('alergia') || id.includes('fuma') || id.includes('toma') || id.includes('peso') || id.includes('altura') || id.includes('deporte') || id.includes('enfermedad') || id.includes('patologico') || id.includes('dental') || id.includes('aspecto') || id.match(/familiar.*empresa/) || id.match(/laborado.*empresa/) || id.includes('enteró_vacante') || id.includes('autodescripcion') || id.includes('meta') || id.match(/mas.*importante/)) return 'sec-entorno';

  return 'sec-personales';
}

let customSections = [];
let SECTION_OPTIONS = [];

function updateSectionOptions() {
  SECTION_OPTIONS = customSections.map(sec => ({ val: sec.id, label: sec.label }));
  SECTION_OPTIONS.push({ val: 'hidden', label: '❌ Ocultos / No Mostrar' });
}

async function loadTemplates() {
  const { data, error } = await supabaseClient.from('socioeconomic_templates').select('*').order('name');
  if (error) {
    console.error(error);
    alert('Error al cargar plantillas');
    return;
  }
  
  templates = data;
  renderTemplateList();
}

function renderTemplateList(filter = '') {
  const listEl = document.getElementById('template-list');
  listEl.innerHTML = '';
  
  const filtered = templates.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()));
  
  filtered.forEach(t => {
    const btn = document.createElement('button');
    btn.className = `template-btn ${currentTemplate && currentTemplate.id === t.id ? 'active' : ''}`;
    btn.innerHTML = `<i data-lucide="file-text" style="width: 16px; height: 16px;"></i> ${t.name}`;
    btn.onclick = () => selectTemplate(t.id);
    listEl.appendChild(btn);
  });
  lucide.createIcons();
}

document.getElementById('search-templates').addEventListener('input', (e) => {
  renderTemplateList(e.target.value);
});

function selectTemplate(id) {
  currentTemplate = JSON.parse(JSON.stringify(templates.find(t => t.id === id))); // Clon profundo
  
  document.querySelectorAll('.template-btn').forEach(btn => btn.classList.remove('active'));
  event.currentTarget.classList.add('active');
  
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('editor-main').style.display = 'block';
  
  document.getElementById('current-template-name').innerText = currentTemplate.name;
  
  // Colapsar el panel de secciones por defecto al cambiar de plantilla
  const sectionsContent = document.getElementById('sections-manager-content');
  if (sectionsContent) sectionsContent.style.display = 'none';
  const toggleIcon = document.getElementById('sections-toggle-icon');
  if (toggleIcon) toggleIcon.innerText = '▼';

  // Buscar configuración de secciones
  const defaultSections = [
    { id: 'sec-estudio', label: '1. Estudio Socioeconómico' },
    { id: 'sec-personales', label: '2. Datos Personales' },
    { id: 'sec-escolaridad', label: '3. Escolaridad e Inmuebles' },
    { id: 'sec-economia', label: '4. Familiar y Economía' },
    { id: 'sec-entorno', label: '5. Entorno y Salud' },
    { id: 'sec-referencias', label: '6. Referencias Personales' },
    { id: 'sec-laboral', label: '7. Historial Laboral' },
    { id: 'sec-evidencias', label: '8. Documentos y Evidencias' }
  ];
  
  const sectionsConfigField = currentTemplate.form_schema.find(f => f.id === '__sections_config__');
  if (sectionsConfigField && sectionsConfigField.sections) {
    customSections = JSON.parse(JSON.stringify(sectionsConfigField.sections));
  } else {
    customSections = JSON.parse(JSON.stringify(defaultSections));
  }
  
  // Filtrar metadato del esquema de campos activos
  currentTemplate.form_schema = currentTemplate.form_schema.filter(f => f.id !== '__sections_config__');
  
  document.getElementById('current-template-count').innerText = `${currentTemplate.form_schema.length} campos detectados`;
  
  // Asegurar que tengan sección asignada
  currentTemplate.form_schema.forEach(field => {
    if (!field.section) field.section = getSuggestedSection(field.id);
  });
  
  updateSectionOptions();
  renderSectionsList();
  renderFieldsGrouped();
}

// ==========================================================================
// LOGICA DE CONFIGURACIÓN DINÁMICA DE SECCIONES (ASISTENTE)
// ==========================================================================

window.toggleSectionsManager = function() {
  const content = document.getElementById('sections-manager-content');
  const toggleIcon = document.getElementById('sections-toggle-icon');
  if (content.style.display === 'none') {
    content.style.display = 'block';
    toggleIcon.innerText = '▲';
    toggleIcon.style.transform = 'rotate(180deg)';
  } else {
    content.style.display = 'none';
    toggleIcon.innerText = '▼';
    toggleIcon.style.transform = 'rotate(0deg)';
  }
};

window.renderSectionsList = function() {
  const container = document.getElementById('sections-list-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (customSections.length === 0) {
    container.innerHTML = `<p class="text-center text-muted" style="margin: 10px 0; font-size: 0.9rem;">No hay secciones configuradas. Agrega una nueva sección.</p>`;
    return;
  }
  
  customSections.forEach((sec, idx) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '12px';
    row.style.background = 'var(--bg-card)';
    row.style.padding = '8px 12px';
    row.style.borderRadius = '8px';
    row.style.border = '1px solid var(--border-card)';
    row.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
    
    // ID de la sección (Badge de sólo lectura)
    const idBadge = document.createElement('span');
    idBadge.innerText = sec.id;
    idBadge.style.fontSize = '0.75rem';
    idBadge.style.background = 'var(--color-primary-glow)';
    idBadge.style.color = 'var(--color-primary)';
    idBadge.style.padding = '4px 8px';
    idBadge.style.borderRadius = '6px';
    idBadge.style.fontFamily = 'monospace';
    idBadge.style.fontWeight = '600';
    idBadge.style.width = '110px';
    idBadge.style.whiteSpace = 'nowrap';
    idBadge.style.overflow = 'hidden';
    idBadge.style.textOverflow = 'ellipsis';
    idBadge.style.textAlign = 'center';
    
    // Input para el título de la sección
    const input = document.createElement('input');
    input.type = 'text';
    input.value = sec.label;
    input.className = 'form-input';
    input.style.flex = '1';
    input.style.padding = '6px 10px';
    input.style.fontSize = '0.9rem';
    input.oninput = (e) => {
      customSections[idx].label = e.target.value;
      updateSectionOptions();
      // Actualizar cabecera de acordeón en vivo si está renderizada
      const headerTitle = document.querySelector(`.section-group[data-section="${sec.id}"] .section-title span`);
      if (headerTitle) {
        headerTitle.innerText = e.target.value;
      }
    };
    
    // Botones de acción
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '4px';
    
    // Botón Subir (▲)
    const upBtn = document.createElement('button');
    upBtn.className = 'btn-icon';
    upBtn.innerHTML = '<i data-lucide="arrow-up" style="width: 14px; height: 14px;"></i>';
    upBtn.style.padding = '6px';
    upBtn.style.border = 'none';
    upBtn.style.background = 'transparent';
    upBtn.style.color = 'var(--color-text-main)';
    upBtn.disabled = idx === 0;
    upBtn.style.opacity = idx === 0 ? '0.3' : '1';
    upBtn.style.cursor = idx === 0 ? 'not-allowed' : 'pointer';
    upBtn.onclick = () => moveSection(idx, -1);
    
    // Botón Bajar (▼)
    const downBtn = document.createElement('button');
    downBtn.className = 'btn-icon';
    downBtn.innerHTML = '<i data-lucide="arrow-down" style="width: 14px; height: 14px;"></i>';
    downBtn.style.padding = '6px';
    downBtn.style.border = 'none';
    downBtn.style.background = 'transparent';
    downBtn.style.color = 'var(--color-text-main)';
    downBtn.disabled = idx === customSections.length - 1;
    downBtn.style.opacity = idx === customSections.length - 1 ? '0.3' : '1';
    downBtn.style.cursor = idx === customSections.length - 1 ? 'not-allowed' : 'pointer';
    downBtn.onclick = () => moveSection(idx, 1);
    
    // Botón Eliminar (🗑️)
    const delBtn = document.createElement('button');
    delBtn.className = 'btn-icon';
    delBtn.innerHTML = '<i data-lucide="trash-2" style="width: 14px; height: 14px; color: #ef4444;"></i>';
    delBtn.style.padding = '6px';
    delBtn.style.border = 'none';
    delBtn.style.background = 'transparent';
    delBtn.style.cursor = 'pointer';
    delBtn.onclick = () => deleteSection(sec.id);
    
    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
    actions.appendChild(delBtn);
    
    row.appendChild(idBadge);
    row.appendChild(input);
    row.appendChild(actions);
    
    container.appendChild(row);
  });
  
  lucide.createIcons();
};

window.moveSection = function(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= customSections.length) return;
  
  // Intercambiar en el array customSections
  const temp = customSections[index];
  customSections[index] = customSections[targetIndex];
  customSections[targetIndex] = temp;
  
  updateSectionOptions();
  renderSectionsList();
  renderFieldsGrouped();
};

window.addNewSection = function() {
  const newName = prompt('Escribe el título de la nueva sección:');
  if (!newName || newName.trim() === '') return;
  
  // Generar ID único limpio
  const cleanId = 'sec-custom-' + Date.now();
  
  customSections.push({
    id: cleanId,
    label: newName.trim()
  });
  
  updateSectionOptions();
  renderSectionsList();
  renderFieldsGrouped();
  
  // Hacer scroll suave hacia el contenedor de la nueva sección vacía
  setTimeout(() => {
    const newGroup = document.querySelector(`.section-group[data-section="${cleanId}"]`);
    if (newGroup) {
      newGroup.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
};

window.deleteSection = function(secId) {
  const section = customSections.find(s => s.id === secId);
  if (!section) return;
  
  const fields = currentTemplate.form_schema.filter(f => f.section === secId);
  
  let confirmMsg = `¿Estás seguro de que quieres eliminar la sección "${section.label}"?`;
  if (fields.length > 0) {
    confirmMsg += `\n\n⚠️ ¡Atención! Esta sección contiene ${fields.length} campos. Si la eliminas, todos sus campos serán movidos automáticamente a la sección "❌ Ocultos / No Mostrar" para que no pierdas ningún dato.`;
  }
  
  if (confirm(confirmMsg)) {
    // Reubicar campos a 'hidden'
    if (fields.length > 0) {
      fields.forEach(field => {
        field.section = 'hidden';
      });
    }
    
    // Eliminar sección del array
    customSections = customSections.filter(s => s.id !== secId);
    
    updateSectionOptions();
    renderSectionsList();
    renderFieldsGrouped();
  }
};


// Búsqueda de campos
document.getElementById('search-fields').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('.field-accordion').forEach(card => {
    const text = card.textContent.toLowerCase();
    const id = card.dataset.id.toLowerCase();
    if (text.includes(query) || id.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});

let sortableInstances = [];

function renderFieldsGrouped() {
  const container = document.getElementById('fields-container');
  container.innerHTML = '';
  
  // Limpiar instancias previas de Sortable
  sortableInstances.forEach(s => s.destroy());
  sortableInstances = [];
  
  SECTION_OPTIONS.forEach(secDef => {
    const fieldsInSection = currentTemplate.form_schema.filter(f => f.section === secDef.val);
    
    // Contenedor de sección
    const secGroup = document.createElement('div');
    secGroup.className = 'section-group';
    secGroup.dataset.section = secDef.val;
    
    secGroup.innerHTML = `
      <h3 class="section-title">
        <span>${secDef.label}</span>
        <span style="font-size: 0.8rem; background: rgba(37,99,235,0.1); padding: 4px 8px; border-radius: 12px;">${fieldsInSection.length} campos</span>
      </h3>
      <div class="sortable-list" id="list-${secDef.val}"></div>
    `;
    
    container.appendChild(secGroup);
    
    const listContainer = secGroup.querySelector('.sortable-list');
    
    fieldsInSection.forEach(field => {
      const card = createFieldAccordion(field);
      listContainer.appendChild(card);
    });
    
    // Inicializar Sortable
    const sortable = Sortable.create(listContainer, {
      group: 'shared', // Permite arrastrar entre secciones
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      onEnd: function (evt) {
        // Al soltar en una nueva sección, actualizamos visualmente el switch si se fue a hidden
        const toSection = evt.to.closest('.section-group').dataset.section;
        const itemEl = evt.item;
        
        // Actualizar switch
        const switchEl = itemEl.querySelector('.visibility-switch');
        if (switchEl) {
          switchEl.checked = toSection !== 'hidden';
        }
        
        // Actualizar opacidad
        if (toSection === 'hidden') itemEl.classList.add('hidden-field');
        else itemEl.classList.remove('hidden-field');
      }
    });
    
    sortableInstances.push(sortable);
  });
  
  lucide.createIcons();
}

window.toggleAccordion = function(headerElement) {
  // Evitar toggle si se hizo clic en el drag handle o en el switch
  if (event.target.closest('.drag-handle') || event.target.closest('.switch') || event.target.closest('.btn-delete') || event.target.closest('.btn-duplicate')) return;
  
  const accordion = headerElement.closest('.field-accordion');
  accordion.classList.toggle('open');
};

function createFieldAccordion(field) {
  const isHidden = field.section === 'hidden';
  
  const card = document.createElement('div');
  card.className = `field-accordion ${isHidden ? 'hidden-field' : ''}`;
  card.dataset.id = field.id;
  
  let typeSelectHtml = `
    <select class="control-input field-type" onchange="toggleOptionsRow(this)">
      <option value="text" ${field.tipo === 'text' ? 'selected' : ''}>Texto Libre</option>
      <option value="textarea" ${field.tipo === 'textarea' ? 'selected' : ''}>Área de Texto (Múltiples Líneas)</option>
      <option value="number" ${field.tipo === 'number' ? 'selected' : ''}>Número</option>
      <option value="date" ${field.tipo === 'date' ? 'selected' : ''}>Fecha</option>
      <option value="tel" ${field.tipo === 'tel' ? 'selected' : ''}>Teléfono</option>
      <option value="email" ${field.tipo === 'email' ? 'selected' : ''}>Correo Electrónico</option>
      <option value="select" ${field.tipo === 'select' ? 'selected' : ''}>Lista Desplegable (Dropbox)</option>
    </select>
  `;
  
  card.innerHTML = `
    <div class="field-header" onclick="toggleAccordion(this)">
      <div class="field-header-left">
        <div class="drag-handle"><i data-lucide="grip-vertical"></i></div>
        <div class="field-title">${field.label || field.id}</div>
        <div class="field-id">${field.id}</div>
      </div>
      
      <div style="display: flex; align-items: center; gap: 16px;">
        <div class="switch-container">
          <label class="switch">
            <input type="checkbox" class="visibility-switch" ${!isHidden ? 'checked' : ''} onchange="toggleVisibility(this)">
            <span class="slider"></span>
          </label>
        </div>
        <button class="btn-icon btn-duplicate" style="color: var(--color-primary); border:none; background:transparent; padding: 4px;" title="Copiar / Duplicar Campo" onclick="duplicateField(this)">
          <i data-lucide="copy" style="width: 16px; height: 16px;"></i>
        </button>
        <button class="btn-icon btn-delete" style="color: #ef4444; border:none; background:transparent; padding: 4px;" title="Eliminar Campo" onclick="deleteField(this)">
          <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
    </div>
    
    <div class="field-body">
      <div class="field-controls">
        <div class="control-group">
          <label class="control-label">Etiqueta (Read-Only)</label>
          <input type="text" class="control-input field-label" value="${field.label}" readonly>
        </div>
        <div class="control-group">
          <label class="control-label">Tipo de Campo</label>
          ${typeSelectHtml}
        </div>
        <div class="control-group">
          <label class="control-label">Regla de Formato (Al Escribir)</label>
          <select class="control-input field-transform">
            <option value="none" ${!field.transform || field.transform === 'none' ? 'selected' : ''}>Sin formato automático</option>
            <option value="uppercase" ${field.transform === 'uppercase' ? 'selected' : ''}>MAYÚSCULAS</option>
            <option value="lowercase" ${field.transform === 'lowercase' ? 'selected' : ''}>minúsculas</option>
            <option value="titlecase" ${field.transform === 'titlecase' ? 'selected' : ''}>Nombre Propio (Capitalizar palabras)</option>
          </select>
        </div>
        
        <div class="control-group date-options-row" style="display: ${field.tipo === 'date' ? 'flex' : 'none'}; flex-direction: row; align-items: center; gap: 8px; margin-top: 8px;">
          <input type="checkbox" class="field-default-today" id="chk-today-${field.id}" ${field.defaultToday ? 'checked' : ''}>
          <label for="chk-today-${field.id}" style="font-size: 0.9rem; font-weight: 500;">Fecha de hoy por defecto</label>
        </div>
        
        <div class="control-group" style="display: flex; flex-direction: row; align-items: center; gap: 8px; margin-top: 8px;">
          <input type="checkbox" class="field-requerido" id="chk-req-${field.id}" ${field.requerido ? 'checked' : ''}>
          <label for="chk-req-${field.id}" style="font-size: 0.9rem; font-weight: 500; color: var(--color-text-main);">Campo obligatorio (Forzoso a llenar)</label>
        </div>

        <div class="control-group">
          <label class="control-label">Placeholder (Texto fondo)</label>
          <input type="text" class="control-input field-placeholder" value="${field.placeholder || ''}" placeholder="Ej. Escribe a 10 dígitos">
        </div>
        <div class="control-group">
          <label class="control-label">Texto de Ayuda (Globito '?')</label>
          <input type="text" class="control-input field-ayuda" value="${field.ayuda || ''}" placeholder="Instrucción que aparecerá al pasar el mouse por encima">
        </div>
        <div class="control-group">
          <label class="control-label">Mostrar solo si este campo ID:</label>
          <input type="text" class="control-input field-depends-on" value="${field.dependsOn || ''}" placeholder="Ej. demandas">
        </div>
        <div class="control-group">
          <label class="control-label">Es igual al valor:</label>
          <input type="text" class="control-input field-depends-on-value" value="${field.dependsOnValue || ''}" placeholder="Ej. Sí">
        </div>
        
        <div class="control-group" style="grid-column: span 2;">
          <label class="control-label">Autocompletar (copiar) desde (ID del campo):</label>
          <input type="text" class="control-input field-link-from" value="${field.linkFrom || ''}" placeholder="Ej. nombre_padre">
        </div>

        <div class="control-group options-row" style="display: ${field.tipo === 'select' ? 'flex' : 'none'};">
          <label class="control-label">Opciones del Menú Desplegable (Separadas por comas)</label>
          <input type="text" class="control-input field-opciones" value="${field.opciones ? field.opciones.join(', ') : ''}" placeholder="Ej. Competente, No Competente, Con Reservas">
        </div>
      </div>
    </div>
  `;
  
  return card;
}

// Lógica de UI para los acordeones
window.toggleOptionsRow = function(selectElem) {
  const isSelect = selectElem.value === 'select';
  const isDate = selectElem.value === 'date';
  
  const controls = selectElem.closest('.field-controls');
  const optionsRow = controls.querySelector('.options-row');
  const dateRow = controls.querySelector('.date-options-row');
  
  if (optionsRow) optionsRow.style.display = isSelect ? 'flex' : 'none';
  if (dateRow) dateRow.style.display = isDate ? 'flex' : 'none';
};

window.toggleVisibility = function(checkboxElem) {
  const accordion = checkboxElem.closest('.field-accordion');
  if (checkboxElem.checked) {
    accordion.classList.remove('hidden-field');
    // Mover visualmente a la primera sección activa disponible
    const firstActiveSec = customSections.length > 0 ? customSections[0].id : 'sec-personales';
    const targetList = document.getElementById(`list-${firstActiveSec}`);
    if (targetList) {
      targetList.appendChild(accordion);
    } else {
      document.getElementById('list-hidden').appendChild(accordion);
    }
  } else {
    accordion.classList.add('hidden-field');
    // Mover a la sección oculta
    document.getElementById('list-hidden').appendChild(accordion);
  }
};

window.deleteField = function(btnElem) {
  if (confirm('¿Estás seguro de que quieres eliminar este campo de la plantilla?')) {
    const accordion = btnElem.closest('.field-accordion');
    accordion.remove();
  }
};

window.duplicateField = function(btnElem) {
  const card = btnElem.closest('.field-accordion');
  const oldId = card.dataset.id;
  
  // Solicitar nuevo ID
  const newId = prompt('Ingresa el ID del nuevo campo duplicado:', oldId + '_copia');
  if (!newId || newId.trim() === '') return;
  
  const cleanId = newId.trim().replace(/\s+/g, '_').toLowerCase();
  
  // Verificar que el ID no exista ya
  const exists = document.querySelector(`.field-accordion[data-id="${cleanId}"]`);
  if (exists) {
    alert('Ya existe un campo con este ID en la plantilla.');
    return;
  }
  
  // Obtener todos los valores actuales del campo origen desde el DOM!
  const tipo = card.querySelector('.field-type').value;
  const label = card.querySelector('.field-label').value;
  const placeholder = card.querySelector('.field-placeholder').value;
  const opcionesStr = card.querySelector('.field-opciones').value;
  const ayuda = card.querySelector('.field-ayuda').value;
  
  const chkToday = card.querySelector('.field-default-today');
  const defaultToday = chkToday ? chkToday.checked : false;

  const chkReq = card.querySelector('.field-requerido');
  const requerido = chkReq ? chkReq.checked : false;
  
  const transformSelect = card.querySelector('.field-transform');
  const transform = transformSelect ? transformSelect.value : 'none';
  
  const dependsOn = card.querySelector('.field-depends-on').value.trim();
  const dependsOnValue = card.querySelector('.field-depends-on-value').value.trim();
  const linkFrom = card.querySelector('.field-link-from').value.trim();
  
  const newField = {
    id: cleanId,
    label: label + ' (Copia)',
    tipo: tipo,
    section: card.closest('.section-group').dataset.section,
    placeholder: placeholder,
    ayuda: ayuda,
    defaultToday: defaultToday,
    requerido: requerido,
    transform: transform,
    dependsOn: dependsOn,
    dependsOnValue: dependsOnValue,
    linkFrom: linkFrom
  };
  
  if (tipo === 'select' && opcionesStr.trim() !== '') {
    newField.opciones = opcionesStr.split(',').map(s => s.trim()).filter(s => s !== '');
  }
  
  // Crear el nuevo elemento visual
  const newCard = createFieldAccordion(newField);
  
  // Insertarlo inmediatamente debajo del original en el DOM
  card.parentNode.insertBefore(newCard, card.nextSibling);
  
  lucide.createIcons();
  
  // Mostrar mensaje sutil de éxito
  const toast = document.getElementById('toast');
  if (toast) {
    const origText = toast.innerHTML;
    toast.innerHTML = '<i data-lucide="check-circle"></i> Campo duplicado con éxito. Recuerda guardar cambios.';
    toast.classList.add('show');
    lucide.createIcons();
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { toast.innerHTML = origText; lucide.createIcons(); }, 300);
    }, 3000);
  }
};

// Agregar nuevo campo manual
document.getElementById('btn-add-field').addEventListener('click', () => {
  const newId = prompt('Escribe el ID (sin espacios) del nuevo campo:');
  if (!newId || newId.trim() === '') return;
  
  const id = newId.trim().toLowerCase().replace(/\s+/g, '_');
  
  const baseLabel = id.replace(/_/g, ' ');
  const capitalizedLabel = baseLabel.charAt(0).toUpperCase() + baseLabel.slice(1);
  
  const newField = {
    id: id,
    label: capitalizedLabel,
    tipo: 'text',
    section: 'sec-personales'
  };
  
  const card = createFieldAccordion(newField);
  card.classList.add('open');
  document.getElementById('list-sec-personales').insertBefore(card, document.getElementById('list-sec-personales').firstChild);
  lucide.createIcons();
  
  // Scroll hacia el nuevo elemento
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
});


document.getElementById('btn-save').addEventListener('click', async () => {
  if (!currentTemplate) return;
  
  const newSchema = [];
  
  // Extraer información iterando sobre cada section-group para respetar el orden visual del DOM!
  const sectionGroups = document.querySelectorAll('.section-group');
  
  sectionGroups.forEach(group => {
    const sectionVal = group.dataset.section;
    const cards = group.querySelectorAll('.field-accordion');
    
    cards.forEach(card => {
      const id = card.dataset.id;
      
      const tipo = card.querySelector('.field-type').value;
      const label = card.querySelector('.field-label').value;
      const placeholder = card.querySelector('.field-placeholder').value;
      const opcionesStr = card.querySelector('.field-opciones').value;
      const ayuda = card.querySelector('.field-ayuda').value;
      
      const chkToday = card.querySelector('.field-default-today');
      const defaultToday = chkToday ? chkToday.checked : false;

      const chkReq = card.querySelector('.field-requerido');
      const requerido = chkReq ? chkReq.checked : false;
      
      const transformSelect = card.querySelector('.field-transform');
      const transform = transformSelect ? transformSelect.value : 'none';
      
      const dependsOn = card.querySelector('.field-depends-on').value.trim();
      const dependsOnValue = card.querySelector('.field-depends-on-value').value.trim();
      const linkFrom = card.querySelector('.field-link-from').value.trim();
      
      const updatedField = {
        id: id,
        label: label,
        tipo: tipo,
        section: sectionVal,
        placeholder: placeholder,
        ayuda: ayuda,
        defaultToday: defaultToday,
        requerido: requerido,
        transform: transform,
        dependsOn: dependsOn,
        dependsOnValue: dependsOnValue,
        linkFrom: linkFrom
      };
      
      if (tipo === 'select' && opcionesStr.trim() !== '') {
        updatedField.opciones = opcionesStr.split(',').map(s => s.trim()).filter(s => s !== '');
      }
      
      newSchema.push(updatedField);
    });
  });
  
  // Inyectar el bloque especial de configuración de secciones
  newSchema.unshift({
    id: '__sections_config__',
    sections: customSections
  });
  
  // Guardar en Supabase
  const btn = document.getElementById('btn-save');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="loading-spinner"></i> Guardando...`;
  
  const { error } = await supabaseClient
    .from('socioeconomic_templates')
    .update({ form_schema: newSchema })
    .eq('id', currentTemplate.id);
    
  if (error) {
    alert('Error al guardar: ' + error.message);
    btn.innerHTML = originalText;
    return;
  }
  
  // Actualizar template local original
  const templateIdx = templates.findIndex(t => t.id === currentTemplate.id);
  templates[templateIdx].form_schema = newSchema;
  
  // Para currentTemplate en memoria, mantenemos el esquema libre de __sections_config__
  currentTemplate.form_schema = JSON.parse(JSON.stringify(newSchema)).filter(f => f.id !== '__sections_config__');
  
  btn.innerHTML = originalText;
  lucide.createIcons();
  
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
});

// ==========================================================================
// SECCIÓN DE BASE DE DATOS Y EXPORTACIÓN A EXCEL/SHEETS
// ==========================================================================

let dbCaptures = [];

// Cambiar a vista del Editor de Formatos
document.getElementById('btn-show-editor').addEventListener('click', () => {
  document.getElementById('btn-show-editor').classList.add('active');
  document.getElementById('btn-show-database').classList.remove('active');
  
  // Mostrar selector de plantillas en la barra lateral izquierda
  document.getElementById('sidebar-templates-selector').style.display = 'block';
  
  // Ocultar panel de base de datos
  document.getElementById('database-sheet-view').style.display = 'none';
  
  // Mostrar editor o empty state según corresponda
  if (currentTemplate) {
    document.getElementById('editor-main').style.display = 'block';
    document.getElementById('empty-state').style.display = 'none';
  } else {
    document.getElementById('editor-main').style.display = 'none';
    document.getElementById('empty-state').style.display = 'flex';
  }
});

// Cambiar a vista de Base de Datos (Sheets)
document.getElementById('btn-show-database').addEventListener('click', () => {
  document.getElementById('btn-show-database').classList.add('active');
  document.getElementById('btn-show-editor').classList.remove('active');
  
  // Ocultar selector de plantillas de la barra lateral
  document.getElementById('sidebar-templates-selector').style.display = 'none';
  
  // Ocultar editor y empty state
  document.getElementById('editor-main').style.display = 'none';
  document.getElementById('empty-state').style.display = 'none';
  
  // Mostrar vista de base de datos en la misma ventana
  document.getElementById('database-sheet-view').style.display = 'flex';
  
  loadDatabaseCaptures();
});

// Cargar registros de capturas desde Supabase
async function loadDatabaseCaptures() {
  const tbody = document.getElementById('db-sheet-tbody');
  const countLabel = document.getElementById('db-studies-count');
  
  try {
    const { data, error } = await supabaseClient
      .from('socioeconomic_captures')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error al cargar capturas:", error);
      tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: #ef4444;">Error al cargar registros de la base de datos: ${error.message}</td></tr>`;
      countLabel.innerText = "Error de conexión";
      return;
    }
    
    dbCaptures = data || [];
    countLabel.innerText = `${dbCaptures.length} estudios socioeconómicos capturados en total`;
    
    renderCapturesTable(dbCaptures);
  } catch (err) {
    console.error("Excepción en loadDatabaseCaptures:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: #ef4444;">Excepción: ${err.message}</td></tr>`;
  }
}

// Renderizar filas de capturas en la tabla estilo spreadsheet
function renderCapturesTable(records) {
  const tbody = document.getElementById('db-sheet-tbody');
  
  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--color-text-muted);">No se encontraron registros de captura.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = records.map(record => {
    const dateStr = record.created_at ? new Date(record.created_at).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Sin fecha';
    
    const candidateName = record.payload ? record.payload.candidate_name : 'N/A';
    const brand = record.brand_assigned || 'N/A';
    const answers = record.payload ? record.payload.answers : null;
    const dataKeysCount = answers ? Object.keys(answers).length : 0;
    
    const docUrl = record.payload && record.payload.docUrl ? record.payload.docUrl : null;
    
    let docBtn = '';
    if (docUrl) {
      docBtn = `
        <a href="${docUrl}" target="_blank" class="btn" style="padding: 5px 10px; font-size: 0.72rem; background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.25); color: #10b981; display: inline-flex; align-items: center; gap: 4px; text-decoration: none; font-weight: 500;" title="Abrir y descargar el documento final con llaves sustituidas">
          <i data-lucide="file-text" style="width: 12px; height: 12px;"></i> Doc Final
        </a>
      `;
    } else {
      docBtn = `
        <button id="btn-link-doc-${record.id}" class="btn" style="padding: 5px 10px; font-size: 0.72rem; background: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.15); color: var(--color-primary); display: inline-flex; align-items: center; gap: 4px; font-weight: 500; cursor: pointer;" onclick="linkDocForRecord('${record.id}')" title="Buscar y vincular el documento en Google Drive">
          <i data-lucide="link-2" style="width: 12px; height: 12px;"></i> Vincular Doc
        </button>
      `;
    }
    
    return `
      <tr>
        <td style="font-weight: 500;">${dateStr}</td>
        <td style="font-weight: 600; color: var(--color-primary);">${escapeHTML(candidateName)}</td>
        <td><span class="company-badge" style="background: rgba(37, 99, 235, 0.08); color: var(--color-primary); border: 1px solid rgba(37, 99, 235, 0.15);">${escapeHTML(record.client_name || 'N/A')}</span></td>
        <td><span class="commercial-badge" style="background: rgba(16, 185, 129, 0.08); color: var(--color-accent); border: 1px solid rgba(16, 185, 129, 0.15);">${escapeHTML(brand)}</span></td>
        <td style="font-family: monospace; font-size: 0.85rem; color: var(--color-text-muted);">${dataKeysCount} respuestas</td>
        <td style="overflow: visible; max-width: none; text-overflow: clip;">
          <div style="display: flex; gap: 6px; align-items: center; justify-content: center;">
            <button class="btn" style="padding: 5px 10px; font-size: 0.72rem; background: rgba(37, 99, 235, 0.1); border-color: rgba(37, 99, 235, 0.2); color: var(--color-primary); display: inline-flex; align-items: center; gap: 4px; cursor: pointer; font-weight: 500;" onclick="exportSingleCaptureToCSV('${record.id}')" title="Descargar respuestas en CSV">
              <i data-lucide="download" style="width: 12px; height: 12px;"></i> CSV Info
            </button>
            ${docBtn}
            <button class="btn" style="padding: 5px 10px; font-size: 0.72rem; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.18); color: #ef4444; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; font-weight: 500;" onclick="deleteCaptureRecord('${record.id}')" title="Eliminar este estudio de la base de datos">
              <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i> Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  lucide.createIcons();
}

// Búsqueda en la tabla estilo sheet
document.getElementById('search-db-captures').addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();
  
  if (query === '') {
    renderCapturesTable(dbCaptures);
    return;
  }
  
  const filtered = dbCaptures.filter(r => {
    const candidate = r.payload ? (r.payload.candidate_name || '').toLowerCase() : '';
    const brand = (r.brand_assigned || '').toLowerCase();
    const client = (r.client_name || '').toLowerCase();
    return candidate.includes(query) || client.includes(query) || brand.includes(query);
  });
  
  renderCapturesTable(filtered);
});

// Helper de escape simple para CSV
function escapeCSVValue(val) {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Exportar TODOS los registros a un archivo CSV plano tipo spreadsheet compatible con Excel y Google Sheets
document.getElementById('btn-export-all-excel').addEventListener('click', () => {
  if (dbCaptures.length === 0) {
    alert("No hay registros disponibles para exportar.");
    return;
  }
  
  const uniqueKeysSet = new Set();
  dbCaptures.forEach(record => {
    const answers = record.payload ? record.payload.answers : null;
    if (answers) {
      Object.keys(answers).forEach(key => {
        uniqueKeysSet.add(key);
      });
    }
  });
  
  const questionKeys = Array.from(uniqueKeysSet).sort();
  
  const headers = ['Fecha de Captura', 'Nombre del Candidato', 'Cliente (Empresa)', 'Marca Comercial', 'ID Registro'];
  const formatHeader = (str) => str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  questionKeys.forEach(key => {
    headers.push(formatHeader(key));
  });
  
  const csvRows = [headers.map(escapeCSVValue).join(',')];
  
  dbCaptures.forEach(record => {
    const dateStr = record.created_at ? new Date(record.created_at).toISOString() : '';
    const candidateName = record.payload ? record.payload.candidate_name : '';
    const brand = record.brand_assigned || '';
    const answers = record.payload ? record.payload.answers : null;
    
    const row = [
      dateStr,
      candidateName,
      record.client_name || '',
      brand,
      record.id
    ];
    
    questionKeys.forEach(key => {
      const val = answers ? answers[key] : '';
      row.push(val || '');
    });
    
    csvRows.push(row.map(escapeCSVValue).join(','));
  });
  
  triggerCSVDownload(csvRows, `Base_Datos_Estudios_${new Date().toISOString().split('T')[0]}.csv`);
});

// Exportar un único estudio individual en formato plano a Excel/CSV
window.exportSingleCaptureToCSV = function(id) {
  const record = dbCaptures.find(r => r.id === id);
  if (!record) return;
  
  const headers = ['Campo / Pregunta', 'Respuesta Capturada'];
  const csvRows = [headers.map(escapeCSVValue).join(',')];
  
  const candidateName = record.payload ? record.payload.candidate_name : 'N/A';
  const brand = record.brand_assigned || 'N/A';
  const answers = record.payload ? record.payload.answers : null;
  
  csvRows.push([escapeCSVValue('Fecha de Captura'), escapeCSVValue(record.created_at)]);
  csvRows.push([escapeCSVValue('Nombre del Candidato'), escapeCSVValue(candidateName)]);
  csvRows.push([escapeCSVValue('Cliente (Empresa)'), escapeCSVValue(record.client_name)]);
  csvRows.push([escapeCSVValue('Marca Comercial'), escapeCSVValue(brand)]);
  
  csvRows.push([escapeCSVValue('---'), escapeCSVValue('---')]);
  
  if (answers) {
    const formatHeader = (str) => str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    Object.keys(answers).sort().forEach(key => {
      csvRows.push([
        escapeCSVValue(formatHeader(key)),
        escapeCSVValue(answers[key])
      ]);
    });
  }
  
  const safeCandidateName = (candidateName || 'Estudio').replace(/[^a-zA-Z0-9]/g, '_');
  triggerCSVDownload(csvRows, `Estudio_${safeCandidateName}.csv`);
};

// Utilidad para descargar el Blob del CSV
function triggerCSVDownload(csvRows, filename) {
  const csvContent = "\uFEFF" + csvRows.join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper escapeHTML local
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Vincular/Generar en vivo el Google Doc para un registro que carece de él
window.linkDocForRecord = async function(id) {
  const btn = document.getElementById(`btn-link-doc-${id}`);
  const record = dbCaptures.find(r => r.id === id);
  if (!record) return;
  
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="loading-spinner" style="width: 12px; height: 12px; display: inline-block; animation: spin 1s linear infinite;"></i> Vinculando...`;
    lucide.createIcons();
  }
  
  const candidateName = record.payload ? record.payload.candidate_name : 'Candidato';
  const clientName = record.client_name;
  const answers = record.payload ? record.payload.answers : {};
  
  console.log(`Iniciando vinculación de documento para ${candidateName} (${clientName})...`);
  
  try {
    // 1. Obtener la URL del webhook desde los mapeos de Supabase
    const { data: mappings, error: mappingError } = await supabaseClient
      .from('client_mappings')
      .select('*')
      .ilike('client_name', clientName)
      .limit(1);
      
    if (mappingError || !mappings || mappings.length === 0) {
      alert(`No se encontró una configuración de Apps Script asociada al cliente "${clientName}". Por favor, agrega o revisa el mapeo de este cliente en el Panel.`);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="link-2" style="width: 12px; height: 12px;"></i> Vincular Doc`;
        lucide.createIcons();
      }
      return;
    }
    
    const mappingConfig = mappings[0].config || {};
    if (!mappingConfig.appsScriptUrl) {
      alert(`El cliente "${clientName}" está configurado, pero no cuenta con un URL de Google Apps Script. Por favor configúralo en el área de mapeos.`);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="link-2" style="width: 12px; height: 12px;"></i> Vincular Doc`;
        lucide.createIcons();
      }
      return;
    }
    
    // 2. Disparar el webhook de rellenado
    console.log("Enviando webhook de vinculación a Google Apps Script...", mappingConfig.appsScriptUrl);
    const response = await fetch(mappingConfig.appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'fillDoc',
        clientName: clientName,
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
      const docUrl = resData.docUrl;
      const docName = resData.docName;
      
      // 3. Actualizar Supabase con el enlace del documento
      const updatedPayload = {
        ...record.payload,
        docUrl: docUrl,
        docName: docName
      };
      
      const { error: updateError } = await supabaseClient
        .from('socioeconomic_captures')
        .update({ payload: updatedPayload })
        .eq('id', id);
        
      if (updateError) {
        console.error("Error al guardar enlace en Supabase:", updateError);
        alert(`¡Documento vinculado en Drive, pero no se pudo actualizar Supabase!\n\nDocs URL: ${docUrl}`);
      } else {
        showToast(`Documento "${docName}" vinculado con éxito.`);
      }
      
      // 4. Recargar los datos para refrescar la fila con el botón verde
      await loadDatabaseCaptures();
    } else {
      const errorMsg = resData ? resData.error : 'Respuesta inválida del servidor.';
      alert(`⚠️ Problema al rellenar/vincular el documento en Google Drive:\n\n${errorMsg}\n\nPor favor, verifica las carpetas y la plantilla del cliente en Drive.`);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="link-2" style="width: 12px; height: 12px;"></i> Vincular Doc`;
        lucide.createIcons();
      }
    }
  } catch (err) {
    console.error("Excepción en linkDocForRecord:", err);
    alert(`Error de conexión al intentar vincular con Google Apps Script: ${err.message}`);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="link-2" style="width: 12px; height: 12px;"></i> Vincular Doc`;
      lucide.createIcons();
    }
  }
};

// Eliminar permanentemente un estudio socioeconómico de la base de datos
window.deleteCaptureRecord = async function(id) {
  const record = dbCaptures.find(r => r.id === id);
  if (!record) return;
  
  const candidateName = record.payload ? record.payload.candidate_name : 'este candidato';
  const confirmDelete = confirm(`¿Está seguro de que desea eliminar permanentemente el estudio socioeconómico de "${candidateName}"?\n\nEsta acción eliminará el registro de la base de datos de forma irreversible.`);
  
  if (!confirmDelete) return;
  
  try {
    const { error } = await supabaseClient
      .from('socioeconomic_captures')
      .delete()
      .eq('id', id);
      
    if (error) {
      alert(`Error al eliminar el registro: ${error.message}`);
      return;
    }
    
    // Mostrar mensaje toast dinámico
    showToast(`Estudio de "${candidateName}" eliminado con éxito.`);
    
    // Recargar los registros en la tabla
    await loadDatabaseCaptures();
  } catch (err) {
    console.error("Excepción al eliminar registro:", err);
    alert(`Ocurrió una excepción al eliminar: ${err.message}`);
  }
};

// Función reutilizable para mostrar notificaciones toast dinámicas
function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toast');
  if (toast) {
    const origContent = toast.innerHTML;
    const icon = isSuccess ? 'check-circle' : 'alert-circle';
    toast.innerHTML = `<i data-lucide="${icon}"></i> ${message}`;
    lucide.createIcons();
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { toast.innerHTML = origContent; lucide.createIcons(); }, 300);
    }, 3000);
  }
}

// Init
lucide.createIcons();
loadTemplates();

// Comprobar si se solicitó abrir directamente la base de datos desde el menú del dashboard
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('view') === 'database') {
  setTimeout(() => {
    const dbBtn = document.getElementById('btn-show-database');
    if (dbBtn) dbBtn.click();
  }, 200);
}
