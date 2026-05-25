# Guía de Restauración e Inicialización Rápida - Versión 1.0.00

Esta carpeta contiene un **snapshot completo y 100% portable** del Ecosistema de Automatización de Estudios Socioeconómicos en su versión **v1.0.00**. 

El objetivo es que cualquier usuario pueda copiar el contenido de esta carpeta (`historial_de_versiones/v1.0.00/`) a la raíz de su espacio de trabajo y tener el sistema operativo en segundos.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:
- **Node.js** (Versión 16.x o superior): Puedes descargarlo de [nodejs.org](https://nodejs.org/).

---

## 🚀 Pasos para la Inicialización/Restauración

Sigue estos 3 sencillos pasos para dejar el sistema listo en cualquier computadora nueva:

### Paso 1: Copiar a la Raíz (Si estás restaurando)
Si deseas restaurar esta versión como tu espacio de trabajo principal:
1. Copia todos los archivos y carpetas dentro de `v1.0.00/` y pégalos en la raíz de tu proyecto principal.

### Paso 2: Ejecutar el Setup Automatizado
1. Haz doble clic sobre el archivo `setup.bat` en la raíz.
2. Este script se encargará automáticamente de:
   - Verificar la presencia de Node.js.
   - Crear las carpetas del proyecto (`config/`, `assets/`, `web-app/`, etc.).
   - Descargar e instalar todas las dependencias necesarias de Node.js (`npm install`).
   - Crear tu archivo de configuración de variables de entorno `admin-script/.env` a partir de la plantilla.

### Paso 3: Colocar Credenciales y Configurar `.env`
1. **Google Drive API (Service Account)**:
   - Obtén tu archivo de credenciales de Cuenta de Servicio en formato JSON desde la consola de Google Cloud Developer.
   - Renómbralo como `credentials.json`.
   - Colócalo dentro de la carpeta `config/` (ubicada en la raíz del proyecto).
2. **Supabase**:
   - Abre el archivo `admin-script/.env` con cualquier editor de texto.
   - Ajusta las credenciales de Supabase con tus datos:
     ```env
     SUPABASE_URL=https://mcdjysjrezxmghmvannh.supabase.co
     SUPABASE_KEY=sb_publishable_2zg1_mv94Gvpl8b3lZOvMQ_xRlrgrQS
     DRIVE_FOLDER_ID=1M6naHKDM1HLCQvEbyq4tysiskXHD7uIW
     ```

---

## 🔄 Ejecución de la Sincronización

Una vez configurado todo:
- Ve a la carpeta `scripts_ejecucion/` y haz doble clic sobre el archivo **`ejecutar_sincronizacion.bat`**.
- El backend procesará automáticamente tus documentos de Google Docs desde la carpeta de Drive indicada, extraerá y normalizará los campos de texto inteligente y los guardará en tu base de datos de Supabase.

---

## 📂 Estructura de la Versión

```text
├── admin-script/                  # Backend Node.js
│   ├── sync.js                    # Script de sincronización inteligente
│   ├── package.json               # Dependencias del proyecto
│   └── .env.example               # Plantilla de variables de entorno
├── config/                        # Carpeta reservada para tu credentials.json
├── assets/                        # Carpeta reservada para recursos visuales (.webp)
├── scripts_ejecucion/             # Accesos rápidos de consola
│   └── ejecutar_sincronizacion.bat# Doble clic para sincronizar
├── setup.bat                      # Instalador inicial todo en uno
└── README_RESTAURAR.md            # Esta guía de restauración
```

---

## 💡 Soporte de Normalización de Negocio (Backend)

Esta versión incluye reglas automatizadas listas para su ejecución:
- **Conversión a Title Case**: Capitalización impecable para campos de captura y visualización.
- **Respeto de Preposiciones**: Las preposiciones en español (`de`, `del`, `la`, `en`, `y`, etc.) se mantienen en minúsculas en nombres y direcciones (ej: *"Paseo de la Reforma"* o *"María de los Ángeles"*).
- **Lógica de Autogeneración de Llaves**: Si un campo del Google Doc no cuenta con llaves explícitas `{{llave}}`, el motor backend generará una de manera inteligente a partir del nombre de la pregunta y la reportará en la consola para tu control.
