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

const SECTION_OPTIONS = [
  { val: 'sec-estudio', label: '1. Estudio Socioeconómico' },
  { val: 'sec-personales', label: '2. Datos Personales' },
  { val: 'sec-escolaridad', label: '3. Escolaridad e Inmuebles' },
  { val: 'sec-economia', label: '4. Familiar y Economía' },
  { val: 'sec-entorno', label: '5. Entorno y Salud' },
  { val: 'sec-referencias', label: '6. Referencias Personales' },
  { val: 'sec-laboral', label: '7. Historial Laboral' },
  { val: 'sec-evidencias', label: '8. Documentos y Evidencias' },
  { val: 'hidden', label: '❌ Ocultos / No Mostrar' }
];

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
  document.getElementById('current-template-count').innerText = `${currentTemplate.form_schema.length} campos detectados`;
  
  // Asegurar que tengan sección asignada
  currentTemplate.form_schema.forEach(field => {
    if (!field.section) field.section = getSuggestedSection(field.id);
  });
  
  renderFieldsGrouped();
}

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
  if (event.target.closest('.drag-handle') || event.target.closest('.switch') || event.target.closest('.btn-delete')) return;
  
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
        <button class="btn-icon btn-delete" style="color: #ef4444; border:none; background:transparent;" onclick="deleteField(this)">
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
        
        <div class="control-group date-options-row" style="display: ${field.tipo === 'date' ? 'flex' : 'none'}; flex-direction: row; align-items: center; gap: 8px; margin-top: 8px;">
          <input type="checkbox" class="field-default-today" id="chk-today-${field.id}" ${field.defaultToday ? 'checked' : ''}>
          <label for="chk-today-${field.id}" style="font-size: 0.9rem; font-weight: 500;">Fecha de hoy por defecto</label>
        </div>

        <div class="control-group">
          <label class="control-label">Placeholder (Texto fondo)</label>
          <input type="text" class="control-input field-placeholder" value="${field.placeholder || ''}" placeholder="Ej. Escribe a 10 dígitos">
        </div>
        <div class="control-group">
          <label class="control-label">Texto de Ayuda (Globito '?')</label>
          <input type="text" class="control-input field-ayuda" value="${field.ayuda || ''}" placeholder="Instrucción que aparecerá al pasar el mouse por encima">
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
    // Mover visualmente a Datos Personales (como fallback general)
    document.getElementById('list-sec-personales').appendChild(accordion);
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

// Agregar nuevo campo manual
document.getElementById('btn-add-field').addEventListener('click', () => {
  const newId = prompt('Escribe el ID (sin espacios) del nuevo campo:');
  if (!newId || newId.trim() === '') return;
  
  const id = newId.trim().toLowerCase().replace(/\s+/g, '_');
  
  const newField = {
    id: id,
    label: id.replace(/_/g, ' '),
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
      
      const updatedField = {
        id: id,
        label: label,
        tipo: tipo,
        section: sectionVal,
        placeholder: placeholder,
        ayuda: ayuda,
        defaultToday: defaultToday
      };
      
      if (tipo === 'select' && opcionesStr.trim() !== '') {
        updatedField.opciones = opcionesStr.split(',').map(s => s.trim()).filter(s => s !== '');
      }
      
      newSchema.push(updatedField);
    });
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
  currentTemplate.form_schema = JSON.parse(JSON.stringify(newSchema));
  
  btn.innerHTML = originalText;
  lucide.createIcons();
  
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
});

// Init
lucide.createIcons();
loadTemplates();
