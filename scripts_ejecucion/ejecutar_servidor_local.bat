@echo off
title Servidor Web Local - Ecosistema Estudios Socioeconómicos
echo =======================================================================
echo   Iniciando Servidor Web Local para Pruebas Instantaneas
echo =======================================================================
echo.
echo [INFO] Este servidor abrira tu navegador de forma automatica.
echo [INFO] Cualquier cambio que hagamos lo veras presionando F5 al instante.
echo.
cd /d "%~dp0..\web-app"

:: Iniciar un servidor web ultra liviano de Node en el puerto 3000 y abrir el navegador
call npx -y http-server -p 3000 -c-1 -o

if %errorlevel% neq 0 (
    echo.
    echo [ALERTA] No se pudo iniciar el servidor con npx.
    echo Como alternativa, puedes abrir tu explorador de archivos
    echo y hacer doble clic directamente sobre 'web-app/index.html'
    pause
)
