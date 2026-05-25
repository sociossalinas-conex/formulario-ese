@echo off
title Sincronizador de Estudios Socioeconomicos - Ejecucion
echo =======================================================
echo   Iniciando Sincronizacion de Plantillas de Drive
echo =======================================================
cd /d "%~dp0..\admin-script"
if not exist node_modules (
    echo [ALERTA] Las dependencias no estan instaladas.
    echo Por favor, ejecuta primero el archivo setup.bat en la raiz del proyecto.
    pause
    exit /b
)
call npm run sync
echo =======================================================
echo   Proceso de sincronizacion terminado.
echo =======================================================
pause
