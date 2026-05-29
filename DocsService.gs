/**
 * DocsService.gs
 * Servicio para generación de documentos y manejo de imágenes en Google Drive
 */

var DocsService = {
  
  /**
   * Genera el documento final reemplazando los marcadores {{...}}
   */
  generateDocument: function(studyId, data, clienteId) {
    try {
      var ss = SheetsService.getSpreadsheet();
      var clientSheet = ss.getSheetByName(CONFIG.SHEETS.CLIENTES);
      
      // Obtener templateId del cliente
      var templateId = CONFIG.TEMPLATES['default'];
      if (clientSheet) {
        var cData = clientSheet.getDataRange().getValues();
        var idIdx = cData[0].indexOf('id');
        var tmplIdx = cData[0].indexOf('template_id');
        
        for (var i = 1; i < cData.length; i++) {
          if (cData[i][idIdx] === clienteId && cData[i][tmplIdx]) {
            templateId = cData[i][tmplIdx];
            break;
          }
        }
      }
      
      // Obtener carpetas (Cliente / Candidato)
      var clientName = this.getClientName(clienteId) || 'Cliente Desconocido';
      var candidateName = data['nombre_completo'] || studyId;
      var candidateFolder = this.getOrCreateCandidateFolder(clientName, candidateName);
      
      // Hacer copia de la plantilla
      var templateDoc = DriveApp.getFileById(templateId);
      var newDocName = 'Estudio_' + candidateName.replace(/\s+/g, '_') + '_' + studyId;
      var newDocFile = templateDoc.makeCopy(newDocName, candidateFolder);
      var doc = DocumentApp.openById(newDocFile.getId());
      
      // Reemplazar marcadores
      this.replaceAllMarkers(doc, data);
      
      doc.saveAndClose();
      
      // Obtener URL final y guardar en Sheets
      var docUrl = newDocFile.getUrl();
      SheetsService.updateStudyDocumentUrl(studyId, docUrl);
      
      return { success: true }; // IMPORTANTE: No retornar el URL al frontend
      
    } catch(e) {
      console.error("Error generando documento: " + e);
      return { success: false, error: e.toString() };
    }
  },
  
  /**
   * Reemplaza todos los marcadores {{clave}} por sus valores en el documento
   */
  replaceAllMarkers: function(doc, dataMap) {
    var body = doc.getBody();
    
    // Preparar mapa plano
    var flatMap = SheetsService.flattenData(dataMap);
    
    // Procesar listas repetitivas (familiares, ingresos)
    // Esto es un abordaje dinámico: Si el formulario devolvió arrays serializados, 
    // intentamos buscar si la plantilla esperaba campos específicos o si inyectamos una tabla
    this.processSpecialSections(body, dataMap);
    
    // Reemplazo estándar de texto
    for (var key in flatMap) {
      var marker = '{{' + key + '}}';
      var val = flatMap[key];
      
      // Formateo de fechas y booleanos
      if (val === true) val = 'Sí';
      if (val === false) val = 'No';
      if (val instanceof Date) {
        val = ('0' + val.getDate()).slice(-2) + '/' + ('0' + (val.getMonth()+1)).slice(-2) + '/' + val.getFullYear();
      }
      if (val === undefined || val === null) val = '';
      
      body.replaceText(marker, String(val));
    }
    
    // Limpiar marcadores sobrantes que no tuvieron dato
    body.replaceText('{{[^{}]+}}', '');
  },

  /**
   * Sube una foto en Base64 a la carpeta del candidato
   */
  uploadPhoto: function(base64Data, fileName, clientName, candidateName) {
    try {
      if (!base64Data) throw new Error("Datos de imagen vacíos");
      
      var folder = this.getOrCreateCandidateFolder(clientName, candidateName);
      
      // Limpiar prefijo base64 (ej: data:image/jpeg;base64,...)
      var dataPart = base64Data;
      if (base64Data.indexOf(',') !== -1) {
        dataPart = base64Data.split(',')[1];
      }
      
      var blob = Utilities.newBlob(Utilities.base64Decode(dataPart), 'image/jpeg', fileName + '.jpg');
      var file = folder.createFile(blob);
      
      return { success: true, fileId: file.getId() }; // No retornar URL por privacidad
    } catch (e) {
      console.error("Error subiendo foto: " + e);
      return { success: false, error: e.toString() };
    }
  },

  /**
   * Obtiene o crea la estructura de carpetas Drive:
   * ROOT_FOLDER (CONFIG.DRIVE_FOLDER_ID) -> Cliente -> Candidato
   */
  getOrCreateCandidateFolder: function(clientName, candidateName) {
    var rootFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    
    // Buscar carpeta del cliente
    var clientFolders = rootFolder.searchFolders("title = '" + clientName.replace(/'/g, "\\'") + "'");
    var clientFolder;
    if (clientFolders.hasNext()) {
      clientFolder = clientFolders.next();
    } else {
      clientFolder = rootFolder.createFolder(clientName);
    }
    
    // Buscar carpeta del candidato
    var candidateFolders = clientFolder.searchFolders("title = '" + candidateName.replace(/'/g, "\\'") + "'");
    if (candidateFolders.hasNext()) {
      return candidateFolders.next(); // Ya existe, posiblemente editando estudio
    } else {
      return clientFolder.createFolder(candidateName);
    }
  },

  /**
   * Helper de normalización de cadenas de texto para búsquedas tolerantes a acentos, mayúsculas, eñes y diéresis.
   */
  normalizeStr: function(str) {
    if (!str) return '';
    return String(str).toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  /**
   * Busca en Drive el cliente y el candidato de forma tolerante a acentos, eñes y espacios.
   * Si las carpetas no existen, las crea automáticamente.
   * Si no hay un documento Google Docs en la carpeta del candidato, realiza una copia
   * de la plantilla base automáticamente y vuelca los datos de captura.
   */
  fillExistingDocInCandidateFolder: function(clientName, candidateName, data) {
    try {
      var rootFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      
      // 1. Buscar carpeta del cliente de forma tolerante a acentos y eñes
      var clientFolder = null;
      var normalizedClientSearch = this.normalizeStr(clientName);
      
      // Intentar primero búsqueda rápida
      var clientFolders = rootFolder.searchFolders("title = '" + clientName.replace(/'/g, "\\'") + "' and trashed = false");
      if (clientFolders.hasNext()) {
        clientFolder = clientFolders.next();
      } else {
        // Búsqueda exhaustiva por normalización de texto
        var folders = rootFolder.getFolders();
        while (folders.hasNext()) {
          var f = folders.next();
          if (this.normalizeStr(f.getName()) === normalizedClientSearch) {
            clientFolder = f;
            break;
          }
        }
      }
      
      // Crear carpeta del cliente si no existe (robusto)
      if (!clientFolder) {
        console.warn("Creando carpeta del cliente faltante: " + clientName);
        clientFolder = rootFolder.createFolder(clientName);
      }
      
      // 2. Buscar carpeta del candidato de forma tolerante a acentos y eñes
      var candidateFolder = null;
      var normalizedCandidateSearch = this.normalizeStr(candidateName);
      
      var candidateFolders = clientFolder.searchFolders("title = '" + candidateName.replace(/'/g, "\\'") + "' and trashed = false");
      if (candidateFolders.hasNext()) {
        candidateFolder = candidateFolders.next();
      } else {
        // Búsqueda exhaustiva
        var folders = clientFolder.getFolders();
        while (folders.hasNext()) {
          var f = folders.next();
          if (this.normalizeStr(f.getName()) === normalizedCandidateSearch) {
            candidateFolder = f;
            break;
          }
        }
      }
      
      // Crear carpeta del candidato si no existe (robusto)
      if (!candidateFolder) {
        console.warn("Creando carpeta del candidato faltante: " + candidateName);
        candidateFolder = clientFolder.createFolder(candidateName);
      }
      
      // 3. Buscar el documento de Google Docs en la carpeta del candidato
      var docFiles = candidateFolder.getFilesByType(MimeType.GOOGLE_DOCS);
      var docFile = null;
      if (docFiles.hasNext()) {
        docFile = docFiles.next();
      } else {
        // Buscar cualquier documento editable
        var files = candidateFolder.getFiles();
        while (files.hasNext()) {
          var file = files.next();
          if (file.getMimeType() === MimeType.GOOGLE_DOCS) {
            docFile = file;
            break;
          }
        }
      }
      
      // FALLBACK AUTOMÁTICO EFICIENTE: Si no hay ningún documento editable, copiar la plantilla base!
      var createdNew = false;
      if (!docFile) {
        console.warn("No se encontró ningún documento editable. Copiando plantilla base por defecto...");
        var templateId = CONFIG.TEMPLATES['default'];
        
        // Intentar obtener la plantilla específica del cliente si está configurada
        var ss = SheetsService.getSpreadsheet();
        SheetsService.initializeSchema();
        var clientSheet = ss.getSheetByName(CONFIG.SHEETS.CLIENTES);
        if (clientSheet) {
          var cData = clientSheet.getDataRange().getValues();
          var idIdx = cData[0].indexOf('id');
          var tmplIdx = cData[0].indexOf('template_id');
          
          for (var i = 1; i < cData.length; i++) {
            if (this.normalizeStr(cData[i][idIdx]) === normalizedClientSearch && cData[i][tmplIdx]) {
              templateId = cData[i][tmplIdx];
              break;
            }
          }
        }
        
        var templateDoc = DriveApp.getFileById(templateId);
        var newDocName = 'Estudio_' + candidateName.replace(/\s+/g, '_');
        docFile = templateDoc.makeCopy(newDocName, candidateFolder);
        createdNew = true;
      }
      
      var doc = DocumentApp.openById(docFile.getId());
      
      // 4. Reemplazar marcadores {{...}} con los datos de la captura
      this.replaceAllMarkers(doc, data);
      doc.saveAndClose();
      
      return { 
        success: true, 
        docUrl: docFile.getUrl(), 
        docName: docFile.getName(),
        createdNew: createdNew 
      };
      
    } catch (e) {
      console.error("Error al volcar datos en documento existente: " + e);
      return { success: false, error: e.toString() };
    }
  },
  
  getClientName: function(clienteId) {
    var ss = SheetsService.getSpreadsheet();
    var clientSheet = ss.getSheetByName(CONFIG.SHEETS.CLIENTES);
    if (!clientSheet) return clienteId;
    
    var data = clientSheet.getDataRange().getValues();
    var idIdx = data[0].indexOf('id');
    var nomIdx = data[0].indexOf('nombre');
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][idIdx] === clienteId) return data[i][nomIdx];
    }
    return clienteId;
  },

  /**
   * Maneja la expansión dinámica de filas de familiares (hermanos, hijos) en la tabla
   * DATOS FAMILIARES del documento. Elimina filas vacías o con marcadores sin dato y
   * sólo inserta las filas que tienen información real de la captura.
   */
  processSpecialSections: function(body, dataMap) {
    try {
      // ── 1. Recopilar hermanos e hijos capturados ──────────────────────────
      var siblings = [];
      var children = [];

      for (var si = 1; si <= 10; si++) {
        var sName = dataMap['hermano_' + si + '_nombre'] || dataMap['hermano_' + si + '_name'] || '';
        if (!sName.trim()) break;
        siblings.push({
          nombre:      sName.trim(),
          parentesco:  dataMap['hermano_' + si + '_parentesco'] || '',
          edad:        dataMap['hermano_' + si + '_edad']       || '',
          escolaridad: dataMap['hermano_' + si + '_escolaridad']|| '',
          ocupacion:   dataMap['hermano_' + si + '_ocupacion']  || ''
        });
      }

      for (var hi = 1; hi <= 10; hi++) {
        var hName = dataMap['hijo_' + hi + '_nombre'] || dataMap['hijo_' + hi + '_name'] || '';
        if (!hName.trim()) break;
        children.push({
          nombre:      hName.trim(),
          parentesco:  dataMap['hijo_' + hi + '_parentesco'] || '',
          edad:        dataMap['hijo_' + hi + '_edad']       || '',
          escolaridad: dataMap['hijo_' + hi + '_escolaridad']|| '',
          ocupacion:   dataMap['hijo_' + hi + '_ocupacion']  || ''
        });
      }

      // Si no se capturó ningún familiar dinámico, no hacer nada
      if (siblings.length === 0 && children.length === 0) return;

      // ── 2. Encontrar la tabla de DATOS FAMILIARES ─────────────────────────
      var tables = body.getTables();
      var familyTable = null;

      for (var ti = 0; ti < tables.length; ti++) {
        var tbl = tables[ti];
        var tblText = tbl.getText().toLowerCase();
        if (tblText.indexOf('parentesco') !== -1 && tblText.indexOf('nombre') !== -1) {
          familyTable = tbl;
          break;
        }
      }

      if (!familyTable) return; // La plantilla no tiene tabla familiar — nada que hacer

      // ── 3. Identificar y eliminar filas de hermanos y hijos de plantilla ──
      // Marcadores que indican fila de hermano/hijo sin datos reales
      var SIBLING_MARKERS = ['{{hermano}}', '{{hermano_nombre}}', '{{hermano_1}}'];
      var CHILD_MARKERS   = ['{{hijo}}',    '{{hijo_nombre}}',    '{{hijo_1}}'];

      var rowsToDelete = [];
      var headerRowIndex = -1;

      for (var ri = 0; ri < familyTable.getNumRows(); ri++) {
        var row = familyTable.getRow(ri);
        var rowText = row.getText();

        // Guardar índice de la fila de encabezado (PARENTESCO | NOMBRE | ...)
        if (rowText.toLowerCase().indexOf('parentesco') !== -1) {
          headerRowIndex = ri;
        }

        // Filas con marcadores no reemplazados de hermano u hijo
        var hasSiblingMarker = SIBLING_MARKERS.some(function(m) { return rowText.indexOf(m) !== -1; });
        var hasChildMarker   = CHILD_MARKERS.some(function(m)   { return rowText.indexOf(m) !== -1; });

        if (hasSiblingMarker || hasChildMarker) {
          rowsToDelete.push(ri);
        }
      }

      // Eliminar en orden descendente para no alterar índices
      rowsToDelete.reverse().forEach(function(idx) {
        familyTable.removeRow(idx);
      });

      // ── 4. Insertar filas de hermanos al final del bloque familiar ─────────
      var insertAt = familyTable.getNumRows(); // Agregar al final

      siblings.forEach(function(s) {
        // Determinar parentesco real basado en el nombre si no se capturó
        var parentesco = s.parentesco;
        if (!parentesco) {
          parentesco = 'Hermano/a';
        }
        var newRow = familyTable.insertTableRow(insertAt++);
        newRow.appendTableCell().setText(parentesco);
        newRow.appendTableCell().setText(s.nombre);
        newRow.appendTableCell().setText(s.edad);
        newRow.appendTableCell().setText(s.escolaridad);
        newRow.appendTableCell().setText(s.ocupacion);
      });

      // ── 5. Insertar filas de hijos ─────────────────────────────────────────
      children.forEach(function(h) {
        var parentesco = h.parentesco;
        if (!parentesco) {
          parentesco = 'Hijo/a';
        }
        var newRow = familyTable.insertTableRow(insertAt++);
        newRow.appendTableCell().setText(parentesco);
        newRow.appendTableCell().setText(h.nombre);
        newRow.appendTableCell().setText(h.edad);
        newRow.appendTableCell().setText(h.escolaridad);
        newRow.appendTableCell().setText(h.ocupacion);
      });

      // ── 6. Eliminar filas que quedaron completamente vacías ─────────────────
      var numRows = familyTable.getNumRows();
      for (var rr = numRows - 1; rr > headerRowIndex; rr--) {
        var rRow = familyTable.getRow(rr);
        var allEmpty = true;
        for (var cc = 0; cc < rRow.getNumCells(); cc++) {
          if (rRow.getCell(cc).getText().trim() !== '') {
            allEmpty = false;
            break;
          }
        }
        if (allEmpty) {
          familyTable.removeRow(rr);
        }
      }

    } catch(e) {
      console.warn('processSpecialSections: ' + e);
      // No detener el flujo si falla esta parte — el resto del documento sigue procesándose
    }
  }
};
