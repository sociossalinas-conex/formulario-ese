/**
 * @fileoverview Configuración global del sistema de Estudio Socioeconómico.
 * Contiene todas las constantes, catálogos y datos iniciales del banco de preguntas.
 * @author Antigravity / Conexión Ejecutiva
 */

/**
 * Configuración principal del sistema.
 * @const {Object}
 */
var CONFIG = {
  SHEETS: {
    BANCO: 'Banco Preguntas',
    ESTUDIOS: 'ESTUDIO SOCIOECONÓMICO',
    CLIENTES: 'Clientes'
  },
  DRIVE_FOLDER_ID: '1M6naHKDM1HLCQvEbyq4tysiskXHD7uIW',
  TEMPLATES: {
    'default': '1UI6y2B7kOAR2EgWbrrTXuSLUtawzYPQPO70BdmzZF3c'
  },
  REDIRECT_URL: 'https://www.conexion-ejecutiva.com'
};

/**
 * Los 32 estados de México para los dropdowns de CURP y lugar de nacimiento.
 * @const {string[]}
 */
var ESTADOS_MEXICO = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas'
];

/**
 * Códigos de 2 letras para cada estado, usados en el cálculo de CURP.
 * @const {Object.<string, string>}
 */
var CURP_ESTADO_CODES = {
  'Aguascalientes': 'AS',
  'Baja California': 'BC',
  'Baja California Sur': 'BS',
  'Campeche': 'CC',
  'Chiapas': 'CS',
  'Chihuahua': 'CH',
  'Ciudad de México': 'DF',
  'Coahuila': 'CL',
  'Colima': 'CM',
  'Durango': 'DG',
  'Estado de México': 'MC',
  'Guanajuato': 'GT',
  'Guerrero': 'GR',
  'Hidalgo': 'HG',
  'Jalisco': 'JC',
  'Michoacán': 'MN',
  'Morelos': 'MS',
  'Nayarit': 'NT',
  'Nuevo León': 'NL',
  'Oaxaca': 'OC',
  'Puebla': 'PL',
  'Querétaro': 'QT',
  'Quintana Roo': 'QR',
  'San Luis Potosí': 'SP',
  'Sinaloa': 'SL',
  'Sonora': 'SR',
  'Tabasco': 'TC',
  'Tamaulipas': 'TS',
  'Tlaxcala': 'TL',
  'Veracruz': 'VZ',
  'Yucatán': 'YN',
  'Zacatecas': 'ZS',
  'Nacido en el Extranjero': 'NE'
};

/**
 * Abreviaturas de meses para generación de ID de estudio.
 * @const {string[]}
 */
var MESES_ABREV = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
];

/**
 * Opciones de tipo de documento para la sección de verificación.
 * @const {string[]}
 */
var TIPO_DOCUMENTO_OPTIONS = ['Original', 'Copia', 'Impresión', 'Digital'];

/**
 * Encabezados fijos del Banco de Preguntas (las primeras 8 columnas).
 * Las columnas adicionales son nombres de clientes.
 * @const {string[]}
 */
var BANCO_PREGUNTAS_HEADERS = [
  'id', 'seccion', 'pregunta', 'tipo_input',
  'obligatorio', 'placeholder', 'opciones', 'ayuda'
];

/**
 * Datos iniciales del Banco de Preguntas para la plantilla default.
 * Cada elemento es un arreglo con [id, seccion, pregunta, tipo_input, obligatorio, placeholder, opciones, ayuda].
 * @const {Array.<Array>}
 */
var BANCO_PREGUNTAS_INITIAL = [

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 1: DATOS GENERALES
  // ═══════════════════════════════════════════════════════════════
  ['fecha_solicitud', 'Datos Generales', 'Fecha de Solicitud', 'date', 'SI', '', '', 'Fecha en que se solicita el estudio'],
  ['fecha_visita', 'Datos Generales', 'Fecha de Visita Domiciliaria', 'date', 'SI', '', '', 'Fecha de la visita al domicilio'],
  ['puesto_solicitado', 'Datos Generales', 'Puesto Solicitado', 'text', 'SI', 'Ej: Gerente de Ventas', '', 'Puesto al que aplica el candidato'],
  ['demandas', 'Datos Generales', 'Demandas', 'textarea', 'NO', 'Demandas laborales previas', '', 'Indicar si existe alguna demanda laboral'],
  ['resultado', 'Datos Generales', 'Resultado', 'select', 'NO', '', 'Viable,No Viable,Con Reservas', 'Resultado general del estudio'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 2: DATOS PERSONALES
  // ═══════════════════════════════════════════════════════════════
  ['nombre_completo', 'Datos Personales', 'Nombre Completo', 'text', 'SI', 'Apellido Paterno Materno Nombre(s)', '', 'Nombre completo del candidato'],
  ['edad', 'Datos Personales', 'Edad', 'number', 'SI', '', '', 'Edad calculada automáticamente'],
  ['fecha_nacimiento', 'Datos Personales', 'Fecha de Nacimiento', 'date', 'SI', '', '', 'Fecha de nacimiento del candidato'],
  ['lugar_nacimiento', 'Datos Personales', 'Lugar de Nacimiento', 'select', 'SI', '', ESTADOS_MEXICO.join(','), 'Estado de nacimiento'],
  ['sexo', 'Datos Personales', 'Sexo', 'select', 'SI', '', 'Hombre,Mujer', 'Sexo del candidato'],
  ['direccion_completa', 'Datos Personales', 'Dirección Completa', 'textarea', 'SI', 'Calle, Número, Colonia, CP, Municipio, Estado', '', 'Domicilio actual completo'],
  ['tiempo_domicilio', 'Datos Personales', 'Tiempo en Domicilio Actual', 'text', 'SI', 'Ej: 3 años', '', 'Tiempo de residencia en domicilio actual'],
  ['domicilio_anterior', 'Datos Personales', 'Domicilio Anterior', 'textarea', 'NO', 'Dirección anterior completa', '', 'Domicilio previo al actual'],
  ['tiempo_domicilio_anterior', 'Datos Personales', 'Tiempo en Domicilio Anterior', 'text', 'NO', 'Ej: 2 años', '', 'Tiempo de residencia en domicilio anterior'],
  ['motivo_cambio_residencia', 'Datos Personales', 'Motivo de Cambio de Residencia', 'text', 'NO', '', '', 'Razón del cambio de domicilio'],
  ['telefono_casa', 'Datos Personales', 'Teléfono de Casa', 'tel', 'NO', '10 dígitos', '', 'Teléfono fijo del candidato'],
  ['celular', 'Datos Personales', 'Celular', 'tel', 'SI', '10 dígitos', '', 'Teléfono celular del candidato'],
  ['telefono_recados', 'Datos Personales', 'Teléfono de Recados', 'tel', 'NO', '10 dígitos', '', 'Teléfono alterno para recados'],
  ['correo', 'Datos Personales', 'Correo Electrónico', 'email', 'NO', 'ejemplo@correo.com', '', 'Email del candidato'],
  ['estado_civil', 'Datos Personales', 'Estado Civil', 'select', 'SI', '', 'Soltero(a),Casado(a),Divorciado(a),Viudo(a),Unión Libre,Separado(a)', 'Estado civil del candidato'],
  ['licencia', 'Datos Personales', 'Licencia de Conducir', 'select', 'NO', '', 'Sí,No', '¿Cuenta con licencia de conducir?'],
  ['tipo_sangre', 'Datos Personales', 'Tipo de Sangre', 'select', 'NO', '', 'A+,A-,B+,B-,AB+,AB-,O+,O-,No sabe', 'Tipo de sangre del candidato'],
  ['dependientes_economicos', 'Datos Personales', 'Dependientes Económicos', 'number', 'SI', '0', '', 'Número de dependientes económicos'],
  ['vive_con', 'Datos Personales', '¿Con quién vive?', 'text', 'SI', 'Ej: Esposa e hijos', '', 'Personas con las que cohabita'],
  ['curp', 'Datos Personales', 'CURP', 'text', 'SI', '18 caracteres', '', 'Clave Única de Registro de Población'],
  ['rfc', 'Datos Personales', 'RFC', 'text', 'SI', '13 caracteres', '', 'Registro Federal de Contribuyentes'],
  ['nss', 'Datos Personales', 'NSS', 'text', 'NO', '11 dígitos', '', 'Número de Seguridad Social'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 3: VERIFICACIÓN DE DOCUMENTOS
  // ═══════════════════════════════════════════════════════════════
  // Acta de Nacimiento
  ['doc_acta_nacimiento_folio', 'Verificación Documentos', 'Acta de Nacimiento - Folio', 'text', 'NO', 'Número de folio', '', 'Folio del acta de nacimiento'],
  ['doc_acta_nacimiento_tipo', 'Verificación Documentos', 'Acta de Nacimiento - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // RFC documento
  ['doc_rfc_folio', 'Verificación Documentos', 'RFC - Folio', 'text', 'NO', 'Número de folio', '', 'Folio del RFC'],
  ['doc_rfc_tipo', 'Verificación Documentos', 'RFC - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // Acta de Matrimonio
  ['doc_acta_matrimonio_folio', 'Verificación Documentos', 'Acta de Matrimonio - Folio', 'text', 'NO', 'Número de folio', '', 'Folio del acta de matrimonio'],
  ['doc_acta_matrimonio_tipo', 'Verificación Documentos', 'Acta de Matrimonio - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // Pasaporte
  ['doc_pasaporte_folio', 'Verificación Documentos', 'Pasaporte - Folio', 'text', 'NO', 'Número de pasaporte', '', 'Número de pasaporte'],
  ['doc_pasaporte_tipo', 'Verificación Documentos', 'Pasaporte - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // IMSS/NSS
  ['doc_imss_folio', 'Verificación Documentos', 'IMSS/NSS - Folio', 'text', 'NO', 'Número de seguridad social', '', 'Folio del documento IMSS/NSS'],
  ['doc_imss_tipo', 'Verificación Documentos', 'IMSS/NSS - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // Cartilla Militar
  ['doc_cartilla_folio', 'Verificación Documentos', 'Cartilla Militar - Folio', 'text', 'NO', 'Número de cartilla', '', 'Folio de la cartilla militar'],
  ['doc_cartilla_tipo', 'Verificación Documentos', 'Cartilla Militar - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // Comprobante Domicilio
  ['doc_comprobante_domicilio_folio', 'Verificación Documentos', 'Comprobante de Domicilio - Folio', 'text', 'NO', 'Referencia del recibo', '', 'Folio del comprobante de domicilio'],
  ['doc_comprobante_domicilio_tipo', 'Verificación Documentos', 'Comprobante de Domicilio - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // Licencia de Manejo
  ['doc_licencia_folio', 'Verificación Documentos', 'Licencia de Manejo - Folio', 'text', 'NO', 'Número de licencia', '', 'Folio de la licencia de manejo'],
  ['doc_licencia_tipo', 'Verificación Documentos', 'Licencia de Manejo - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // Comprobante Estudios
  ['doc_estudios_folio', 'Verificación Documentos', 'Comprobante de Estudios - Folio', 'text', 'NO', 'Número de cédula o certificado', '', 'Folio del comprobante de estudios'],
  ['doc_estudios_tipo', 'Verificación Documentos', 'Comprobante de Estudios - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // Cartas Recomendación
  ['doc_cartas_folio', 'Verificación Documentos', 'Cartas de Recomendación - Folio', 'text', 'NO', 'Cantidad y emisor', '', 'Datos de las cartas de recomendación'],
  ['doc_cartas_tipo', 'Verificación Documentos', 'Cartas de Recomendación - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // INE
  ['doc_ine_folio', 'Verificación Documentos', 'INE - Folio', 'text', 'NO', 'Clave de elector', '', 'Clave de elector de la INE'],
  ['doc_ine_tipo', 'Verificación Documentos', 'INE - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // Recibos de Nómina
  ['doc_nomina_folio', 'Verificación Documentos', 'Recibos de Nómina - Folio', 'text', 'NO', 'Período de nómina', '', 'Datos de los recibos de nómina'],
  ['doc_nomina_tipo', 'Verificación Documentos', 'Recibos de Nómina - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // CURP documento
  ['doc_curp_folio', 'Verificación Documentos', 'CURP - Folio', 'text', 'NO', 'CURP impreso', '', 'Folio del documento CURP'],
  ['doc_curp_tipo', 'Verificación Documentos', 'CURP - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],
  // Crédito Infonavit
  ['doc_infonavit_folio', 'Verificación Documentos', 'Crédito Infonavit - Folio', 'text', 'NO', 'Número de crédito', '', 'Folio del crédito Infonavit'],
  ['doc_infonavit_tipo', 'Verificación Documentos', 'Crédito Infonavit - Tipo', 'select', 'NO', '', 'Original,Copia,Impresión,Digital', 'Tipo de documento presentado'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 4: TRAYECTORIA ESCOLAR
  // ═══════════════════════════════════════════════════════════════
  // Primaria
  ['esc_primaria_periodo', 'Trayectoria Escolar', 'Primaria - Período', 'text', 'NO', 'Ej: 1995-2001', '', 'Período de estudios de primaria'],
  ['esc_primaria_escuela', 'Trayectoria Escolar', 'Primaria - Escuela', 'text', 'NO', 'Nombre de la escuela', '', 'Nombre de la escuela primaria'],
  ['esc_primaria_ciudad', 'Trayectoria Escolar', 'Primaria - Ciudad', 'text', 'NO', 'Ciudad y estado', '', 'Ciudad donde cursó la primaria'],
  ['esc_primaria_anos', 'Trayectoria Escolar', 'Primaria - Años Cursados', 'number', 'NO', '6', '', 'Años cursados en primaria'],
  ['esc_primaria_documento', 'Trayectoria Escolar', 'Primaria - Documento', 'select', 'NO', '', 'Certificado,Constancia,Boleta,Ninguno', 'Documento que acredita primaria'],
  // Secundaria
  ['esc_secundaria_periodo', 'Trayectoria Escolar', 'Secundaria - Período', 'text', 'NO', 'Ej: 2001-2004', '', 'Período de estudios de secundaria'],
  ['esc_secundaria_escuela', 'Trayectoria Escolar', 'Secundaria - Escuela', 'text', 'NO', 'Nombre de la escuela', '', 'Nombre de la escuela secundaria'],
  ['esc_secundaria_ciudad', 'Trayectoria Escolar', 'Secundaria - Ciudad', 'text', 'NO', 'Ciudad y estado', '', 'Ciudad donde cursó la secundaria'],
  ['esc_secundaria_anos', 'Trayectoria Escolar', 'Secundaria - Años Cursados', 'number', 'NO', '3', '', 'Años cursados en secundaria'],
  ['esc_secundaria_documento', 'Trayectoria Escolar', 'Secundaria - Documento', 'select', 'NO', '', 'Certificado,Constancia,Boleta,Ninguno', 'Documento que acredita secundaria'],
  // Bachillerato
  ['esc_bachillerato_periodo', 'Trayectoria Escolar', 'Bachillerato - Período', 'text', 'NO', 'Ej: 2004-2007', '', 'Período de estudios de bachillerato'],
  ['esc_bachillerato_escuela', 'Trayectoria Escolar', 'Bachillerato - Escuela', 'text', 'NO', 'Nombre de la escuela', '', 'Nombre de la escuela de bachillerato'],
  ['esc_bachillerato_ciudad', 'Trayectoria Escolar', 'Bachillerato - Ciudad', 'text', 'NO', 'Ciudad y estado', '', 'Ciudad donde cursó bachillerato'],
  ['esc_bachillerato_anos', 'Trayectoria Escolar', 'Bachillerato - Años Cursados', 'number', 'NO', '3', '', 'Años cursados en bachillerato'],
  ['esc_bachillerato_documento', 'Trayectoria Escolar', 'Bachillerato - Documento', 'select', 'NO', '', 'Certificado,Constancia,Boleta,Ninguno', 'Documento que acredita bachillerato'],
  // Profesional
  ['esc_profesional_periodo', 'Trayectoria Escolar', 'Profesional - Período', 'text', 'NO', 'Ej: 2007-2012', '', 'Período de estudios profesionales'],
  ['esc_profesional_escuela', 'Trayectoria Escolar', 'Profesional - Escuela', 'text', 'NO', 'Nombre de la universidad', '', 'Nombre de la universidad'],
  ['esc_profesional_ciudad', 'Trayectoria Escolar', 'Profesional - Ciudad', 'text', 'NO', 'Ciudad y estado', '', 'Ciudad donde cursó estudios profesionales'],
  ['esc_profesional_anos', 'Trayectoria Escolar', 'Profesional - Años Cursados', 'number', 'NO', '4', '', 'Años cursados en profesional'],
  ['esc_profesional_documento', 'Trayectoria Escolar', 'Profesional - Documento', 'select', 'NO', '', 'Título,Cédula,Constancia,Certificado,Ninguno', 'Documento que acredita estudios profesionales'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 5: BIENES INMUEBLES
  // ═══════════════════════════════════════════════════════════════
  // Automóvil
  ['bien_auto_cantidad', 'Bienes Inmuebles', 'Automóvil - Cantidad', 'number', 'NO', '0', '', 'Cantidad de automóviles'],
  ['bien_auto_valor', 'Bienes Inmuebles', 'Automóvil - Valor Aproximado', 'text', 'NO', '$0.00', '', 'Valor aproximado del automóvil'],
  ['bien_auto_dueno', 'Bienes Inmuebles', 'Automóvil - Dueño', 'select', 'NO', '', 'Candidato,Cónyuge,Padres,Otro', 'Propietario del automóvil'],
  ['bien_auto_documento', 'Bienes Inmuebles', 'Automóvil - Documento', 'select', 'NO', '', 'Factura,Carta Factura,Tarjeta de Circulación,Ninguno', 'Documento que acredita la propiedad'],
  // Moto
  ['bien_moto_cantidad', 'Bienes Inmuebles', 'Motocicleta - Cantidad', 'number', 'NO', '0', '', 'Cantidad de motocicletas'],
  ['bien_moto_valor', 'Bienes Inmuebles', 'Motocicleta - Valor Aproximado', 'text', 'NO', '$0.00', '', 'Valor aproximado de la motocicleta'],
  ['bien_moto_dueno', 'Bienes Inmuebles', 'Motocicleta - Dueño', 'select', 'NO', '', 'Candidato,Cónyuge,Padres,Otro', 'Propietario de la motocicleta'],
  ['bien_moto_documento', 'Bienes Inmuebles', 'Motocicleta - Documento', 'select', 'NO', '', 'Factura,Carta Factura,Tarjeta de Circulación,Ninguno', 'Documento que acredita la propiedad'],
  // Casa
  ['bien_casa_cantidad', 'Bienes Inmuebles', 'Casa - Cantidad', 'number', 'NO', '0', '', 'Cantidad de casas'],
  ['bien_casa_valor', 'Bienes Inmuebles', 'Casa - Valor Aproximado', 'text', 'NO', '$0.00', '', 'Valor aproximado de la casa'],
  ['bien_casa_dueno', 'Bienes Inmuebles', 'Casa - Dueño', 'select', 'NO', '', 'Candidato,Cónyuge,Padres,Otro', 'Propietario de la casa'],
  ['bien_casa_documento', 'Bienes Inmuebles', 'Casa - Documento', 'select', 'NO', '', 'Escrituras,Contrato,Constancia,Ninguno', 'Documento que acredita la propiedad'],
  // Terreno
  ['bien_terreno_cantidad', 'Bienes Inmuebles', 'Terreno - Cantidad', 'number', 'NO', '0', '', 'Cantidad de terrenos'],
  ['bien_terreno_valor', 'Bienes Inmuebles', 'Terreno - Valor Aproximado', 'text', 'NO', '$0.00', '', 'Valor aproximado del terreno'],
  ['bien_terreno_dueno', 'Bienes Inmuebles', 'Terreno - Dueño', 'select', 'NO', '', 'Candidato,Cónyuge,Padres,Otro', 'Propietario del terreno'],
  ['bien_terreno_documento', 'Bienes Inmuebles', 'Terreno - Documento', 'select', 'NO', '', 'Escrituras,Contrato,Constancia,Ninguno', 'Documento que acredita la propiedad'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 6: VIVIENDA
  // ═══════════════════════════════════════════════════════════════
  ['tipo_vivienda', 'Vivienda', 'Tipo de Vivienda', 'select', 'SI', '', 'Propia,Rentada,Prestada,Hipotecada,De un familiar,Intestada', 'Tipo de propiedad de la vivienda'],
  ['orden_limpieza', 'Vivienda', 'Orden y Limpieza', 'select', 'SI', '', 'Bueno,Regular,Malo', 'Estado de orden y limpieza del inmueble'],
  ['tipo_construccion', 'Vivienda', 'Tipo de Construcción', 'select', 'SI', '', 'Concreto,Tabique,Madera,Lámina,Mixta,Otro', 'Material principal de la construcción'],
  ['banos', 'Vivienda', 'Baños', 'number', 'SI', '1', '', 'Cantidad de baños'],
  ['cocina', 'Vivienda', 'Cocina', 'select', 'SI', '', 'Sí,No', '¿Cuenta con cocina?'],
  ['sala', 'Vivienda', 'Sala', 'select', 'SI', '', 'Sí,No', '¿Cuenta con sala?'],
  ['comedor', 'Vivienda', 'Comedor', 'select', 'SI', '', 'Sí,No', '¿Cuenta con comedor?'],
  ['cuarto_servicios', 'Vivienda', 'Cuarto de Servicios', 'select', 'SI', '', 'Sí,No', '¿Cuenta con cuarto de servicios?'],
  ['recamaras', 'Vivienda', 'Recámaras', 'number', 'SI', '1', '', 'Cantidad de recámaras'],
  ['niveles', 'Vivienda', 'Niveles', 'number', 'SI', '1', '', 'Cantidad de niveles de la vivienda'],
  ['estacionamiento', 'Vivienda', 'Estacionamiento', 'select', 'SI', '', 'Sí,No', '¿Cuenta con estacionamiento?'],
  ['clasificacion_zona', 'Vivienda', 'Clasificación de la Zona', 'select', 'SI', '', 'Residencial,Media,Popular,Marginada,Rural,Interés Social', 'Clasificación socioeconómica de la zona'],
  ['estado_muebles', 'Vivienda', 'Estado de los Muebles', 'select', 'SI', '', 'Bueno,Regular,Malo', 'Condición general del mobiliario'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 7: ENTORNO FAMILIAR
  // Campos repetibles; el frontend maneja agregar filas dinámicas.
  // El id usa sufijo _1, _2, etc. para cada familiar.
  // ═══════════════════════════════════════════════════════════════
  ['fam_parentesco_1', 'Entorno Familiar', 'Parentesco', 'select', 'NO', '', 'Padre,Madre,Esposo(a),Hijo(a),Hermano(a),Abuelo(a),Tío(a),Primo(a),Suegro(a),Cuñado(a),Sobrino(a),Otro', 'Relación familiar con el candidato'],
  ['fam_nombre_1', 'Entorno Familiar', 'Nombre', 'text', 'NO', 'Nombre completo del familiar', '', 'Nombre del familiar'],
  ['fam_edad_1', 'Entorno Familiar', 'Edad', 'number', 'NO', '', '', 'Edad del familiar'],
  ['fam_escolaridad_1', 'Entorno Familiar', 'Escolaridad', 'select', 'NO', '', 'Sin estudios,Primaria,Secundaria,Bachillerato,Licenciatura,Maestría,Doctorado,Técnico', 'Nivel de escolaridad del familiar'],
  ['fam_ocupacion_1', 'Entorno Familiar', 'Ocupación', 'text', 'NO', 'Ocupación actual', '', 'Ocupación del familiar'],
  ['fam_telefonos_empleo_1', 'Entorno Familiar', 'Teléfonos / Empleo', 'text', 'NO', 'Teléfono y lugar de empleo', '', 'Teléfono y empleo del familiar'],
  ['fam_finado_1', 'Entorno Familiar', 'Finado', 'checkbox', 'NO', '', '', 'Indicar si el familiar es finado'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 8: NIVEL DE VIDA - INGRESOS
  // ═══════════════════════════════════════════════════════════════
  ['ing_nombre_1', 'Nivel de Vida - Ingresos', 'Nombre del Aportante', 'text', 'NO', 'Nombre completo', '', 'Persona que aporta ingresos'],
  ['ing_parentesco_1', 'Nivel de Vida - Ingresos', 'Parentesco', 'select', 'NO', '', 'Candidato,Esposo(a),Padre,Madre,Hijo(a),Hermano(a),Otro', 'Relación con el candidato'],
  ['ing_neto_1', 'Nivel de Vida - Ingresos', 'Ingreso Neto Mensual', 'text', 'NO', '$0.00', '', 'Ingreso neto mensual de esta persona'],
  ['ing_total', 'Nivel de Vida - Ingresos', 'Total de Ingresos Familiares', 'text', 'NO', '$0.00', '', 'Suma total de todos los ingresos familiares'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 9: NIVEL DE VIDA - EGRESOS
  // ═══════════════════════════════════════════════════════════════
  ['egreso_predial', 'Nivel de Vida - Egresos', 'Predial', 'text', 'NO', '$0.00', '', 'Gasto mensual en predial'],
  ['egreso_renta', 'Nivel de Vida - Egresos', 'Renta / Hipoteca', 'text', 'NO', '$0.00', '', 'Gasto mensual en renta o hipoteca'],
  ['egreso_luz', 'Nivel de Vida - Egresos', 'Luz', 'text', 'NO', '$0.00', '', 'Gasto mensual en electricidad'],
  ['egreso_agua', 'Nivel de Vida - Egresos', 'Agua', 'text', 'NO', '$0.00', '', 'Gasto mensual en agua'],
  ['egreso_gas', 'Nivel de Vida - Egresos', 'Gas', 'text', 'NO', '$0.00', '', 'Gasto mensual en gas'],
  ['egreso_telefono', 'Nivel de Vida - Egresos', 'Teléfono', 'text', 'NO', '$0.00', '', 'Gasto mensual en teléfono'],
  ['egreso_cable', 'Nivel de Vida - Egresos', 'Cable / Streaming', 'text', 'NO', '$0.00', '', 'Gasto mensual en TV de paga / streaming'],
  ['egreso_internet', 'Nivel de Vida - Egresos', 'Internet', 'text', 'NO', '$0.00', '', 'Gasto mensual en internet'],
  ['egreso_pavimentacion', 'Nivel de Vida - Egresos', 'Pavimentación', 'text', 'NO', '$0.00', '', 'Cuota de pavimentación'],
  ['egreso_vigilancia', 'Nivel de Vida - Egresos', 'Vigilancia', 'text', 'NO', '$0.00', '', 'Gasto en vigilancia privada'],
  ['egreso_alumbrado', 'Nivel de Vida - Egresos', 'Alumbrado Público', 'text', 'NO', '$0.00', '', 'Cuota de alumbrado público'],
  ['egreso_alimentacion', 'Nivel de Vida - Egresos', 'Alimentación', 'text', 'NO', '$0.00', '', 'Gasto mensual en alimentación'],
  ['egreso_transporte', 'Nivel de Vida - Egresos', 'Transporte', 'text', 'NO', '$0.00', '', 'Gasto mensual en transporte'],
  ['egreso_educacion', 'Nivel de Vida - Egresos', 'Educación', 'text', 'NO', '$0.00', '', 'Gasto mensual en educación'],
  ['egreso_medico', 'Nivel de Vida - Egresos', 'Gastos Médicos', 'text', 'NO', '$0.00', '', 'Gasto mensual en servicios médicos'],
  ['egreso_entretenimiento', 'Nivel de Vida - Egresos', 'Entretenimiento', 'text', 'NO', '$0.00', '', 'Gasto mensual en entretenimiento'],
  ['egreso_plan_celular', 'Nivel de Vida - Egresos', 'Plan Celular', 'text', 'NO', '$0.00', '', 'Gasto mensual en plan de celular'],
  ['egreso_mascotas', 'Nivel de Vida - Egresos', 'Mascotas', 'text', 'NO', '$0.00', '', 'Gasto mensual en mascotas'],
  ['egreso_mantenimiento', 'Nivel de Vida - Egresos', 'Mantenimiento', 'text', 'NO', '$0.00', '', 'Gasto mensual en mantenimiento del hogar'],
  ['egreso_otras_deudas', 'Nivel de Vida - Egresos', 'Otras Deudas', 'text', 'NO', '$0.00', '', 'Gasto mensual en otras deudas'],
  ['egreso_total', 'Nivel de Vida - Egresos', 'Total de Egresos', 'text', 'NO', '$0.00', '', 'Suma total de todos los egresos mensuales'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 10: ANÁLISIS DEL ENTORNO
  // ═══════════════════════════════════════════════════════════════
  ['originario_entidad', 'Análisis Entorno', 'Originario de Entidad', 'select', 'NO', '', ESTADOS_MEXICO.join(','), 'Entidad federativa de origen'],
  ['originario_localidad', 'Análisis Entorno', 'Localidad de Origen', 'text', 'NO', 'Nombre de la localidad', '', 'Localidad de origen'],
  ['zona_alta_densidad', 'Análisis Entorno', '¿Zona de Alta Densidad Poblacional?', 'select', 'NO', '', 'Sí,No', 'Indica si la zona es de alta densidad'],
  ['zona_mov_migratorio', 'Análisis Entorno', '¿Zona de Movimiento Migratorio?', 'select', 'NO', '', 'Sí,No', 'Indica si hay movimiento migratorio significativo'],
  ['problemas_farmaco', 'Análisis Entorno', '¿Problemas de Farmacodependencia en la Zona?', 'select', 'NO', '', 'Sí,No,No se detectó', 'Presencia de farmacodependencia en la zona'],
  ['vandalismo', 'Análisis Entorno', '¿Vandalismo / Inseguridad?', 'select', 'NO', '', 'Sí,No,No se detectó', 'Presencia de vandalismo o inseguridad'],
  ['club_religioso', 'Análisis Entorno', 'Club o Grupo Religioso', 'text', 'NO', '', '', 'Pertenencia a grupos religiosos'],
  ['club_deportivo', 'Análisis Entorno', 'Club o Grupo Deportivo', 'text', 'NO', '', '', 'Pertenencia a grupos deportivos'],
  ['religion', 'Análisis Entorno', 'Religión', 'text', 'NO', '', '', 'Religión que profesa'],
  ['pasatiempo', 'Análisis Entorno', 'Pasatiempos', 'text', 'NO', '', '', 'Pasatiempos principales'],
  ['mascotas', 'Análisis Entorno', 'Mascotas', 'text', 'NO', '', '', 'Tipo y cantidad de mascotas'],
  ['otros_entorno', 'Análisis Entorno', 'Otras Observaciones del Entorno', 'textarea', 'NO', '', '', 'Observaciones adicionales del entorno'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 11: DESCRIPCIÓN PERSONAL
  // ═══════════════════════════════════════════════════════════════
  ['descripcion_familiar_laboral', 'Descripción Personal', 'Descripción Familiar y Laboral', 'textarea', 'NO', 'Descripción general del entorno familiar y laboral del candidato', '', 'Descripción amplia de la situación familiar y laboral'],
  ['descripcion_metas', 'Descripción Personal', 'Metas y Objetivos', 'textarea', 'NO', 'Metas a corto, mediano y largo plazo', '', 'Metas profesionales y personales del candidato'],
  ['descripcion_importante', 'Descripción Personal', 'Aspectos Importantes a Destacar', 'textarea', 'NO', 'Información relevante adicional', '', 'Aspectos relevantes que no encajan en otra sección'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 12: ESTADO DE SALUD
  // ═══════════════════════════════════════════════════════════════
  ['tatuajes', 'Estado de Salud', '¿Tiene Tatuajes?', 'select', 'NO', '', 'Sí,No', '¿El candidato tiene tatuajes?'],
  ['alergias', 'Estado de Salud', 'Alergias', 'text', 'NO', 'Describir alergias', '', 'Alergias conocidas del candidato'],
  ['fuma', 'Estado de Salud', '¿Fuma?', 'select', 'NO', '', 'Sí,No,Ocasionalmente', '¿El candidato fuma?'],
  ['toma', 'Estado de Salud', '¿Toma Bebidas Alcohólicas?', 'select', 'NO', '', 'Sí,No,Ocasionalmente', '¿El candidato consume alcohol?'],
  ['peso', 'Estado de Salud', 'Peso (kg)', 'text', 'NO', 'Ej: 75', '', 'Peso del candidato en kilogramos'],
  ['altura', 'Estado de Salud', 'Altura (m)', 'text', 'NO', 'Ej: 1.75', '', 'Altura del candidato en metros'],
  ['deporte', 'Estado de Salud', '¿Practica algún Deporte?', 'text', 'NO', 'Cuál y con qué frecuencia', '', 'Actividad deportiva del candidato'],
  ['enfermedades_cronicas', 'Estado de Salud', 'Enfermedades Crónicas', 'text', 'NO', 'Describir enfermedades crónicas', '', 'Enfermedades crónicas del candidato'],
  ['antecedentes_patologicos', 'Estado de Salud', 'Antecedentes Patológicos Familiares', 'text', 'NO', 'Enfermedades hereditarias', '', 'Antecedentes patológicos familiares'],
  ['problemas_dentales', 'Estado de Salud', 'Problemas Dentales', 'text', 'NO', '', '', 'Problemas dentales visibles'],
  ['aspecto_personal', 'Estado de Salud', 'Aspecto Personal', 'select', 'NO', '', 'Bueno,Regular,Malo', 'Aspecto personal general'],
  ['tiene_familiar_empresa', 'Estado de Salud', '¿Tiene algún familiar en la empresa?', 'text', 'NO', 'Nombre y parentesco', '', 'Familiares que laboran en la empresa'],
  ['ha_laborado_empresa', 'Estado de Salud', '¿Ha laborado anteriormente en la empresa?', 'select', 'NO', '', 'Sí,No', '¿Ha trabajado antes en la empresa?'],
  ['como_se_entero', 'Estado de Salud', '¿Cómo se enteró de la vacante?', 'text', 'NO', '', '', 'Medio por el cual conoció la vacante'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 13: REFERENCIAS PERSONALES
  // ═══════════════════════════════════════════════════════════════
  // Referencia 1
  ['ref_nombre_1', 'Referencias Personales', 'Referencia 1 - Nombre', 'text', 'NO', 'Nombre completo', '', 'Nombre de la primera referencia'],
  ['ref_domicilio_1', 'Referencias Personales', 'Referencia 1 - Domicilio', 'textarea', 'NO', 'Dirección completa', '', 'Domicilio de la primera referencia'],
  ['ref_telefono_1', 'Referencias Personales', 'Referencia 1 - Teléfono', 'tel', 'NO', '10 dígitos', '', 'Teléfono de la primera referencia'],
  ['ref_tiempo_conocerlo_1', 'Referencias Personales', 'Referencia 1 - Tiempo de Conocerlo', 'text', 'NO', 'Ej: 5 años', '', 'Tiempo que conoce al candidato'],
  ['ref_relacion_1', 'Referencias Personales', 'Referencia 1 - Relación', 'text', 'NO', 'Ej: Amigo, Vecino', '', 'Tipo de relación con el candidato'],
  ['ref_descripcion_1', 'Referencias Personales', 'Referencia 1 - Descripción', 'textarea', 'NO', 'Descripción del candidato según la referencia', '', 'Lo que opina la referencia del candidato'],
  // Referencia 2
  ['ref_nombre_2', 'Referencias Personales', 'Referencia 2 - Nombre', 'text', 'NO', 'Nombre completo', '', 'Nombre de la segunda referencia'],
  ['ref_domicilio_2', 'Referencias Personales', 'Referencia 2 - Domicilio', 'textarea', 'NO', 'Dirección completa', '', 'Domicilio de la segunda referencia'],
  ['ref_telefono_2', 'Referencias Personales', 'Referencia 2 - Teléfono', 'tel', 'NO', '10 dígitos', '', 'Teléfono de la segunda referencia'],
  ['ref_tiempo_conocerlo_2', 'Referencias Personales', 'Referencia 2 - Tiempo de Conocerlo', 'text', 'NO', 'Ej: 5 años', '', 'Tiempo que conoce al candidato'],
  ['ref_relacion_2', 'Referencias Personales', 'Referencia 2 - Relación', 'text', 'NO', 'Ej: Amigo, Vecino', '', 'Tipo de relación con el candidato'],
  ['ref_descripcion_2', 'Referencias Personales', 'Referencia 2 - Descripción', 'textarea', 'NO', 'Descripción del candidato según la referencia', '', 'Lo que opina la referencia del candidato'],
  // Referencia 3
  ['ref_nombre_3', 'Referencias Personales', 'Referencia 3 - Nombre', 'text', 'NO', 'Nombre completo', '', 'Nombre de la tercera referencia'],
  ['ref_domicilio_3', 'Referencias Personales', 'Referencia 3 - Domicilio', 'textarea', 'NO', 'Dirección completa', '', 'Domicilio de la tercera referencia'],
  ['ref_telefono_3', 'Referencias Personales', 'Referencia 3 - Teléfono', 'tel', 'NO', '10 dígitos', '', 'Teléfono de la tercera referencia'],
  ['ref_tiempo_conocerlo_3', 'Referencias Personales', 'Referencia 3 - Tiempo de Conocerlo', 'text', 'NO', 'Ej: 5 años', '', 'Tiempo que conoce al candidato'],
  ['ref_relacion_3', 'Referencias Personales', 'Referencia 3 - Relación', 'text', 'NO', 'Ej: Amigo, Vecino', '', 'Tipo de relación con el candidato'],
  ['ref_descripcion_3', 'Referencias Personales', 'Referencia 3 - Descripción', 'textarea', 'NO', 'Descripción del candidato según la referencia', '', 'Lo que opina la referencia del candidato'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 14: DATOS DE EMERGENCIA
  // ═══════════════════════════════════════════════════════════════
  ['emergencia_nombre', 'Datos Emergencia', 'Nombre del Contacto de Emergencia', 'text', 'SI', 'Nombre completo', '', 'Persona a contactar en caso de emergencia'],
  ['emergencia_parentesco', 'Datos Emergencia', 'Parentesco', 'select', 'SI', '', 'Padre,Madre,Esposo(a),Hijo(a),Hermano(a),Otro', 'Relación con el candidato'],
  ['emergencia_tel_fijo', 'Datos Emergencia', 'Teléfono Fijo', 'tel', 'NO', '10 dígitos', '', 'Teléfono fijo del contacto de emergencia'],
  ['emergencia_tel_movil', 'Datos Emergencia', 'Teléfono Móvil', 'tel', 'SI', '10 dígitos', '', 'Teléfono celular del contacto de emergencia'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 15: EMPRESA INVESTIGADA 1
  // ═══════════════════════════════════════════════════════════════
  ['emp1_nombre', 'Empresa Investigada 1', 'Nombre del Candidato en esta Empresa', 'text', 'NO', '', '', 'Nombre con el que laboró'],
  ['emp1_nombre_empresa', 'Empresa Investigada 1', 'Nombre de la Empresa', 'text', 'NO', '', '', 'Razón social o nombre comercial'],
  ['emp1_giro', 'Empresa Investigada 1', 'Giro (Candidato)', 'text', 'NO', '', '', 'Giro indicado por el candidato'],
  ['emp1_giro_empresa', 'Empresa Investigada 1', 'Giro (Empresa)', 'text', 'NO', '', '', 'Giro confirmado por la empresa'],
  ['emp1_direccion', 'Empresa Investigada 1', 'Dirección (Candidato)', 'textarea', 'NO', '', '', 'Dirección indicada por el candidato'],
  ['emp1_direccion_empresa', 'Empresa Investigada 1', 'Dirección (Empresa)', 'textarea', 'NO', '', '', 'Dirección confirmada por la empresa'],
  ['emp1_telefono_empresa', 'Empresa Investigada 1', 'Teléfono de la Empresa', 'tel', 'NO', '', '', 'Teléfono de contacto de la empresa'],
  ['emp1_puesto_inicial', 'Empresa Investigada 1', 'Puesto Inicial (Candidato)', 'text', 'NO', '', '', 'Puesto de ingreso según el candidato'],
  ['emp1_puesto_inicial_empresa', 'Empresa Investigada 1', 'Puesto Inicial (Empresa)', 'text', 'NO', '', '', 'Puesto de ingreso confirmado por la empresa'],
  ['emp1_puesto_final', 'Empresa Investigada 1', 'Puesto Final (Candidato)', 'text', 'NO', '', '', 'Último puesto según el candidato'],
  ['emp1_puesto_final_empresa', 'Empresa Investigada 1', 'Puesto Final (Empresa)', 'text', 'NO', '', '', 'Último puesto confirmado por la empresa'],
  ['emp1_tipo_contrato', 'Empresa Investigada 1', 'Tipo de Contrato (Candidato)', 'select', 'NO', '', 'Planta,Eventual,Honorarios,Outsourcing,Otro', 'Tipo de contrato según el candidato'],
  ['emp1_tipo_contrato_empresa', 'Empresa Investigada 1', 'Tipo de Contrato (Empresa)', 'select', 'NO', '', 'Planta,Eventual,Honorarios,Outsourcing,Otro', 'Tipo de contrato confirmado por la empresa'],
  ['emp1_fecha_ingreso', 'Empresa Investigada 1', 'Fecha de Ingreso (Candidato)', 'date', 'NO', '', '', 'Fecha de ingreso según el candidato'],
  ['emp1_fecha_ingreso_empresa', 'Empresa Investigada 1', 'Fecha de Ingreso (Empresa)', 'date', 'NO', '', '', 'Fecha de ingreso confirmada por la empresa'],
  ['emp1_fecha_salida', 'Empresa Investigada 1', 'Fecha de Salida (Candidato)', 'date', 'NO', '', '', 'Fecha de salida según el candidato'],
  ['emp1_fecha_salida_empresa', 'Empresa Investigada 1', 'Fecha de Salida (Empresa)', 'date', 'NO', '', '', 'Fecha de salida confirmada por la empresa'],
  ['emp1_sueldo_inicial', 'Empresa Investigada 1', 'Sueldo Inicial (Candidato)', 'text', 'NO', '$0.00', '', 'Sueldo de ingreso según el candidato'],
  ['emp1_sueldo_inicial_empresa', 'Empresa Investigada 1', 'Sueldo Inicial (Empresa)', 'text', 'NO', '$0.00', '', 'Sueldo de ingreso confirmado por la empresa'],
  ['emp1_sueldo_final', 'Empresa Investigada 1', 'Sueldo Final (Candidato)', 'text', 'NO', '$0.00', '', 'Último sueldo según el candidato'],
  ['emp1_sueldo_final_empresa', 'Empresa Investigada 1', 'Sueldo Final (Empresa)', 'text', 'NO', '$0.00', '', 'Último sueldo confirmado por la empresa'],
  ['emp1_faltas', 'Empresa Investigada 1', 'Faltas (Candidato)', 'text', 'NO', '', '', 'Faltas según el candidato'],
  ['emp1_faltas_empresa', 'Empresa Investigada 1', 'Faltas (Empresa)', 'text', 'NO', '', '', 'Faltas confirmadas por la empresa'],
  ['emp1_recomendable', 'Empresa Investigada 1', '¿Es Recomendable? (Candidato)', 'select', 'NO', '', 'Sí,No', 'Autoevaluación del candidato'],
  ['emp1_recomendable_empresa', 'Empresa Investigada 1', '¿Es Recomendable? (Empresa)', 'select', 'NO', '', 'Sí,No,Con Reservas', 'Evaluación de la empresa'],
  ['emp1_no_recomendable', 'Empresa Investigada 1', 'Motivo No Recomendable (Candidato)', 'text', 'NO', '', '', 'Razón si no es recomendable (candidato)'],
  ['emp1_no_recomendable_empresa', 'Empresa Investigada 1', 'Motivo No Recomendable (Empresa)', 'text', 'NO', '', '', 'Razón si no es recomendable (empresa)'],
  ['emp1_motivo_salida', 'Empresa Investigada 1', 'Motivo de Salida (Candidato)', 'text', 'NO', '', '', 'Motivo de salida según el candidato'],
  ['emp1_motivo_salida_empresa', 'Empresa Investigada 1', 'Motivo de Salida (Empresa)', 'text', 'NO', '', '', 'Motivo de salida confirmado por la empresa'],
  ['emp1_jefe_nombre', 'Empresa Investigada 1', 'Nombre del Jefe (Candidato)', 'text', 'NO', '', '', 'Nombre del jefe según el candidato'],
  ['emp1_jefe_nombre_empresa', 'Empresa Investigada 1', 'Nombre del Jefe (Empresa)', 'text', 'NO', '', '', 'Nombre del jefe confirmado por la empresa'],
  ['emp1_jefe_puesto', 'Empresa Investigada 1', 'Puesto del Jefe (Candidato)', 'text', 'NO', '', '', 'Puesto del jefe según el candidato'],
  ['emp1_jefe_puesto_empresa', 'Empresa Investigada 1', 'Puesto del Jefe (Empresa)', 'text', 'NO', '', '', 'Puesto del jefe confirmado por la empresa'],
  ['emp1_jefe_telefono', 'Empresa Investigada 1', 'Teléfono del Jefe (Candidato)', 'tel', 'NO', '', '', 'Teléfono del jefe según el candidato'],
  ['emp1_jefe_telefono_empresa', 'Empresa Investigada 1', 'Teléfono del Jefe (Empresa)', 'tel', 'NO', '', '', 'Teléfono del jefe confirmado por la empresa'],
  ['emp1_informante', 'Empresa Investigada 1', 'Informante (Candidato)', 'text', 'NO', '', '', 'Nombre del informante según el candidato'],
  ['emp1_informante_empresa', 'Empresa Investigada 1', 'Informante (Empresa)', 'text', 'NO', '', '', 'Nombre del informante en la empresa'],
  ['emp1_informante_puesto', 'Empresa Investigada 1', 'Puesto del Informante (Candidato)', 'text', 'NO', '', '', 'Puesto del informante según el candidato'],
  ['emp1_informante_puesto_empresa', 'Empresa Investigada 1', 'Puesto del Informante (Empresa)', 'text', 'NO', '', '', 'Puesto del informante en la empresa'],
  // Conceptos evaluados Empresa 1
  ['emp1_puntualidad', 'Empresa Investigada 1', 'Puntualidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de puntualidad'],
  ['emp1_asistencia', 'Empresa Investigada 1', 'Asistencia', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de asistencia'],
  ['emp1_rel_companeros', 'Empresa Investigada 1', 'Relación con Compañeros', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de relación con compañeros'],
  ['emp1_rel_superiores', 'Empresa Investigada 1', 'Relación con Superiores', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de relación con superiores'],
  ['emp1_responsabilidad', 'Empresa Investigada 1', 'Responsabilidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de responsabilidad'],
  ['emp1_honestidad', 'Empresa Investigada 1', 'Honestidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de honestidad'],
  ['emp1_trabajo_equipo', 'Empresa Investigada 1', 'Trabajo en Equipo', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de trabajo en equipo'],
  ['emp1_conducta_disciplina', 'Empresa Investigada 1', 'Conducta y Disciplina', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de conducta y disciplina'],
  ['emp1_confiabilidad', 'Empresa Investigada 1', 'Confiabilidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de confiabilidad'],
  ['emp1_iniciativa', 'Empresa Investigada 1', 'Iniciativa', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de iniciativa'],
  ['emp1_calidad_trabajo', 'Empresa Investigada 1', 'Calidad de Trabajo', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de calidad de trabajo'],
  ['emp1_observaciones', 'Empresa Investigada 1', 'Observaciones', 'textarea', 'NO', '', '', 'Observaciones generales sobre esta empresa'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 15b: EMPRESA INVESTIGADA 2
  // ═══════════════════════════════════════════════════════════════
  ['emp2_nombre', 'Empresa Investigada 2', 'Nombre del Candidato en esta Empresa', 'text', 'NO', '', '', 'Nombre con el que laboró'],
  ['emp2_nombre_empresa', 'Empresa Investigada 2', 'Nombre de la Empresa', 'text', 'NO', '', '', 'Razón social o nombre comercial'],
  ['emp2_giro', 'Empresa Investigada 2', 'Giro (Candidato)', 'text', 'NO', '', '', 'Giro indicado por el candidato'],
  ['emp2_giro_empresa', 'Empresa Investigada 2', 'Giro (Empresa)', 'text', 'NO', '', '', 'Giro confirmado por la empresa'],
  ['emp2_direccion', 'Empresa Investigada 2', 'Dirección (Candidato)', 'textarea', 'NO', '', '', 'Dirección indicada por el candidato'],
  ['emp2_direccion_empresa', 'Empresa Investigada 2', 'Dirección (Empresa)', 'textarea', 'NO', '', '', 'Dirección confirmada por la empresa'],
  ['emp2_telefono_empresa', 'Empresa Investigada 2', 'Teléfono de la Empresa', 'tel', 'NO', '', '', 'Teléfono de contacto de la empresa'],
  ['emp2_puesto_inicial', 'Empresa Investigada 2', 'Puesto Inicial (Candidato)', 'text', 'NO', '', '', 'Puesto de ingreso según el candidato'],
  ['emp2_puesto_inicial_empresa', 'Empresa Investigada 2', 'Puesto Inicial (Empresa)', 'text', 'NO', '', '', 'Puesto de ingreso confirmado por la empresa'],
  ['emp2_puesto_final', 'Empresa Investigada 2', 'Puesto Final (Candidato)', 'text', 'NO', '', '', 'Último puesto según el candidato'],
  ['emp2_puesto_final_empresa', 'Empresa Investigada 2', 'Puesto Final (Empresa)', 'text', 'NO', '', '', 'Último puesto confirmado por la empresa'],
  ['emp2_tipo_contrato', 'Empresa Investigada 2', 'Tipo de Contrato (Candidato)', 'select', 'NO', '', 'Planta,Eventual,Honorarios,Outsourcing,Otro', 'Tipo de contrato según el candidato'],
  ['emp2_tipo_contrato_empresa', 'Empresa Investigada 2', 'Tipo de Contrato (Empresa)', 'select', 'NO', '', 'Planta,Eventual,Honorarios,Outsourcing,Otro', 'Tipo de contrato confirmado'],
  ['emp2_fecha_ingreso', 'Empresa Investigada 2', 'Fecha de Ingreso (Candidato)', 'date', 'NO', '', '', 'Fecha de ingreso según el candidato'],
  ['emp2_fecha_ingreso_empresa', 'Empresa Investigada 2', 'Fecha de Ingreso (Empresa)', 'date', 'NO', '', '', 'Fecha de ingreso confirmada por la empresa'],
  ['emp2_fecha_salida', 'Empresa Investigada 2', 'Fecha de Salida (Candidato)', 'date', 'NO', '', '', 'Fecha de salida según el candidato'],
  ['emp2_fecha_salida_empresa', 'Empresa Investigada 2', 'Fecha de Salida (Empresa)', 'date', 'NO', '', '', 'Fecha de salida confirmada por la empresa'],
  ['emp2_sueldo_inicial', 'Empresa Investigada 2', 'Sueldo Inicial (Candidato)', 'text', 'NO', '$0.00', '', 'Sueldo de ingreso según el candidato'],
  ['emp2_sueldo_inicial_empresa', 'Empresa Investigada 2', 'Sueldo Inicial (Empresa)', 'text', 'NO', '$0.00', '', 'Sueldo de ingreso confirmado'],
  ['emp2_sueldo_final', 'Empresa Investigada 2', 'Sueldo Final (Candidato)', 'text', 'NO', '$0.00', '', 'Último sueldo según el candidato'],
  ['emp2_sueldo_final_empresa', 'Empresa Investigada 2', 'Sueldo Final (Empresa)', 'text', 'NO', '$0.00', '', 'Último sueldo confirmado'],
  ['emp2_faltas', 'Empresa Investigada 2', 'Faltas (Candidato)', 'text', 'NO', '', '', 'Faltas según el candidato'],
  ['emp2_faltas_empresa', 'Empresa Investigada 2', 'Faltas (Empresa)', 'text', 'NO', '', '', 'Faltas confirmadas por la empresa'],
  ['emp2_recomendable', 'Empresa Investigada 2', '¿Es Recomendable? (Candidato)', 'select', 'NO', '', 'Sí,No', 'Autoevaluación del candidato'],
  ['emp2_recomendable_empresa', 'Empresa Investigada 2', '¿Es Recomendable? (Empresa)', 'select', 'NO', '', 'Sí,No,Con Reservas', 'Evaluación de la empresa'],
  ['emp2_no_recomendable', 'Empresa Investigada 2', 'Motivo No Recomendable (Candidato)', 'text', 'NO', '', '', 'Razón si no es recomendable'],
  ['emp2_no_recomendable_empresa', 'Empresa Investigada 2', 'Motivo No Recomendable (Empresa)', 'text', 'NO', '', '', 'Razón si no es recomendable'],
  ['emp2_motivo_salida', 'Empresa Investigada 2', 'Motivo de Salida (Candidato)', 'text', 'NO', '', '', 'Motivo de salida según el candidato'],
  ['emp2_motivo_salida_empresa', 'Empresa Investigada 2', 'Motivo de Salida (Empresa)', 'text', 'NO', '', '', 'Motivo de salida confirmado'],
  ['emp2_jefe_nombre', 'Empresa Investigada 2', 'Nombre del Jefe (Candidato)', 'text', 'NO', '', '', 'Nombre del jefe según el candidato'],
  ['emp2_jefe_nombre_empresa', 'Empresa Investigada 2', 'Nombre del Jefe (Empresa)', 'text', 'NO', '', '', 'Nombre del jefe confirmado'],
  ['emp2_jefe_puesto', 'Empresa Investigada 2', 'Puesto del Jefe (Candidato)', 'text', 'NO', '', '', 'Puesto del jefe según el candidato'],
  ['emp2_jefe_puesto_empresa', 'Empresa Investigada 2', 'Puesto del Jefe (Empresa)', 'text', 'NO', '', '', 'Puesto del jefe confirmado'],
  ['emp2_jefe_telefono', 'Empresa Investigada 2', 'Teléfono del Jefe (Candidato)', 'tel', 'NO', '', '', 'Teléfono del jefe'],
  ['emp2_jefe_telefono_empresa', 'Empresa Investigada 2', 'Teléfono del Jefe (Empresa)', 'tel', 'NO', '', '', 'Teléfono del jefe confirmado'],
  ['emp2_informante', 'Empresa Investigada 2', 'Informante (Candidato)', 'text', 'NO', '', '', 'Informante según el candidato'],
  ['emp2_informante_empresa', 'Empresa Investigada 2', 'Informante (Empresa)', 'text', 'NO', '', '', 'Informante en la empresa'],
  ['emp2_informante_puesto', 'Empresa Investigada 2', 'Puesto del Informante (Candidato)', 'text', 'NO', '', '', 'Puesto del informante'],
  ['emp2_informante_puesto_empresa', 'Empresa Investigada 2', 'Puesto del Informante (Empresa)', 'text', 'NO', '', '', 'Puesto del informante confirmado'],
  ['emp2_puntualidad', 'Empresa Investigada 2', 'Puntualidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de puntualidad'],
  ['emp2_asistencia', 'Empresa Investigada 2', 'Asistencia', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Evaluación de asistencia'],
  ['emp2_rel_companeros', 'Empresa Investigada 2', 'Relación con Compañeros', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Relación con compañeros'],
  ['emp2_rel_superiores', 'Empresa Investigada 2', 'Relación con Superiores', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Relación con superiores'],
  ['emp2_responsabilidad', 'Empresa Investigada 2', 'Responsabilidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Responsabilidad'],
  ['emp2_honestidad', 'Empresa Investigada 2', 'Honestidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Honestidad'],
  ['emp2_trabajo_equipo', 'Empresa Investigada 2', 'Trabajo en Equipo', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Trabajo en equipo'],
  ['emp2_conducta_disciplina', 'Empresa Investigada 2', 'Conducta y Disciplina', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Conducta y disciplina'],
  ['emp2_confiabilidad', 'Empresa Investigada 2', 'Confiabilidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Confiabilidad'],
  ['emp2_iniciativa', 'Empresa Investigada 2', 'Iniciativa', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Iniciativa'],
  ['emp2_calidad_trabajo', 'Empresa Investigada 2', 'Calidad de Trabajo', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Calidad de trabajo'],
  ['emp2_observaciones', 'Empresa Investigada 2', 'Observaciones', 'textarea', 'NO', '', '', 'Observaciones generales'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 15c: EMPRESA INVESTIGADA 3
  // ═══════════════════════════════════════════════════════════════
  ['emp3_nombre', 'Empresa Investigada 3', 'Nombre del Candidato en esta Empresa', 'text', 'NO', '', '', 'Nombre con el que laboró'],
  ['emp3_nombre_empresa', 'Empresa Investigada 3', 'Nombre de la Empresa', 'text', 'NO', '', '', 'Razón social o nombre comercial'],
  ['emp3_giro', 'Empresa Investigada 3', 'Giro (Candidato)', 'text', 'NO', '', '', 'Giro indicado por el candidato'],
  ['emp3_giro_empresa', 'Empresa Investigada 3', 'Giro (Empresa)', 'text', 'NO', '', '', 'Giro confirmado por la empresa'],
  ['emp3_direccion', 'Empresa Investigada 3', 'Dirección (Candidato)', 'textarea', 'NO', '', '', 'Dirección según el candidato'],
  ['emp3_direccion_empresa', 'Empresa Investigada 3', 'Dirección (Empresa)', 'textarea', 'NO', '', '', 'Dirección confirmada'],
  ['emp3_telefono_empresa', 'Empresa Investigada 3', 'Teléfono de la Empresa', 'tel', 'NO', '', '', 'Teléfono de la empresa'],
  ['emp3_puesto_inicial', 'Empresa Investigada 3', 'Puesto Inicial (Candidato)', 'text', 'NO', '', '', 'Puesto de ingreso'],
  ['emp3_puesto_inicial_empresa', 'Empresa Investigada 3', 'Puesto Inicial (Empresa)', 'text', 'NO', '', '', 'Puesto de ingreso confirmado'],
  ['emp3_puesto_final', 'Empresa Investigada 3', 'Puesto Final (Candidato)', 'text', 'NO', '', '', 'Último puesto'],
  ['emp3_puesto_final_empresa', 'Empresa Investigada 3', 'Puesto Final (Empresa)', 'text', 'NO', '', '', 'Último puesto confirmado'],
  ['emp3_tipo_contrato', 'Empresa Investigada 3', 'Tipo de Contrato (Candidato)', 'select', 'NO', '', 'Planta,Eventual,Honorarios,Outsourcing,Otro', 'Tipo de contrato'],
  ['emp3_tipo_contrato_empresa', 'Empresa Investigada 3', 'Tipo de Contrato (Empresa)', 'select', 'NO', '', 'Planta,Eventual,Honorarios,Outsourcing,Otro', 'Tipo de contrato confirmado'],
  ['emp3_fecha_ingreso', 'Empresa Investigada 3', 'Fecha de Ingreso (Candidato)', 'date', 'NO', '', '', 'Fecha de ingreso'],
  ['emp3_fecha_ingreso_empresa', 'Empresa Investigada 3', 'Fecha de Ingreso (Empresa)', 'date', 'NO', '', '', 'Fecha de ingreso confirmada'],
  ['emp3_fecha_salida', 'Empresa Investigada 3', 'Fecha de Salida (Candidato)', 'date', 'NO', '', '', 'Fecha de salida'],
  ['emp3_fecha_salida_empresa', 'Empresa Investigada 3', 'Fecha de Salida (Empresa)', 'date', 'NO', '', '', 'Fecha de salida confirmada'],
  ['emp3_sueldo_inicial', 'Empresa Investigada 3', 'Sueldo Inicial (Candidato)', 'text', 'NO', '$0.00', '', 'Sueldo de ingreso'],
  ['emp3_sueldo_inicial_empresa', 'Empresa Investigada 3', 'Sueldo Inicial (Empresa)', 'text', 'NO', '$0.00', '', 'Sueldo de ingreso confirmado'],
  ['emp3_sueldo_final', 'Empresa Investigada 3', 'Sueldo Final (Candidato)', 'text', 'NO', '$0.00', '', 'Último sueldo'],
  ['emp3_sueldo_final_empresa', 'Empresa Investigada 3', 'Sueldo Final (Empresa)', 'text', 'NO', '$0.00', '', 'Último sueldo confirmado'],
  ['emp3_faltas', 'Empresa Investigada 3', 'Faltas (Candidato)', 'text', 'NO', '', '', 'Faltas según el candidato'],
  ['emp3_faltas_empresa', 'Empresa Investigada 3', 'Faltas (Empresa)', 'text', 'NO', '', '', 'Faltas confirmadas'],
  ['emp3_recomendable', 'Empresa Investigada 3', '¿Es Recomendable? (Candidato)', 'select', 'NO', '', 'Sí,No', 'Autoevaluación'],
  ['emp3_recomendable_empresa', 'Empresa Investigada 3', '¿Es Recomendable? (Empresa)', 'select', 'NO', '', 'Sí,No,Con Reservas', 'Evaluación'],
  ['emp3_no_recomendable', 'Empresa Investigada 3', 'Motivo No Recomendable (Candidato)', 'text', 'NO', '', '', 'Razón no recomendable'],
  ['emp3_no_recomendable_empresa', 'Empresa Investigada 3', 'Motivo No Recomendable (Empresa)', 'text', 'NO', '', '', 'Razón no recomendable'],
  ['emp3_motivo_salida', 'Empresa Investigada 3', 'Motivo de Salida (Candidato)', 'text', 'NO', '', '', 'Motivo de salida'],
  ['emp3_motivo_salida_empresa', 'Empresa Investigada 3', 'Motivo de Salida (Empresa)', 'text', 'NO', '', '', 'Motivo de salida confirmado'],
  ['emp3_jefe_nombre', 'Empresa Investigada 3', 'Nombre del Jefe (Candidato)', 'text', 'NO', '', '', 'Nombre del jefe'],
  ['emp3_jefe_nombre_empresa', 'Empresa Investigada 3', 'Nombre del Jefe (Empresa)', 'text', 'NO', '', '', 'Nombre del jefe confirmado'],
  ['emp3_jefe_puesto', 'Empresa Investigada 3', 'Puesto del Jefe (Candidato)', 'text', 'NO', '', '', 'Puesto del jefe'],
  ['emp3_jefe_puesto_empresa', 'Empresa Investigada 3', 'Puesto del Jefe (Empresa)', 'text', 'NO', '', '', 'Puesto del jefe confirmado'],
  ['emp3_jefe_telefono', 'Empresa Investigada 3', 'Teléfono del Jefe (Candidato)', 'tel', 'NO', '', '', 'Teléfono del jefe'],
  ['emp3_jefe_telefono_empresa', 'Empresa Investigada 3', 'Teléfono del Jefe (Empresa)', 'tel', 'NO', '', '', 'Teléfono del jefe confirmado'],
  ['emp3_informante', 'Empresa Investigada 3', 'Informante (Candidato)', 'text', 'NO', '', '', 'Informante'],
  ['emp3_informante_empresa', 'Empresa Investigada 3', 'Informante (Empresa)', 'text', 'NO', '', '', 'Informante confirmado'],
  ['emp3_informante_puesto', 'Empresa Investigada 3', 'Puesto del Informante (Candidato)', 'text', 'NO', '', '', 'Puesto informante'],
  ['emp3_informante_puesto_empresa', 'Empresa Investigada 3', 'Puesto del Informante (Empresa)', 'text', 'NO', '', '', 'Puesto informante confirmado'],
  ['emp3_puntualidad', 'Empresa Investigada 3', 'Puntualidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Puntualidad'],
  ['emp3_asistencia', 'Empresa Investigada 3', 'Asistencia', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Asistencia'],
  ['emp3_rel_companeros', 'Empresa Investigada 3', 'Relación con Compañeros', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Relación con compañeros'],
  ['emp3_rel_superiores', 'Empresa Investigada 3', 'Relación con Superiores', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Relación con superiores'],
  ['emp3_responsabilidad', 'Empresa Investigada 3', 'Responsabilidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Responsabilidad'],
  ['emp3_honestidad', 'Empresa Investigada 3', 'Honestidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Honestidad'],
  ['emp3_trabajo_equipo', 'Empresa Investigada 3', 'Trabajo en Equipo', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Trabajo en equipo'],
  ['emp3_conducta_disciplina', 'Empresa Investigada 3', 'Conducta y Disciplina', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Conducta y disciplina'],
  ['emp3_confiabilidad', 'Empresa Investigada 3', 'Confiabilidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Confiabilidad'],
  ['emp3_iniciativa', 'Empresa Investigada 3', 'Iniciativa', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Iniciativa'],
  ['emp3_calidad_trabajo', 'Empresa Investigada 3', 'Calidad de Trabajo', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Calidad de trabajo'],
  ['emp3_observaciones', 'Empresa Investigada 3', 'Observaciones', 'textarea', 'NO', '', '', 'Observaciones generales'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 15d: EMPRESA INVESTIGADA 4
  // ═══════════════════════════════════════════════════════════════
  ['emp4_nombre', 'Empresa Investigada 4', 'Nombre del Candidato en esta Empresa', 'text', 'NO', '', '', 'Nombre con el que laboró'],
  ['emp4_nombre_empresa', 'Empresa Investigada 4', 'Nombre de la Empresa', 'text', 'NO', '', '', 'Razón social'],
  ['emp4_giro', 'Empresa Investigada 4', 'Giro (Candidato)', 'text', 'NO', '', '', 'Giro candidato'],
  ['emp4_giro_empresa', 'Empresa Investigada 4', 'Giro (Empresa)', 'text', 'NO', '', '', 'Giro empresa'],
  ['emp4_direccion', 'Empresa Investigada 4', 'Dirección (Candidato)', 'textarea', 'NO', '', '', 'Dirección candidato'],
  ['emp4_direccion_empresa', 'Empresa Investigada 4', 'Dirección (Empresa)', 'textarea', 'NO', '', '', 'Dirección empresa'],
  ['emp4_telefono_empresa', 'Empresa Investigada 4', 'Teléfono de la Empresa', 'tel', 'NO', '', '', 'Teléfono empresa'],
  ['emp4_puesto_inicial', 'Empresa Investigada 4', 'Puesto Inicial (Candidato)', 'text', 'NO', '', '', 'Puesto ingreso'],
  ['emp4_puesto_inicial_empresa', 'Empresa Investigada 4', 'Puesto Inicial (Empresa)', 'text', 'NO', '', '', 'Puesto ingreso confirmado'],
  ['emp4_puesto_final', 'Empresa Investigada 4', 'Puesto Final (Candidato)', 'text', 'NO', '', '', 'Último puesto'],
  ['emp4_puesto_final_empresa', 'Empresa Investigada 4', 'Puesto Final (Empresa)', 'text', 'NO', '', '', 'Último puesto confirmado'],
  ['emp4_tipo_contrato', 'Empresa Investigada 4', 'Tipo de Contrato (Candidato)', 'select', 'NO', '', 'Planta,Eventual,Honorarios,Outsourcing,Otro', 'Tipo contrato'],
  ['emp4_tipo_contrato_empresa', 'Empresa Investigada 4', 'Tipo de Contrato (Empresa)', 'select', 'NO', '', 'Planta,Eventual,Honorarios,Outsourcing,Otro', 'Tipo contrato confirmado'],
  ['emp4_fecha_ingreso', 'Empresa Investigada 4', 'Fecha de Ingreso (Candidato)', 'date', 'NO', '', '', 'Fecha ingreso'],
  ['emp4_fecha_ingreso_empresa', 'Empresa Investigada 4', 'Fecha de Ingreso (Empresa)', 'date', 'NO', '', '', 'Fecha ingreso confirmada'],
  ['emp4_fecha_salida', 'Empresa Investigada 4', 'Fecha de Salida (Candidato)', 'date', 'NO', '', '', 'Fecha salida'],
  ['emp4_fecha_salida_empresa', 'Empresa Investigada 4', 'Fecha de Salida (Empresa)', 'date', 'NO', '', '', 'Fecha salida confirmada'],
  ['emp4_sueldo_inicial', 'Empresa Investigada 4', 'Sueldo Inicial (Candidato)', 'text', 'NO', '$0.00', '', 'Sueldo ingreso'],
  ['emp4_sueldo_inicial_empresa', 'Empresa Investigada 4', 'Sueldo Inicial (Empresa)', 'text', 'NO', '$0.00', '', 'Sueldo ingreso confirmado'],
  ['emp4_sueldo_final', 'Empresa Investigada 4', 'Sueldo Final (Candidato)', 'text', 'NO', '$0.00', '', 'Último sueldo'],
  ['emp4_sueldo_final_empresa', 'Empresa Investigada 4', 'Sueldo Final (Empresa)', 'text', 'NO', '$0.00', '', 'Último sueldo confirmado'],
  ['emp4_faltas', 'Empresa Investigada 4', 'Faltas (Candidato)', 'text', 'NO', '', '', 'Faltas candidato'],
  ['emp4_faltas_empresa', 'Empresa Investigada 4', 'Faltas (Empresa)', 'text', 'NO', '', '', 'Faltas empresa'],
  ['emp4_recomendable', 'Empresa Investigada 4', '¿Es Recomendable? (Candidato)', 'select', 'NO', '', 'Sí,No', 'Autoevaluación'],
  ['emp4_recomendable_empresa', 'Empresa Investigada 4', '¿Es Recomendable? (Empresa)', 'select', 'NO', '', 'Sí,No,Con Reservas', 'Evaluación empresa'],
  ['emp4_no_recomendable', 'Empresa Investigada 4', 'Motivo No Recomendable (Candidato)', 'text', 'NO', '', '', 'Razón no recomendable'],
  ['emp4_no_recomendable_empresa', 'Empresa Investigada 4', 'Motivo No Recomendable (Empresa)', 'text', 'NO', '', '', 'Razón no recomendable empresa'],
  ['emp4_motivo_salida', 'Empresa Investigada 4', 'Motivo de Salida (Candidato)', 'text', 'NO', '', '', 'Motivo salida'],
  ['emp4_motivo_salida_empresa', 'Empresa Investigada 4', 'Motivo de Salida (Empresa)', 'text', 'NO', '', '', 'Motivo salida confirmado'],
  ['emp4_jefe_nombre', 'Empresa Investigada 4', 'Nombre del Jefe (Candidato)', 'text', 'NO', '', '', 'Jefe nombre'],
  ['emp4_jefe_nombre_empresa', 'Empresa Investigada 4', 'Nombre del Jefe (Empresa)', 'text', 'NO', '', '', 'Jefe nombre confirmado'],
  ['emp4_jefe_puesto', 'Empresa Investigada 4', 'Puesto del Jefe (Candidato)', 'text', 'NO', '', '', 'Jefe puesto'],
  ['emp4_jefe_puesto_empresa', 'Empresa Investigada 4', 'Puesto del Jefe (Empresa)', 'text', 'NO', '', '', 'Jefe puesto confirmado'],
  ['emp4_jefe_telefono', 'Empresa Investigada 4', 'Teléfono del Jefe (Candidato)', 'tel', 'NO', '', '', 'Jefe teléfono'],
  ['emp4_jefe_telefono_empresa', 'Empresa Investigada 4', 'Teléfono del Jefe (Empresa)', 'tel', 'NO', '', '', 'Jefe teléfono confirmado'],
  ['emp4_informante', 'Empresa Investigada 4', 'Informante (Candidato)', 'text', 'NO', '', '', 'Informante'],
  ['emp4_informante_empresa', 'Empresa Investigada 4', 'Informante (Empresa)', 'text', 'NO', '', '', 'Informante empresa'],
  ['emp4_informante_puesto', 'Empresa Investigada 4', 'Puesto del Informante (Candidato)', 'text', 'NO', '', '', 'Puesto informante'],
  ['emp4_informante_puesto_empresa', 'Empresa Investigada 4', 'Puesto del Informante (Empresa)', 'text', 'NO', '', '', 'Puesto informante confirmado'],
  ['emp4_puntualidad', 'Empresa Investigada 4', 'Puntualidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Puntualidad'],
  ['emp4_asistencia', 'Empresa Investigada 4', 'Asistencia', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Asistencia'],
  ['emp4_rel_companeros', 'Empresa Investigada 4', 'Relación con Compañeros', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Relación compañeros'],
  ['emp4_rel_superiores', 'Empresa Investigada 4', 'Relación con Superiores', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Relación superiores'],
  ['emp4_responsabilidad', 'Empresa Investigada 4', 'Responsabilidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Responsabilidad'],
  ['emp4_honestidad', 'Empresa Investigada 4', 'Honestidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Honestidad'],
  ['emp4_trabajo_equipo', 'Empresa Investigada 4', 'Trabajo en Equipo', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Trabajo equipo'],
  ['emp4_conducta_disciplina', 'Empresa Investigada 4', 'Conducta y Disciplina', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Conducta disciplina'],
  ['emp4_confiabilidad', 'Empresa Investigada 4', 'Confiabilidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Confiabilidad'],
  ['emp4_iniciativa', 'Empresa Investigada 4', 'Iniciativa', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Iniciativa'],
  ['emp4_calidad_trabajo', 'Empresa Investigada 4', 'Calidad de Trabajo', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Calidad trabajo'],
  ['emp4_observaciones', 'Empresa Investigada 4', 'Observaciones', 'textarea', 'NO', '', '', 'Observaciones'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 15e: EMPRESA INVESTIGADA 5
  // ═══════════════════════════════════════════════════════════════
  ['emp5_nombre', 'Empresa Investigada 5', 'Nombre del Candidato en esta Empresa', 'text', 'NO', '', '', 'Nombre con el que laboró'],
  ['emp5_nombre_empresa', 'Empresa Investigada 5', 'Nombre de la Empresa', 'text', 'NO', '', '', 'Razón social'],
  ['emp5_giro', 'Empresa Investigada 5', 'Giro (Candidato)', 'text', 'NO', '', '', 'Giro candidato'],
  ['emp5_giro_empresa', 'Empresa Investigada 5', 'Giro (Empresa)', 'text', 'NO', '', '', 'Giro empresa'],
  ['emp5_direccion', 'Empresa Investigada 5', 'Dirección (Candidato)', 'textarea', 'NO', '', '', 'Dirección candidato'],
  ['emp5_direccion_empresa', 'Empresa Investigada 5', 'Dirección (Empresa)', 'textarea', 'NO', '', '', 'Dirección empresa'],
  ['emp5_telefono_empresa', 'Empresa Investigada 5', 'Teléfono de la Empresa', 'tel', 'NO', '', '', 'Teléfono empresa'],
  ['emp5_puesto_inicial', 'Empresa Investigada 5', 'Puesto Inicial (Candidato)', 'text', 'NO', '', '', 'Puesto ingreso'],
  ['emp5_puesto_inicial_empresa', 'Empresa Investigada 5', 'Puesto Inicial (Empresa)', 'text', 'NO', '', '', 'Puesto ingreso confirmado'],
  ['emp5_puesto_final', 'Empresa Investigada 5', 'Puesto Final (Candidato)', 'text', 'NO', '', '', 'Último puesto'],
  ['emp5_puesto_final_empresa', 'Empresa Investigada 5', 'Puesto Final (Empresa)', 'text', 'NO', '', '', 'Último puesto confirmado'],
  ['emp5_tipo_contrato', 'Empresa Investigada 5', 'Tipo de Contrato (Candidato)', 'select', 'NO', '', 'Planta,Eventual,Honorarios,Outsourcing,Otro', 'Tipo contrato'],
  ['emp5_tipo_contrato_empresa', 'Empresa Investigada 5', 'Tipo de Contrato (Empresa)', 'select', 'NO', '', 'Planta,Eventual,Honorarios,Outsourcing,Otro', 'Tipo contrato confirmado'],
  ['emp5_fecha_ingreso', 'Empresa Investigada 5', 'Fecha de Ingreso (Candidato)', 'date', 'NO', '', '', 'Fecha ingreso'],
  ['emp5_fecha_ingreso_empresa', 'Empresa Investigada 5', 'Fecha de Ingreso (Empresa)', 'date', 'NO', '', '', 'Fecha ingreso confirmada'],
  ['emp5_fecha_salida', 'Empresa Investigada 5', 'Fecha de Salida (Candidato)', 'date', 'NO', '', '', 'Fecha salida'],
  ['emp5_fecha_salida_empresa', 'Empresa Investigada 5', 'Fecha de Salida (Empresa)', 'date', 'NO', '', '', 'Fecha salida confirmada'],
  ['emp5_sueldo_inicial', 'Empresa Investigada 5', 'Sueldo Inicial (Candidato)', 'text', 'NO', '$0.00', '', 'Sueldo ingreso'],
  ['emp5_sueldo_inicial_empresa', 'Empresa Investigada 5', 'Sueldo Inicial (Empresa)', 'text', 'NO', '$0.00', '', 'Sueldo ingreso confirmado'],
  ['emp5_sueldo_final', 'Empresa Investigada 5', 'Sueldo Final (Candidato)', 'text', 'NO', '$0.00', '', 'Último sueldo'],
  ['emp5_sueldo_final_empresa', 'Empresa Investigada 5', 'Sueldo Final (Empresa)', 'text', 'NO', '$0.00', '', 'Último sueldo confirmado'],
  ['emp5_faltas', 'Empresa Investigada 5', 'Faltas (Candidato)', 'text', 'NO', '', '', 'Faltas candidato'],
  ['emp5_faltas_empresa', 'Empresa Investigada 5', 'Faltas (Empresa)', 'text', 'NO', '', '', 'Faltas empresa'],
  ['emp5_recomendable', 'Empresa Investigada 5', '¿Es Recomendable? (Candidato)', 'select', 'NO', '', 'Sí,No', 'Autoevaluación'],
  ['emp5_recomendable_empresa', 'Empresa Investigada 5', '¿Es Recomendable? (Empresa)', 'select', 'NO', '', 'Sí,No,Con Reservas', 'Evaluación empresa'],
  ['emp5_no_recomendable', 'Empresa Investigada 5', 'Motivo No Recomendable (Candidato)', 'text', 'NO', '', '', 'Razón no recomendable'],
  ['emp5_no_recomendable_empresa', 'Empresa Investigada 5', 'Motivo No Recomendable (Empresa)', 'text', 'NO', '', '', 'Razón no recomendable empresa'],
  ['emp5_motivo_salida', 'Empresa Investigada 5', 'Motivo de Salida (Candidato)', 'text', 'NO', '', '', 'Motivo salida'],
  ['emp5_motivo_salida_empresa', 'Empresa Investigada 5', 'Motivo de Salida (Empresa)', 'text', 'NO', '', '', 'Motivo salida confirmado'],
  ['emp5_jefe_nombre', 'Empresa Investigada 5', 'Nombre del Jefe (Candidato)', 'text', 'NO', '', '', 'Jefe nombre'],
  ['emp5_jefe_nombre_empresa', 'Empresa Investigada 5', 'Nombre del Jefe (Empresa)', 'text', 'NO', '', '', 'Jefe nombre confirmado'],
  ['emp5_jefe_puesto', 'Empresa Investigada 5', 'Puesto del Jefe (Candidato)', 'text', 'NO', '', '', 'Jefe puesto'],
  ['emp5_jefe_puesto_empresa', 'Empresa Investigada 5', 'Puesto del Jefe (Empresa)', 'text', 'NO', '', '', 'Jefe puesto confirmado'],
  ['emp5_jefe_telefono', 'Empresa Investigada 5', 'Teléfono del Jefe (Candidato)', 'tel', 'NO', '', '', 'Jefe teléfono'],
  ['emp5_jefe_telefono_empresa', 'Empresa Investigada 5', 'Teléfono del Jefe (Empresa)', 'tel', 'NO', '', '', 'Jefe teléfono confirmado'],
  ['emp5_informante', 'Empresa Investigada 5', 'Informante (Candidato)', 'text', 'NO', '', '', 'Informante'],
  ['emp5_informante_empresa', 'Empresa Investigada 5', 'Informante (Empresa)', 'text', 'NO', '', '', 'Informante empresa'],
  ['emp5_informante_puesto', 'Empresa Investigada 5', 'Puesto del Informante (Candidato)', 'text', 'NO', '', '', 'Puesto informante'],
  ['emp5_informante_puesto_empresa', 'Empresa Investigada 5', 'Puesto del Informante (Empresa)', 'text', 'NO', '', '', 'Puesto informante confirmado'],
  ['emp5_puntualidad', 'Empresa Investigada 5', 'Puntualidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Puntualidad'],
  ['emp5_asistencia', 'Empresa Investigada 5', 'Asistencia', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Asistencia'],
  ['emp5_rel_companeros', 'Empresa Investigada 5', 'Relación con Compañeros', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Relación compañeros'],
  ['emp5_rel_superiores', 'Empresa Investigada 5', 'Relación con Superiores', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Relación superiores'],
  ['emp5_responsabilidad', 'Empresa Investigada 5', 'Responsabilidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Responsabilidad'],
  ['emp5_honestidad', 'Empresa Investigada 5', 'Honestidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Honestidad'],
  ['emp5_trabajo_equipo', 'Empresa Investigada 5', 'Trabajo en Equipo', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Trabajo equipo'],
  ['emp5_conducta_disciplina', 'Empresa Investigada 5', 'Conducta y Disciplina', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Conducta disciplina'],
  ['emp5_confiabilidad', 'Empresa Investigada 5', 'Confiabilidad', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Confiabilidad'],
  ['emp5_iniciativa', 'Empresa Investigada 5', 'Iniciativa', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Iniciativa'],
  ['emp5_calidad_trabajo', 'Empresa Investigada 5', 'Calidad de Trabajo', 'select', 'NO', '', 'Bueno,Regular,Malo,N/A', 'Calidad trabajo'],
  ['emp5_observaciones', 'Empresa Investigada 5', 'Observaciones', 'textarea', 'NO', '', '', 'Observaciones'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 16: OBSERVACIONES GENERALES
  // ═══════════════════════════════════════════════════════════════
  ['observaciones_nivel_vida', 'Observaciones Generales', 'Observaciones sobre Nivel de Vida', 'textarea', 'NO', 'Observaciones generales sobre el nivel de vida del candidato', '', 'Análisis general del nivel de vida'],
  ['observaciones_referencias', 'Observaciones Generales', 'Observaciones sobre Referencias', 'textarea', 'NO', 'Observaciones generales sobre las referencias del candidato', '', 'Análisis general de las referencias'],

  // ═══════════════════════════════════════════════════════════════
  // SECCIÓN 17: FOTOGRAFÍAS
  // ═══════════════════════════════════════════════════════════════
  ['foto_interior', 'Fotografías', 'Fotografía Interior del Domicilio', 'photo', 'NO', '', '', 'Foto del interior de la vivienda'],
  ['foto_exterior', 'Fotografías', 'Fotografía Exterior del Domicilio', 'photo', 'NO', '', '', 'Foto del exterior de la vivienda'],
  ['foto_visitador', 'Fotografías', 'Fotografía del Visitador', 'photo', 'NO', '', '', 'Foto del visitador en el domicilio']
];

/**
 * Lista de palabras inconvenientes para el CURP.
 * Si la combinación de los primeros 4 caracteres coincide con alguna,
 * se reemplaza la segunda letra con 'X'.
 * @const {string[]}
 */
var CURP_PALABRAS_INCONVENIENTES = [
  'BUEI', 'BUEY', 'CACA', 'CAGA', 'CAGO', 'CAKA', 'CAKO',
  'COGE', 'COGI', 'COJA', 'COJE', 'COJI', 'COJO', 'COLA',
  'CULO', 'FALO', 'FETO', 'GETA', 'GUEI', 'GUEY', 'JETA',
  'JOTO', 'KACA', 'KAGA', 'KAGO', 'KAKA', 'KAKO', 'KOGE',
  'KOGI', 'KOJA', 'KOJE', 'KOJI', 'KOJO', 'KOLA', 'KULO',
  'LELO', 'LILO', 'LOCA', 'LOCO', 'LOKA', 'LOKO', 'MAME',
  'MAMO', 'MEAR', 'MEAS', 'MEON', 'MIAR', 'MION', 'MOCO',
  'MOKO', 'MULA', 'MULO', 'NACA', 'NACO', 'PEDA', 'PEDO',
  'PENE', 'PIPI', 'PITO', 'POPO', 'PUTA', 'PUTO', 'QULO',
  'RATA', 'ROBA', 'ROBE', 'ROBO', 'RUIN', 'SENO', 'TETA',
  'VACA', 'VAGA', 'VAGO', 'VAKA', 'VUEI', 'VUEY', 'WUEI', 'WUEY'
];
