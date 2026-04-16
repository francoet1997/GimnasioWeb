@echo off
setlocal enabledelayedexpansion

:: Obtener la IP local (Windows)
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set IP_LOCAL=%%i
    set IP_LOCAL=!IP_LOCAL: ^=!
    goto :found_ip
)
:found_ip

echo ------------------------------------------------
echo    INICIANDO GIMNASIOWEB (WINDOWS)
echo ------------------------------------------------
echo Acceso desde esta computadora: http://localhost:5173
if defined IP_LOCAL (
    echo Acceso desde celulares/otros: http://%IP_LOCAL%:5173
) else (
    echo No se pudo detectar la IP local para acceso externo.
)
echo ------------------------------------------------

:: Iniciar Backend en segundo plano
cd backend
start /B node index.js

:: Iniciar Frontend con acceso externo
cd ../frontend
start /B npx vite --host --port 5173

:: Esperar un momento y abrir el navegador
timeout /t 5 /nobreak > nul
start http://localhost:5173

cd ..

echo Presiona [Enter] para apagar el sistema...
pause > nul

:: En Windows con start /B, cerrar la consola principal suele cerrar los procesos hijos, 
:: pero para ser limpios, podriamos intentar matarlos si supieramos los PIDs. 
:: Sin embargo, taskkill /F /IM node.exe podria matar otros procesos de node.

echo Apagando el sistema...
taskkill /F /IM node.exe /T
echo Sistema apagado.
