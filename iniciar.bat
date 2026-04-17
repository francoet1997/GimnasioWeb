@echo off
title GIMNASIOWEB - INICIANDO SISTEMA
setlocal enabledelayedexpansion

:: Obtener la IP local (Windows) para acceso desde el celular
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set IP_LOCAL=%%i
    set IP_LOCAL=!IP_LOCAL: ^=!
    goto :found_ip
)
:found_ip

cls
echo ==========================================================
echo           GIMNASIO WEB PROFESSIONAL 
echo ==========================================================
echo.
echo  [1/3] Iniciando Servidor de Datos (Backend)...
cd backend
start /B node index.js > nul 2>&1

echo  [2/3] Iniciando Interfaz Visual (Frontend)...
cd ../frontend
start /B npx vite --host --port 5173 > nul 2>&1

echo  [3/3] Configurando ventana de aplicacion...
echo.
echo ----------------------------------------------------------
echo  ACCESO LOCAL: http://localhost:5173
if defined IP_LOCAL (
    echo  ACCESO CELULAR: http://%IP_LOCAL%:5173
)
echo ----------------------------------------------------------
echo.
echo  ESPERANDO A QUE EL SISTEMA ESTE LISTO...
timeout /t 6 /nobreak > nul

:: Intentar abrir en Modo App de Chrome
set URL=http://localhost:5173
start chrome --app=%URL% 2>nul
if %ERRORLEVEL% NEQ 0 (
    :: Si falla Chrome, intentar con Edge (que es de sistema)
    start msedge --app=%URL% 2>nul
    if %ERRORLEVEL% NEQ 0 (
        :: Si todo falla, abrir en el navegador por defecto normal
        start %URL%
    )
)

echo.
echo  SISTEMA ACTIVO. 
echo  NO CIERRES ESTA VENTANA MIENTRAS USES EL PROGRAMA.
echo.
echo  Presiona [ENTER] para APAGAR y SALIR.
echo.
pause > nul

echo.
echo  Apagando servicios...
taskkill /F /IM node.exe /T > nul 2>&1
echo  SISTEMA APAGADO CORRECTAMENTE.
timeout /t 2 > nul
exit
