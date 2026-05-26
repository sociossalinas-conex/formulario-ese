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
   * Busca en Drive el cliente y el candidato, encuentra un Google Doc en la carpeta del candidato
   * y vuelca los datos de captura sobre el mismo reemplazando marcadores.
   */
  fillExistingDocInCandidateFolder: function(clientName, candidateName, data) {
    try {
      var rootFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      
      // 1. Buscar carpeta del cliente (Búsqueda por nombre e ignore-case)
      var clientFolders = rootFolder.searchFolders("title = '" + clientName.replace(/'/g, "\\'") + "' and trashed = false");
      var clientFolder;
      if (clientFolders.hasNext()) {
        clientFolder = clientFolders.next();
      } else {
        var folders = rootFolder.getFolders();
        while (folders.hasNext()) {
          var f = folders.next();
          if (f.getName().toLowerCase().trim() === clientName.toLowerCase().trim()) {
            clientFolder = f;
            break;
          }
        }
      }
      
      if (!clientFolder) {
        throw new Error("No se encontró la carpeta del cliente '" + clientName + "' en la carpeta raíz.");
      }
      
      // 2. Buscar carpeta del candidato (Búsqueda por nombre e ignore-case)
      var candidateFolders = clientFolder.searchFolders("title = '" + candidateName.replace(/'/g, "\\'") + "' and trashed = false");
      var candidateFolder;
      if (candidateFolders.hasNext()) {
        candidateFolder = candidateFolders.next();
      } else {
        var folders = clientFolder.getFolders();
        while (folders.hasNext()) {
          var f = folders.next();
          if (f.getName().toLowerCase().trim() === candidateName.toLowerCase().trim()) {
            candidateFolder = f;
            break;
          }
        }
      }
      
      if (!candidateFolder) {
        throw new Error("No se encontró la carpeta del candidato '" + candidateName + "' dentro de la carpeta del cliente '" + clientName + "'.");
      }
      
      // 3. Buscar el documento de Google Docs en la carpeta del candidato
      var docFiles = candidateFolder.getFilesByType(MimeType.GOOGLE_DOCS);
      var docFile;
      if (docFiles.hasNext()) {
        docFile = docFiles.next();
      } else {
        var files = candidateFolder.getFiles();
        while (files.hasNext()) {
          var file = files.next();
          if (file.getMimeType() === MimeType.GOOGLE_DOCS) {
            docFile = file;
            break;
          }
        }
      }
      
      if (!docFile) {
        throw new Error("No se encontró ningún documento editable de tipo Google Docs en la carpeta del candidato '" + candidateName + "'.");
      }
      
      var doc = DocumentApp.openById(docFile.getId());
      
      // 4. Reemplazar marcadores {{...}} con los datos de la captura
      this.replaceAllMarkers(doc, data);
      doc.saveAndClose();
      
      return { success: true, docUrl: docFile.getUrl(), docName: docFile.getName() };
      
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
   * Maneja el mapeo de arreglos (familiares) a marcadores si la plantilla los tiene, 
   * o inyecta dinámicamente si no están definidos explícitamente.
   */
  processSpecialSections: function(body, dataMap) {
      // Como la plantilla tiene marcadores únicos para algunas cosas y la UI permite crear "N" familiares,
      // esto maneja la expansión dinámica. 
      // Por simplicidad, este boilerplate asume que los primeros se mapean directo y el resto ignora 
      // o que el motor UI genera las claves numeradas internamente.
  }
};
