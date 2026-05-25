@echo off
title Configuración Inicial del Ecosistema de Estudios Socioeconómicos
echo =======================================================================
echo   Configurando Ecosistema de Automatizacion de Estudios Socioeconomicos
echo =======================================================================
echo.

:: 1. Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado en este sistema.
    echo Por favor, descarga e instala Node.js desde https://nodejs.org/ antes de continuar.
    pause
    exit /b 1
)

echo [OK] Node.js detectado en el sistema.
echo.

:: 2. Crear estructura de carpetas si no existen
echo Creando estructura de carpetas del proyecto...
if not exist admin-script mkdir admin-script
if not exist web-app mkdir web-app
if not exist config mkdir config
if not exist assets mkdir assets
if not exist scripts_ejecucion mkdir scripts_ejecucion
if not exist historial_de_versiones\v1.0.00 mkdir historial_de_versiones\v1.0.00
echo [OK] Carpetas verificadas/creadas con exito.
echo.

:: 3. Instalar dependencias del Backend (admin-script)
echo Instalando dependencias del Backend (admin-script)...
cd admin-script
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Hubo un problema al instalar las dependencias con npm install.
    pause
    exit /b 1
)
echo [OK] Dependencias de Node.js instaladas correctamente.
echo.

:: 4. Configurar variables de entorno .env si no existe
if not exist .env (
    echo Creando archivo de configuracion .env inicial desde .env.example...
    copy .env.example .env >nul
    echo [OK] Archivo .env creado. Por favor, revisa y ajusta las credenciales en 'admin-script/.env'.
) else (
    echo [OK] El archivo .env ya existe. No se sobreescribio.
)
cd ..
echo.

:: 5. Generar Snapshot para la Version 1.0.00
echo Generando Snapshot completo del proyecto en historial_de_versiones/v1.0.00...

:: Crear subcarpetas dentro del snapshot
if not exist historial_de_versiones\v1.0.00\admin-script mkdir historial_de_versiones\v1.0.00\admin-script
if not exist historial_de_versiones\v1.0.00\web-app mkdir historial_de_versiones\v1.0.00\web-app
if not exist historial_de_versiones\v1.0.00\config mkdir historial_de_versiones\v1.0.00\config
if not exist historial_de_versiones\v1.0.00\assets mkdir historial_de_versiones\v1.0.00\assets
if not exist historial_de_versiones\v1.0.00\scripts_ejecucion mkdir historial_de_versiones\v1.0.00\scripts_ejecucion

:: Copiar archivos especificos (excluyendo node_modules)
copy setup.bat historial_de_versiones\v1.0.00\ >nul
copy admin-script\package.json historial_de_versiones\v1.0.00\admin-script\ >nul
copy admin-script\sync.js historial_de_versiones\v1.0.00\admin-script\ >nul
copy admin-script\.env.example historial_de_versiones\v1.0.00\admin-script\ >nul
copy web-app\index.html historial_de_versiones\v1.0.00\web-app\ >nul
copy web-app\index.css historial_de_versiones\v1.0.00\web-app\ >nul
copy web-app\app.js historial_de_versiones\v1.0.00\web-app\ >nul
copy scripts_ejecucion\ejecutar_sincronizacion.bat historial_de_versiones\v1.0.00\scripts_ejecucion\ >nul
copy scripts_ejecucion\subir_a_github.bat historial_de_versiones\v1.0.00\scripts_ejecucion\ >nul
copy scripts_ejecucion\ejecutar_servidor_local.bat historial_de_versiones\v1.0.00\scripts_ejecucion\ >nul

echo [OK] Snapshot v1.0.00 completado con exito.
echo.
echo =======================================================================
echo   Configuracion completada. Ecosistema listo para su uso.
echo =======================================================================
echo Recuerda colocar tu credentials.json en la carpeta 'config/'
echo y configurar tus accesos de Supabase en 'admin-script/.env' antes de ejecutar.
echo =======================================================================
pause
