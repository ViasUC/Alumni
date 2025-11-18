# VIAS UC – Frontend (Angular)

Aplicación web desarrollada con Angular (standalone components) para gestionar perfiles, oportunidades, red personal, registro/login de usuarios y actividad.

# Flujo general de la aplicación
1. Registro de usuario

El usuario completa:
- Nombre, Apellido, Email, Contraseña, Rol (Alumno, Profesor, Egresado, Empresa)

Al enviar el formulario:
- Se valida que todos los campos estén completos
- Se muestra un popup de confirmación
- Al presionar Aceptar, el usuario es redirigido al Login

2. Login
- Valida credenciales
- Si son correctas, guarda el usuario en sessionStorage
- Redirige al Dashboard

3. Navegación
- La barra superior azul:
- Identifica la pestaña activa según la ruta
- Permite moverse entre:
Oportunidades, Mi Actividad, Descubrir, Red Personal, Mi Perfil

(El avatar con iniciales abre la pantalla de perfil)

- Pantallas principales:
  
  Oportunidades
- Crear, editar y eliminar oportunidades propias
- Ver detalles
- Postularse a oportunidades
- Ver lista de postulantes mediante un popup
- Ver perfil del postulante mediante un popup

Mi Actividad
- Muestra oportunidades creadas por el usuario (Editar, Eliminar y Ver Postulantes)
- Muestra postulaciones realizadas (Despostular y Ver Detalles)
- Incluye filtros por fecha y estado

Descubrir
- Lista de usuarios registrados y pendientes de registrar
- Búsqueda por texto
- Visualizacion de perfil de usuarios
- Conectar, cancelar solicitud o aceptar conexión

Red Personal
- Lista de conexiones del usuario (Aqui se puede endorsear usuarios)
- Solicitudes recibidas para conectarse entre usuarios (Aceptar o rechazar)
- Sección de endorsements recibidos y realizados
- Acceso a perfiles completos al conectarse con un usuario
- Acceso a perfil basico al no estar conectado con usuario

Perfil
- Edición de datos personales
- Visualización del portafolio
- Evidencias vinculadas
- Indicador de completitud del perfil

# Instalación y ejecución del proyecto

Este proyecto utiliza la version 19.1.8 de Angular .

1. Clonar el repositorio

Descargar el proyecto desde Git ejecutando el comando:
git clone https://github.com/ViasUC/Alumni.git

Y luego ingresar a la carpeta del proyecto.

2. Instalar dependencias

Para instalar todas las dependencias necesarias, ejecutar:
npm install

Esto descargará los módulos que utiliza Angular y dejará el proyecto listo para ejecutarse.

3. Ejecutar servidor de desarrollo

Para iniciar la aplicación en modo desarrollo, ejecutar:
ng serve -o

Esto compila el proyecto y abre automáticamente la aplicación en el navegador en la dirección http://localhost:4200/.
Cada vez que se modifique un archivo y guardarlo (Control S), la app se recargará automáticamente.


4. Requisitos previos

Antes de ejecutar el proyecto es necesario tener instalado:

Node.js versión 18 o superior

- Verificar si tienes esto ejecutando desde la consola: node -v npm -v
- Si no tienes instalado:
- Descarga recomendada: https://nodejs.org
- Versión sugerida: Node.js 18.x o superior
- npm se instala automáticamente con Node.js

Angular CLI instalado globalmente mediante: npm install -g @angular/cli
