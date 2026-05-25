@echo off
title Subir Proyecto a GitHub
echo =======================================================
echo   Preparando la conexion con tu repositorio en GitHub
echo =======================================================
echo.
cd /d "%~dp0.."

:: 1. Inicializar Git si no existe
if not exist .git (
    echo Inicializando repositorio Git local...
    call git init
    call git branch -M main
)

:: Configurar identidad local de Git para evitar error de autor desconocido
call git config user.email "contacto@conexionejecutiva.com"
call git config user.name "Conexion Ejecutiva"

:: 2. Vincular con el repositorio del usuario
echo Vinculando con https://github.com/Formulario-Socio/Captura.git ...
call git remote remove origin >nul 2>nul
call git remote add origin https://github.com/Formulario-Socio/Captura.git

:: 3. Agregar y hacer commit
echo Guardando todos los archivos locales del Ecosistema...
call git add .
call git commit -m "feat: Ecosistema Socioeconomico v1.0.00 - Reemplazo de prototipo"

:: 4. Empujar a GitHub (Usamos force para reemplazar el prototipo viejo)
echo.
echo =======================================================
echo   Subiendo a GitHub (Reemplazando prototipo antiguo)...
echo   Si GitHub te lo solicita, autoriza el acceso.
echo =======================================================
call git push -u origin main --force

echo.
echo =======================================================
echo   ¡Proceso completado con exito!
echo   Tu repositorio ya cuenta con el nuevo codigo
echo   y GitHub Actions iniciara el despliegue a Pages.
echo =======================================================
pause
