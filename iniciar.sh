#!/bin/bash

# Función para obtener la IP local
IP_LOCAL=$(hostname -I | awk '{print $1}')

echo "------------------------------------------------"
echo "   INICIANDO GIMNASIOWEB"
echo "------------------------------------------------"
echo "Acceso desde esta computadora: http://localhost:5173"
echo "Acceso desde celulares/otros: http://$IP_LOCAL:5173"
echo "------------------------------------------------"

# Iniciar Backend en segundo plano
cd backend
node index.js &
BACKEND_PID=$!

# Iniciar Frontend con acceso externo
cd ../frontend
npx vite --host --port 5173 &
FRONTEND_PID=$!

# Esperar a que el usuario presione una tecla para cerrar
echo "Presiona [Enter] para apagar el sistema..."
read

kill $BACKEND_PID
kill $FRONTEND_PID
echo "Sistema apagado."
