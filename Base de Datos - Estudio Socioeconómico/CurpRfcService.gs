/**
 * CurpRfcService.gs
 * Servicio para el cálculo y validación de CURP y RFC mexicanos
 */

var CurpRfcService = {
  
  /**
   * Calcula el CURP sugerido basándose en los datos proporcionados
   * @param {string} nombre
   * @param {string} apPaterno
   * @param {string} apMaterno
   * @param {string} fechaNac (YYYY-MM-DD o formato Date)
   * @param {string} sexo (M/F o Masculino/Femenino)
   * @param {string} estado (Nombre del estado o código de 2 letras)
   */
  calculateCURP: function(nombre, apPaterno, apMaterno, fechaNac, sexo, estado) {
    if (!nombre || !apPaterno || !fechaNac || !sexo || !estado) return '';
    
    try {
      nombre = this.cleanString(nombre);
      apPaterno = this.cleanString(apPaterno);
      apMaterno = apMaterno ? this.cleanString(apMaterno) : '';
      
      // Regla nombres compuestos (José, María)
      var nombresList = nombre.split(' ');
      if (nombresList.length > 1 && (nombresList[0] === 'JOSE' || nombresList[0] === 'MARIA' || nombresList[0] === 'J' || nombresList[0] === 'MA')) {
        nombre = nombresList[1];
      } else {
        nombre = nombresList[0];
      }

      // Regla de artículos en apellidos
      apPaterno = this.removeArticles(apPaterno);
      apMaterno = this.removeArticles(apMaterno);

      var curp = '';
      
      // 1. Primera letra y vocal del apellido paterno
      curp += apPaterno.charAt(0);
      curp += this.getVocalInterna(apPaterno);
      
      // 2. Primera letra del apellido materno (o X si no tiene)
      curp += apMaterno ? apMaterno.charAt(0) : 'X';
      
      // 3. Primera letra del nombre
      curp += nombre.charAt(0);
      
      // Filtro de palabras altisonantes
      curp = this.filterBadWords(curp);
      
      // 4. Fecha de nacimiento (YYMMDD)
      var d = new Date(fechaNac);
      // Ajuste por timezone que puede causar que la fecha se atrase un día
      var yy = d.getUTCFullYear().toString().substring(2, 4);
      var mm = ('0' + (d.getUTCMonth() + 1)).slice(-2);
      var dd = ('0' + d.getUTCDate()).slice(-2);
      curp += yy + mm + dd;
      
      // 5. Sexo (H o M)
      var s = String(sexo).toUpperCase().charAt(0);
      if (s === 'M' && String(sexo).toUpperCase() !== 'MUJER' && String(sexo).toUpperCase() !== 'MASCULINO') {
         // Precaución con la letra M inicial
      }
      var sexLetter = (s === 'F' || s === 'M' && String(sexo).toUpperCase() === 'MUJER') ? 'M' : 'H';
      curp += sexLetter;
      
      // 6. Entidad Federativa (2 letras)
      curp += this.getStateCode(estado);
      
      // 7. Consonantes internas
      curp += this.getConsonanteInterna(apPaterno);
      curp += apMaterno ? this.getConsonanteInterna(apMaterno) : 'X';
      curp += this.getConsonanteInterna(nombre);
      
      // 8. Homoclave (letra para >= 2000, dígito para < 2000)
      var year = d.getUTCFullYear();
      curp += (year >= 2000) ? 'A' : '0';
      
      // 9. Dígito verificador sugerido (suele ser 1, pero se requiere cálculo con RENAPO para exactitud)
      curp += '1'; 
      
      return curp.toUpperCase();
    } catch(e) {
      console.error("Error calculando CURP: " + e);
      return '';
    }
  },

  /**
   * Calcula el RFC sugerido
   */
  calculateRFC: function(nombre, apPaterno, apMaterno, fechaNac) {
     if (!nombre || !apPaterno || !fechaNac) return '';
    
     try {
         // La raíz del RFC son los primeros 4 caracteres (o 3) que coinciden con el inicio del CURP
         // + la fecha de nacimiento.
         var baseCurp = this.calculateCURP(nombre, apPaterno, apMaterno, fechaNac, 'H', 'DF').substring(0, 10);
         
         // Homoclave genérica sugerida (el SAT asigna la real)
         return baseCurp + 'XXX';
     } catch(e) {
         return '';
     }
  },

  /**
   * Sugiere CURP, RFC y Edad a partir de los datos combinados
   * Función expuesta a google.script.run
   */
  suggestCurpRfc: function(datos) {
    // Expected datos: {nombre, apPaterno, apMaterno, fechaNac, sexo, estado}
    // Como el formulario puede tener solo "nombre_completo", intentamos parsearlo
    var n = datos.nombre || '';
    var ap = datos.apPaterno || '';
    var am = datos.apMaterno || '';
    
    if (datos.nombre_completo && !datos.nombre) {
        var partes = datos.nombre_completo.trim().split(' ');
        if (partes.length >= 3) {
            n = partes[0] + (partes.length > 3 ? ' ' + partes[1] : '');
            ap = partes[partes.length - 2];
            am = partes[partes.length - 1];
        } else if (partes.length === 2) {
            n = partes[0];
            ap = partes[1];
        } else {
            n = partes[0];
        }
    }
    
    var curp = this.calculateCURP(n, ap, am, datos.fecha_nacimiento, datos.sexo, datos.lugar_nacimiento);
    var rfc = this.calculateRFC(n, ap, am, datos.fecha_nacimiento);
    var edad = this.calculateAge(datos.fecha_nacimiento);
    
    return {
        curp: curp,
        rfc: rfc,
        edad: edad
    };
  },

  calculateAge: function(fechaNacStr) {
      if (!fechaNacStr) return '';
      var birthday = new Date(fechaNacStr);
      var today = new Date();
      var age = today.getFullYear() - birthday.getFullYear();
      var m = today.getMonth() - birthday.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
          age--;
      }
      return age;
  },

  // --- Helpers ---

  cleanString: function(str) {
      if (!str) return '';
      return str.toUpperCase()
                .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Ú/g, 'U')
                .replace(/Ü/g, 'U')
                //.replace(/Ñ/g, 'X') // Ñ se considera X en algunos sistemas antiguos, pero actualmente es válida en algunos contextos o convertida. La dejaremos como Ñ y manejaremos luego.
                .trim();
  },

  removeArticles: function(str) {
      var prefixes = ['DA ', 'DAS ', 'DE ', 'DEL ', 'DER ', 'DI ', 'DIE ', 'DD ', 'EL ', 'LA ', 'LOS ', 'LAS ', 'LE ', 'LES ', 'MAC ', 'MC ', 'VAN ', 'VON ', 'Y '];
      var words = str.split(' ');
      var result = [];
      for (var i = 0; i < words.length; i++) {
          var isPrefix = false;
          for (var j = 0; j < prefixes.length; j++) {
              if (words[i] + ' ' === prefixes[j]) {
                  isPrefix = true;
                  break;
              }
          }
          if (!isPrefix) result.push(words[i]);
      }
      return result.join(' ');
  },

  getVocalInterna: function(str) {
      var m = str.substring(1).match(/[AEIOU]/);
      return m ? m[0] : 'X';
  },

  getConsonanteInterna: function(str) {
      var m = str.substring(1).match(/[^AEIOU\s]/);
      return m ? m[0] : 'X';
  },

  getStateCode: function(estadoNombre) {
      if (!estadoNombre) return 'NE'; // Nacido Extranjero
      var state = String(estadoNombre).toUpperCase().trim();
      
      // Diccionario si ya viene en código (evitar doble codificación)
      if (state.length === 2) return state;

      var states = {
          "AGUASCALIENTES": "AS",
          "BAJA CALIFORNIA": "BC",
          "BAJA CALIFORNIA SUR": "BS",
          "CAMPECHE": "CC",
          "COAHUILA": "CL",
          "COLIMA": "CM",
          "CHIAPAS": "CS",
          "CHIHUAHUA": "CH",
          "CIUDAD DE MEXICO": "DF",
          "CIUDAD DE MÉXICO": "DF",
          "DISTRITO FEDERAL": "DF",
          "DURANGO": "DG",
          "GUANAJUATO": "GT",
          "GUERRERO": "GR",
          "HIDALGO": "HG",
          "JALISCO": "JC",
          "MEXICO": "MC",
          "ESTADO DE MEXICO": "MC",
          "ESTADO DE MÉXICO": "MC",
          "MICHOACAN": "MN",
          "MICHOACÁN": "MN",
          "MORELOS": "MS",
          "NAYARIT": "NT",
          "NUEVO LEON": "NL",
          "NUEVO LEÓN": "NL",
          "OAXACA": "OC",
          "PUEBLA": "PL",
          "QUERETARO": "QT",
          "QUERÉTARO": "QT",
          "QUINTANA ROO": "QR",
          "SAN LUIS POTOSI": "SP",
          "SAN LUIS POTOSÍ": "SP",
          "SINALOA": "SL",
          "SONORA": "SR",
          "TABASCO": "TC",
          "TAMAULIPAS": "TS",
          "TLAXCALA": "TL",
          "VERACRUZ": "VZ",
          "YUCATAN": "YN",
          "YUCATÁN": "YN",
          "ZACATECAS": "ZS",
          "EXTRANJERO": "NE"
      };

      return states[state] || 'NE';
  },

  filterBadWords: function(word4) {
      var badWords = [
          "BACA", "BAKA", "BUEI", "BUEY", "CACA", "CACO", "CAGA", "CAGO", "CAKA", "CAKO",
          "COGE", "COGI", "COJA", "COJE", "COJI", "COJO", "COLA", "CULO", "FALO", "FETO",
          "GETA", "GUEI", "GUEY", "JETA", "JOTO", "KACA", "KACO", "KAGA", "KAGO", "KAKA",
          "KAKO", "KOGE", "KOGI", "KOJA", "KOJE", "KOJI", "KOJO", "KOLA", "KULO", "LILO",
          "LOCA", "LOCO", "LOKA", "LOKO", "MAME", "MAMI", "MAMO", "MEAR", "MEAS", "MEON",
          "MIAR", "MION", "MOCO", "MOKO", "MULA", "MULO", "NACA", "NACO", "PEDA", "PEDO",
          "PENE", "PIPI", "PITO", "POPO", "PUTA", "PUTO", "QULO", "RATA", "ROBA", "ROBE",
          "ROBO", "RUIN", "SENO", "TETA", "VACA", "VAGA", "VAGO", "VAKA", "VUEI", "VUEY",
          "WUEI", "WUEY"
      ];
      if (badWords.indexOf(word4) !== -1) {
          return word4.charAt(0) + 'X' + word4.substring(2);
      }
      return word4;
  }
};
