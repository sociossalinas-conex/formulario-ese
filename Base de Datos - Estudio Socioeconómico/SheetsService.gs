/**
 * SheetsService.gs
 * Servicio para manejo de Google Sheets (Base de Datos)
 */

var SheetsService = {
  
  /**
   * Obtiene la hoja de cálculo activa. Si es null o standalone, intenta abrir
   * por ID o buscarla/crearla en la carpeta de Drive designada.
   */
  getSpreadsheet: function() {
    var ss = null;
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      console.warn("getActiveSpreadsheet falló: " + e);
    }
    
    if (ss) return ss;
    
    // Intentar buscar en la carpeta de Drive designada
    try {
      var folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      var files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
      if (files.hasNext()) {
        var file = files.next();
        return SpreadsheetApp.openById(file.getId());
      } else {
        // Si no hay ninguna hoja de cálculo en la carpeta, crear una nueva!
        var newSheet = SpreadsheetApp.create("Base de Datos - Estudio Socioeconómico");
        var file = DriveApp.getFileById(newSheet.getId());
        folder.addFile(file);
        // Remover de la raíz de Drive para evitar duplicado
        DriveApp.getRootFolder().removeFile(file);
        return newSheet;
      }
    } catch (e) {
      console.error("Fallo al buscar/crear hoja en Drive: " + e);
    }
    
    throw new Error("No se pudo obtener la hoja de cálculo. Por favor vincule este script a una hoja de cálculo o verifique los permisos de Drive.");
  },

  /**
   * Inicializa la estructura completa de hojas necesarias si no existen.
   */
  initializeSchema: function() {
    var ss = this.getSpreadsheet();
    
    // 1. Hoja de Clientes
    this.getOrCreateSheet(ss, CONFIG.SHEETS.CLIENTES, [
      'id', 'nombre', 'template_id', 'activo'
    ]);
    
    // 2. Hoja de Estudio Socioeconómico (Base de datos principal)
    // Las columnas se crearán dinámicamente con syncSchemaWithTemplates
    this.getOrCreateSheet(ss, CONFIG.SHEETS.ESTUDIOS, [
      'id_estudio', 'cliente_id', 'fecha_creacion', 'url_documento'
    ]);
    
    // 3. Hoja de Banco de Preguntas
    var bancoSheet = this.getOrCreateSheet(ss, CONFIG.SHEETS.BANCO, CONFIG.BANCO_PREGUNTAS_HEADERS);
    
    // Si el banco de preguntas está vacío (sólo encabezados), poblarlo con datos iniciales
    if (bancoSheet.getLastRow() <= 1) {
      this.populateBancoPreguntas(bancoSheet);
    }
  },
  
  /**
   * Obtiene una hoja por nombre. Si no existe, la crea con los encabezados dados.
   */
  getOrCreateSheet: function(ss, sheetName, headers) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (headers && headers.length > 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
        sheet.setFrozenRows(1);
      }
    }
    return sheet;
  },

  /**
   * Lee la configuración del Banco de Preguntas para un cliente específico.
   * Filtra las preguntas que tengan una 'X' en la columna del cliente.
   */
  getFormConfiguration: function(clienteId) {
    var ss = this.getSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.BANCO);
    if (!sheet) throw new Error("Hoja '" + CONFIG.SHEETS.BANCO + "' no encontrada.");
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { sections: [] }; // Vacío
    
    var headers = data[0];
    
    // Encontrar la columna del cliente
    var clienteColIdx = headers.indexOf(clienteId);
    if (clienteColIdx === -1) {
      // Si no existe la columna exacta, buscamos sin case o espacios, o retornamos un fallback
      for (var i = 0; i < headers.length; i++) {
        if (String(headers[i]).toLowerCase().trim() === String(clienteId).toLowerCase().trim()) {
          clienteColIdx = i;
          break;
        }
      }
      
      if (clienteColIdx === -1) {
        console.warn("Columna para cliente '" + clienteId + "' no encontrada en Banco Preguntas.");
        // Podríamos intentar usar la primera columna de cliente disponible (después de 'ayuda')
        var idxAyuda = headers.indexOf('ayuda');
        if (idxAyuda !== -1 && idxAyuda + 1 < headers.length) {
            clienteColIdx = idxAyuda + 1;
            console.warn("Usando configuración del cliente fallback: " + headers[clienteColIdx]);
        } else {
            return { sections: [] }; // No se encontró configuración
        }
      }
    }
    
    var config = { sections: [] };
    var sectionMap = {};
    
    // Procesar filas
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var marcaCliente = String(row[clienteColIdx]).toUpperCase().trim();
      
      // Si tiene 'X', incluir este campo
      if (marcaCliente === 'X') {
        var seccionNombre = row[headers.indexOf('seccion')];
        
        if (!seccionNombre) continue; // Ignorar si no tiene sección
        
        var field = {
          id: row[headers.indexOf('id')],
          seccion: seccionNombre,
          pregunta: row[headers.indexOf('pregunta')],
          tipo_input: row[headers.indexOf('tipo_input')],
          obligatorio: String(row[headers.indexOf('obligatorio')]).toUpperCase().trim() === 'S',
          placeholder: row[headers.indexOf('placeholder')],
          ayuda: row[headers.indexOf('ayuda')]
        };
        
        // Procesar opciones si existen
        var opcionesRaw = row[headers.indexOf('opciones')];
        if (opcionesRaw) {
          // Separar por comas y limpiar espacios, ignorar vacíos
          field.opciones = String(opcionesRaw).split(',').map(function(item) {
            return item.trim();
          }).filter(function(item) {
            return item.length > 0;
          });
        }
        
        // Inicializar sección si no existe
        if (!sectionMap[seccionNombre]) {
          var newSection = { name: seccionNombre, fields: [] };
          sectionMap[seccionNombre] = newSection;
          config.sections.push(newSection); // Mantener el orden original
        }
        
        sectionMap[seccionNombre].fields.push(field);
      }
    }
    
    return config;
  },
  
  /**
   * Obtiene la lista de clientes activos
   */
  getClientList: function() {
    var ss = this.getSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.CLIENTES);
    if (!sheet) return [];
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var headers = data[0];
    var idIdx = headers.indexOf('id');
    var nombreIdx = headers.indexOf('nombre');
    var templateIdx = headers.indexOf('template_id');
    var activoIdx = headers.indexOf('activo');
    
    var clientes = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var activoStr = String(row[activoIdx]).toUpperCase().trim();
      if (activoStr === 'TRUE' || activoStr === 'VERDADERO' || activoStr === 'SI' || activoStr === 'S') {
         clientes.push({
           id: row[idIdx],
           nombre: row[nombreIdx],
           template_id: row[templateIdx]
         });
      }
    }
    
    // Fallback si no hay clientes configurados, agregar el de la plantilla original
    if (clientes.length === 0) {
        clientes.push({
            id: 'Cliente_A',
            nombre: 'Reclutamiento Operaciones',
            template_id: CONFIG.TEMPLATES.default
        });
    }
    
    return clientes;
  },

  /**
   * Escribe o actualiza los datos del estudio en la base de datos (Spreadsheet)
   */
  writeStudyRow: function(studyId, clienteId, dataObj) {
    var ss = this.getSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.ESTUDIOS);
    
    // Obtener encabezados actuales
    var headers = this.getColumnHeaders(sheet);
    
    // Si la hoja está completamente vacía
    if (headers.length === 0) {
        headers = ['id_estudio', 'cliente_id', 'fecha_creacion', 'url_documento'];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Aplanar arrays/objetos complejos (Familiares, Empresas, Referencias) a un solo nivel JSON
    // ya que la plantilla espera campos individuales (ej. emp1_nombre)
    var flatData = this.flattenData(dataObj);
    
    // Encontrar si hay columnas faltantes y agregarlas
    var newHeaders = [];
    for (var key in flatData) {
      if (headers.indexOf(key) === -1 && key !== 'id_estudio' && key !== 'cliente_id' && key !== 'url_documento') {
        newHeaders.push(key);
      }
    }
    
    if (newHeaders.length > 0) {
      this.addMissingColumns(sheet, newHeaders);
      headers = this.getColumnHeaders(sheet); // Recargar encabezados
    }
    
    // Buscar si el estudio ya existe
    var rowIndex = -1;
    var idEstudioIdx = headers.indexOf('id_estudio');
    
    if (idEstudioIdx !== -1) {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][idEstudioIdx] === studyId) {
          rowIndex = i + 1; // +1 porque getValues es 0-indexed y los rangos de Google Sheets son 1-indexed
          break;
        }
      }
    }
    
    // Preparar fila para escribir
    var rowData = new Array(headers.length);
    for (var i = 0; i < headers.length; i++) {
      var headerName = headers[i];
      if (headerName === 'id_estudio') {
        rowData[i] = studyId;
      } else if (headerName === 'cliente_id') {
        rowData[i] = clienteId;
      } else if (headerName === 'fecha_creacion' && rowIndex === -1) {
        rowData[i] = new Date();
      } else if (headerName === 'url_documento') {
         // Mantener la existente si es update
         if (rowIndex !== -1) {
             rowData[i] = sheet.getRange(rowIndex, i + 1).getValue();
         } else {
             rowData[i] = '';
         }
      } else {
        // Asignar el valor del formulario
        if (flatData[headerName] !== undefined && flatData[headerName] !== null) {
            rowData[i] = flatData[headerName];
        } else {
            rowData[i] = ''; // Limpiar celdas vacías
        }
      }
    }
    
    // Escribir en la hoja
    if (rowIndex !== -1) {
      // Actualizar fila existente
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Agregar nueva fila
      sheet.appendRow(rowData);
      rowIndex = sheet.getLastRow();
    }
    
    return { success: true, rowIndex: rowIndex };
  },
  
  /**
   * Actualiza el URL del documento de un estudio específico
   */
  updateStudyDocumentUrl: function(studyId, url) {
    var ss = this.getSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.ESTUDIOS);
    var headers = this.getColumnHeaders(sheet);
    var idEstudioIdx = headers.indexOf('id_estudio');
    var urlIdx = headers.indexOf('url_documento');
    
    if (idEstudioIdx === -1 || urlIdx === -1) return false;
    
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][idEstudioIdx] === studyId) {
        sheet.getRange(i + 1, urlIdx + 1).setValue(url);
        return true;
      }
    }
    return false;
  },
  
  /**
   * Obtiene los encabezados de una hoja
   */
  getColumnHeaders: function(sheet) {
    if (sheet.getLastRow() === 0) return [];
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  },
  
  /**
   * Agrega nuevas columnas al final de la hoja
   */
  addMissingColumns: function(sheet, newHeaders) {
    var lastCol = sheet.getLastColumn();
    // Si la hoja no tiene columnas, empezamos desde 1, si no desde la siguiente a la última
    var startCol = lastCol === 0 ? 1 : lastCol + 1;
    
    // Asegurar que 'url_documento' siempre esté al final si es posible, o simplemente añadir las nuevas antes
    // Por simplicidad, agregamos al final
    sheet.getRange(1, startCol, 1, newHeaders.length).setValues([newHeaders]);
    sheet.getRange(1, startCol, 1, newHeaders.length).setFontWeight("bold");
  },

  /**
   * Aplana el objeto de datos complejos (arrays) a propiedades simples
   * Útil si el frontend envía los familiares como un array, pero el backend los mapea a campos simples.
   * Sin embargo, con el diseño de plantillas usando {{marcador}}, probablemente los datos ya vengan aplanados
   * o necesitemos procesarlos en DocsService. Esta función es un passthrough con limpieza por ahora.
   */
  flattenData: function(dataObj) {
      var result = {};
      for (var key in dataObj) {
          // Si el valor es un array (ej. familiares) o un objeto complejo, lo pasamos tal cual, 
          // DocsService se encargará de él. Para Sheets, guardamos la versión stringificada como JSON
          // si no hay una columna específica
          if (typeof dataObj[key] === 'object' && dataObj[key] !== null && !(dataObj[key] instanceof Date)) {
              result[key + '_json'] = JSON.stringify(dataObj[key]); // Para debug o backup
              // También conservamos la key original por si DocsService la necesita directamente
              result[key] = dataObj[key]; 
          } else {
              result[key] = dataObj[key];
          }
      }
      return result;
  },

  /**
   * Poblar la hoja 'Banco Preguntas' con los datos iniciales
   */
  populateBancoPreguntas: function(sheet) {
      if (typeof BANCO_PREGUNTAS_INITIAL !== 'undefined' && BANCO_PREGUNTAS_INITIAL.length > 0) {
          var rows = [];
          for (var i = 0; i < BANCO_PREGUNTAS_INITIAL.length; i++) {
              var q = BANCO_PREGUNTAS_INITIAL[i];
              // q es un array: [id, seccion, pregunta, tipo_input, obligatorio, placeholder, opciones, ayuda]
              // Agregamos una 'X' al final para el cliente A (Reclutamiento Operaciones) marcado por defecto
              rows.push([
                  q[0], // id
                  q[1], // seccion
                  q[2], // pregunta
                  q[3], // tipo_input
                  q[4], // obligatorio
                  q[5], // placeholder
                  q[6], // opciones
                  q[7], // ayuda
                  'X'   // Cliente_A
              ]);
          }
          if (rows.length > 0) {
              // Asegurar que la columna del cliente A existe en encabezados
              var headers = this.getColumnHeaders(sheet);
              if (headers.indexOf('Cliente_A') === -1) {
                  sheet.getRange(1, headers.length + 1).setValue('Cliente_A').setFontWeight("bold");
              }
              sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
          }
      }
  }
};
