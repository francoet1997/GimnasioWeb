@echo off
title INSTALADOR Y ARRANCADOR - GIMNASIO WEB
setlocal enabledelayedexpansion

echo ==========================================================
echo       CONFIGURACION AUTOMATICA DE GIMNASIO WEB
echo ==========================================================
echo.

:: 1. Verificar Node.js
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Abriendo pagina de descarga...
    start https://nodejs.org/
    echo.
    echo Por favor, instala Node.js (Version LTS) y vuelve a ejecutar este archivo.
    pause
    exit
)
echo [OK] Node.js detectado.

:: 2. Configurar Backend
echo.
echo [1/2] Configurando Backend...
cd backend
if not exist node_modules (
    echo Instalando dependencias del servidor...
    call npm install
) else (
    echo Dependencias del servidor ya instaladas.
)

:: Verificar .env
if not exist .env (
    echo Creando archivo .env basico...
    echo PORT=3001 > .env
    echo EMAIL_USER=tu-email@gmail.com >> .env
    echo EMAIL_PASS=tu-contrasenia >> .env
    echo DATABASE_NAME=database.sqlite >> .env
    echo [!] IMPORTANTE: Edita backend/.env con tus datos de correo mas tarde.
)
cd ..

:: 3. Configurar Frontend
echo.
echo [2/2] Configurando Frontend...
cd frontend
if not exist node_modules (
    echo Instalando dependencias de la interfaz visual...
    call npm install
) else (
    echo Dependencias de la interfaz ya instaladas.
)
cd ..

echo.
echo ==========================================================
echo    TODO LISTO. EL SISTEMA SE INICIARA AHORA...
echo ==========================================================
echo.
timeout /t 3

:: 4. Llamar al iniciador original
call iniciar.bat
