@echo off
title REVISOR DE ESTADO - GIMNASIO POWER
cls
echo ==========================================================
echo           ESTADO DEL SISTEMA GIMNASIO POWER
echo ==========================================================
echo.

:: Verificar Backend (Puerto 3001)
netstat -ano | findstr :3001 > nul
if %ERRORLEVEL% EQU 0 (
    echo  [OK] SERVIDOR DE DATOS:  ACTIVO (Online)
) else (
    echo  [--] SERVIDOR DE DATOS:  APAGADO (Offline)
)

:: Verificar Frontend (Puerto 5173)
netstat -ano | findstr :5173 > nul
if %ERRORLEVEL% EQU 0 (
    echo  [OK] INTERFAZ VISUAL:    ACTIVA (Online)
) else (
    echo  [--] INTERFAZ VISUAL:    APAGADA (Offline)
)

echo.
echo ----------------------------------------------------------
echo.
echo  Si quieres cerrar todo lo que este "trabado", 
echo  presiona [K] para FORZAR CIERRE o cualquier tecla para salir.
echo.
set /p action="> "

if /i "%action%"=="K" (
    echo.
    echo  Cerrando procesos...
    taskkill /F /IM node.exe /T > nul 2>&1
    echo  Listo. Todos los procesos de Node han sido cerrados.
    timeout /t 2 > nul
)

exit
