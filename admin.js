const SUPABASE_URL = "https://mcdjysjrezxmghmvannh.supabase.co";
const SUPABASE_KEY = "sb_publishable_2zg1_mv94Gvpl8b3lZOvMQ_xRlrgrQS";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let templates = [];
let currentTemplate = null;

// Lógica de Clasificación copiada para pre-llenar los vacíos
function getSuggestedSection(fieldId) {
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
  { val: 'hidden', label: '❌ Ocultar del Formulario' }
];

async function loadTemplates() {
  const { data, error } = await supabase.from('socioeconomic_templates').select('*').order('name');
  if (error) {
    console.error(error);
    alert('Error al cargar plantillas');
    return;
  }
  
  templates = data;
  const listEl = document.getElementById('template-list');
  listEl.innerHTML = '';
  
  templates.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'template-btn';
    btn.innerHTML = `<i data-lucide="file-text" style="width: 16px; height: 16px;"></i> ${t.name}`;
    btn.onclick = () => selectTemplate(t.id);
    listEl.appendChild(btn);
  });
  lucide.createIcons();
}

function selectTemplate(id) {
  currentTemplate = templates.find(t => t.id === id);
  
  document.querySelectorAll('.template-btn').forEach(btn => btn.classList.remove('active'));
  event.currentTarget.classList.add('active');
  
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('editor-main').style.display = 'block';
  
  document.getElementById('current-template-name').innerText = currentTemplate.name;
  document.getElementById('current-template-count').innerText = `${currentTemplate.form_schema.length} variables detectadas`;
  
  renderFields();
}

function renderFields() {
  const container = document.getElementById('fields-container');
  container.innerHTML = '';
  
  currentTemplate.form_schema.forEach((field, index) => {
    // Definir sección sugerida si no tiene
    const currentSec = field.section || getSuggestedSection(field.id);
    
    const card = document.createElement('div');
    card.className = `field-card ${currentSec === 'hidden' ? 'hidden-field' : ''}`;
    card.dataset.index = index;
    card.dataset.id = field.id;
    
    // Select HTML for Sections
    let secSelectHtml = `<select class="control-input field-section">`;
    SECTION_OPTIONS.forEach(opt => {
      secSelectHtml += `<option value="${opt.val}" ${currentSec === opt.val ? 'selected' : ''}>${opt.label}</option>`;
    });
    secSelectHtml += `</select>`;
    
    // Select HTML for Type
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
    
    // HTML Completo
    card.innerHTML = `
      <div class="field-header">
        <div style="font-weight: 600; color: var(--color-primary);">${field.label}</div>
        <div class="field-id">${field.id}</div>
      </div>
      <div class="field-controls">
        <div class="control-group">
          <label class="control-label">Ubicación (Pestaña)</label>
          ${secSelectHtml}
        </div>
        <div class="control-group">
          <label class="control-label">Tipo de Campo</label>
          ${typeSelectHtml}
        </div>
        <div class="control-group">
          <label class="control-label">Etiqueta Personalizada</label>
          <input type="text" class="control-input field-label" value="${field.label}">
        </div>
        <div class="control-group">
          <label class="control-label">Placeholder (Texto fondo)</label>
          <input type="text" class="control-input field-placeholder" value="${field.placeholder || ''}" placeholder="Ej. Escribe a 10 dígitos">
        </div>
        <div class="control-group options-row" style="display: ${field.tipo === 'select' ? 'flex' : 'none'};">
          <label class="control-label">Opciones del Menú Desplegable (Separadas por comas)</label>
          <input type="text" class="control-input field-opciones" value="${field.opciones ? field.opciones.join(', ') : ''}" placeholder="Ej. Competente, No Competente, Con Reservas">
        </div>
        <div class="control-group options-row">
          <label class="control-label">Texto de Ayuda (Globito '?')</label>
          <input type="text" class="control-input field-ayuda" value="${field.ayuda || ''}" placeholder="Instrucción que aparecerá al pasar el mouse por encima">
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Para mostrar u ocultar la fila de opciones cuando se cambia a 'select'
window.toggleOptionsRow = function(selectElem) {
  const isSelect = selectElem.value === 'select';
  const row = selectElem.closest('.field-controls').querySelector('.options-row');
  row.style.display = isSelect ? 'flex' : 'none';
};

document.getElementById('btn-save').addEventListener('click', async () => {
  if (!currentTemplate) return;
  
  const cards = document.querySelectorAll('.field-card');
  const newSchema = [];
  
  cards.forEach(card => {
    const id = card.dataset.id;
    const originalField = currentTemplate.form_schema.find(f => f.id === id);
    
    const section = card.querySelector('.field-section').value;
    const tipo = card.querySelector('.field-type').value;
    const label = card.querySelector('.field-label').value;
    const placeholder = card.querySelector('.field-placeholder').value;
    const opcionesStr = card.querySelector('.field-opciones').value;
    const ayuda = card.querySelector('.field-ayuda').value;
    
    const updatedField = {
      ...originalField,
      label: label,
      tipo: tipo,
      section: section,
      placeholder: placeholder,
      ayuda: ayuda
    };
    
    if (tipo === 'select' && opcionesStr.trim() !== '') {
      updatedField.opciones = opcionesStr.split(',').map(s => s.trim()).filter(s => s !== '');
    } else {
      delete updatedField.opciones;
    }
    
    newSchema.push(updatedField);
  });
  
  // Guardar en Supabase
  const btn = document.getElementById('btn-save');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="loading-spinner"></i> Guardando...`;
  
  const { error } = await supabase
    .from('socioeconomic_templates')
    .update({ form_schema: newSchema })
    .eq('id', currentTemplate.id);
    
  if (error) {
    alert('Error al guardar: ' + error.message);
    btn.innerHTML = originalText;
    return;
  }
  
  // Actualizar template local
  currentTemplate.form_schema = newSchema;
  
  btn.innerHTML = originalText;
  lucide.createIcons();
  
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
});

// Init
lucide.createIcons();
loadTemplates();
