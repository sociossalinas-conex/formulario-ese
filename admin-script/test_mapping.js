import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function classifyFieldSection(id) {
  id = id.toLowerCase();
  
  if (id.match(/fecha.*solicitud/) || id.match(/fecha.*visita/) || id.match(/elaborado_por/) || id.match(/^puesto$/) || id.match(/demandas/) || id.match(/resultado/) || id.match(/solicitado_por/)) return 'sec-estudio';
  
  if (id.includes('empresa') || id.includes('giro') || id.match(/puesto.*inicial/) || id.match(/puesto.*final/) || id.includes('contrato') || id.match(/fecha.*ingreso/) || id.match(/fecha.*salida/) || id.includes('sueldo') || id.match(/motivo.*salida/) || id.match(/jefe/) || id.includes('puntualidad') || id.includes('asistencia') || id.match(/relacion.*compañero/) || id.match(/relacion.*superior/) || id.includes('responsabilidad') || id.includes('honestidad') || id.includes('equipo') || id.includes('disciplina') || id.includes('confiabilidad') || id.includes('iniciativa') || id.includes('calidad.*trabajo') || id.includes('observaciones_laboral') || id.includes('falta') || id.includes('incapacidad') || id.includes('recomendable') || id.includes('omitido') || id.includes('proporciono_informacion')) return 'sec-laboral';
  
  if (id.match(/documento.*acta/) || id.match(/^acta.*nacimiento$/) || id.includes('rfc') || id.includes('curp') || id.includes('imss') || id.includes('nss') || id.includes('ine') || id.includes('folio') || id.includes('tipo_documento') || id.includes('emergencia') || id.includes('foto') || id.includes('mapa') || id.includes('ubicacion') || id.includes('comprobante_domicilio') || id.includes('recomendacion') || id.includes('nomina') || id.includes('infonavit') || id.includes('cartilla') || id.includes('pasaporte')) return 'sec-evidencias';

  if (id.match(/tiempo.*conocerlo/) || id.match(/como.*describiria/)) return 'sec-referencias';

  if (id.includes('grado') || id.includes('escolar') || id.includes('escuela') || id.includes('documento_obtenido') || id.includes('inmueble') || id.includes('automovil') || id.includes('moto') || id.includes('casa') || id.includes('terreno') || id.match(/valor.*aproximado/) || id.includes('dueño') || id.includes('comprobatorio') || id.includes('habit') || id.includes('limpieza') || id.includes('construccion') || id.includes('baño') || id.includes('cocina') || id.includes('sala') || id.includes('comedor') || id.includes('cuarto') || id.includes('recamara') || id.includes('nivel') || id.includes('estacionamiento') || id.includes('urbana') || id.includes('mueble') || id.match(/años.*escuela/)) return 'sec-escolaridad';

  if (id.includes('parentesco') || id.includes('ocupacion') || id.match(/telefono.*empleo/) || id.includes('aportador') || id.includes('ingreso') || id.includes('egreso') || id.includes('predial') || id.includes('hipoteca') || id.includes('renta') || id.includes('servicios') || id.includes('luz') || id.includes('agua') || id.includes('gas') || id.includes('cable') || id.includes('internet') || id.includes('pavimentacion') || id.includes('vigilancia') || id.includes('alumbrado') || id.includes('alimentacion') || id.includes('transporte') || id.includes('educacion') || id.includes('colegiatura') || id.includes('vestido') || id.includes('diversion') || id.includes('gastos_medicos') || id.includes('entretenimiento') || id.match(/plan.*celular/) || id.includes('mascotas_gasto') || id.includes('mantenimiento') || id.includes('deuda') || id.includes('observaciones_familia')) return 'sec-economia';

  if (id.includes('originario') || id.includes('densidad') || id.includes('migratorio') || id.includes('farmaco') || id.includes('vandalismo') || id.includes('club') || id.includes('asociacion') || id.includes('deportivo') || id.includes('religion') || id.includes('pasatiempo') || id.match(/mascotas.*cantidad/) || id.includes('tatuaje') || id.includes('alergia') || id.includes('fuma') || id.includes('toma') || id.includes('peso') || id.includes('altura') || id.includes('deporte') || id.includes('enfermedad') || id.includes('patologico') || id.includes('dental') || id.includes('aspecto') || id.match(/familiar.*empresa/) || id.match(/laborado.*empresa/) || id.includes('enteró_vacante') || id.includes('autodescripcion') || id.includes('meta') || id.match(/mas.*importante/)) return 'sec-entorno';

  return 'sec-personales';
}

async function main() {
  const { data, error } = await supabase
    .from('socioeconomic_templates')
    .select('*');

  if (error) {
    console.error('Error fetching templates:', error);
    return;
  }

  const gersa = data.find(t => t.name && t.name.toLowerCase().includes('gersa'));
  if (!gersa) {
    console.log('Template Gersa not found.');
    return;
  }

  console.log('Template Name:', gersa.name);
  console.log('--- Fields and their mapping ---');
  
  const bySection = {};
  
  for (const field of gersa.form_schema) {
    const sec = classifyFieldSection(field.id);
    if (!bySection[sec]) bySection[sec] = [];
    bySection[sec].push(`${field.id} ("${field.label}")`);
  }
  
  for (const [sec, fields] of Object.entries(bySection)) {
    console.log(`\n[${sec.toUpperCase()}]`);
    for (const f of fields) {
      console.log(`  - ${f}`);
    }
  }
}

main();
