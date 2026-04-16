# GimnasioWeb Professional 🏋️‍♂️

Sistema de gestión para entrenadores personales que permite administrar clientes, crear rutinas personalizadas y enviarlas por correo electrónico con un diseño profesional y listo para imprimir.

![Responsive Design](https://img.shields.io/badge/Design-Responsive-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57)

## ✨ Características

- **Gestión de Clientes:** Registro de alumnos con perfiles personalizados.
- **Editor de Rutinas:** Constructor de entrenamientos de 1 a 6 días con asignación de ejercicios, series, repeticiones y cargas.
- **Stock de Modelos:** Creación de plantillas maestras para agilizar la asignación de rutinas comunes.
- **Envío por Email:** Generación automática de correos con la rutina maquetada en estilo profesional.
- **Diseño Responsive:** Totalmente funcional en dispositivos móviles para uso directo en la sala de musculación.
- **Modo Impresión:** Estilo optimizado para imprimir rutinas en papel con diseño limpio y robusto.

## 🚀 Tecnologías

### Frontend
- **React 18** con **TypeScript**.
- **Tailwind CSS** para el diseño visual.
- **Lucide React** para la iconografía.
- **Vite** como herramienta de construcción.

### Backend
- **Node.js** & **Express**.
- **SQLite3** para persistencia de datos ligera y eficiente.
- **Nodemailer** para la integración con servicios de correo.
- **Dotenv** para la gestión segura de credenciales.

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/GimnasioWeb.git
   cd GimnasioWeb
   ```

2. **Configurar el Backend:**
   - Ve a la carpeta `backend`.
   - Crea un archivo `.env` basado en el siguiente ejemplo:
     ```env
     PORT=3001
     EMAIL_USER=tu-email@gmail.com
     EMAIL_PASS=tu-contraseña-de-aplicacion
     DATABASE_NAME=database.sqlite
     ```
   - Instala las dependencias: `npm install`.

3. **Configurar el Frontend:**
   - Ve a la carpeta `frontend`.
   - Instala las dependencias: `npm install`.

4. **Ejecutar el proyecto:**
   - Puedes usar el script `iniciar.sh` en la raíz (si estás en Linux) o iniciar cada parte por separado con `npm run dev`.

## 🔒 Seguridad
Este proyecto utiliza variables de entorno para proteger las credenciales de correo. Asegúrate de que el archivo `.env` esté incluido en tu `.gitignore` antes de subir cambios.

---
Desarrollado con ❤️ para entrenadores que buscan profesionalizar su servicio.
