# 🚀 Semillero Board - Frontend

Sistema de gestión de proyectos para los semilleros de investigación de la Universidad Católica de Pereira.

## 📋 Características

- ✅ **Autenticación JWT** con roles (Admin Semillero, Admin Campo, Delegado, Colaborador)
- 🌐 **Sitio Público** para visualizar semilleros y proyectos sin autenticación
- 📊 **Dashboard Administrativo** con estadísticas en tiempo real
- 🔔 **Notificaciones en tiempo real** con Socket.IO
- 📱 **Diseño Responsive** con Tailwind CSS
- 🎨 **Componentes UI** con shadcn/ui

## 🛠️ Tecnologías

- **React 18** + TypeScript
- **Vite** - Build tool
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Socket.IO Client** - WebSockets
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **React Query** - State management

## 📦 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Instalar dependencias adicionales

```bash
npm install axios socket.io-client
```

### 3. Configurar variables de entorno

El backend debe estar corriendo en `http://localhost:3000`

Si necesitas cambiar la URL, edita:
- `src/services/api.ts` - Línea con `baseURL`
- `src/services/authService.ts` - Línea con `BASE_URL`
- `src/services/publicService.ts` - Línea con `BASE_URL`
- `src/services/socket.ts` - Línea con la URL de Socket.IO

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne)

## 🗂️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout/         # Layout y navegación
│   ├── ui/             # Componentes UI de shadcn
│   └── ...
├── contexts/           # Contextos de React
│   └── AuthContext.tsx # Contexto de autenticación
├── hooks/              # Custom hooks
├── lib/                # Utilidades
├── pages/              # Páginas de la aplicación
│   ├── public/         # Páginas públicas (sin auth)
│   ├── auth/           # Login, Registro
│   └── admin/          # Páginas administrativas
├── services/           # Servicios API
│   ├── api.ts          # Cliente Axios configurado
│   ├── socket.ts       # Cliente Socket.IO
│   ├── authService.ts  # Servicio de autenticación
│   ├── publicService.ts # Servicios públicos
│   └── ...             # Otros servicios
└── App.tsx             # Componente principal con rutas
```

## 🔐 Sistema de Autenticación

### Roles disponibles

1. **Admin Semillero** (ID: 1)
   - Acceso total al sistema
   - Gestión de semilleros, campos y usuarios

2. **Admin Campo** (ID: 2)
   - Gestión de su campo de investigación
   - Creación y gestión de proyectos

3. **Delegado** (ID: 3)
   - Gestión de proyectos y actividades
   - Asignación de tareas

4. **Colaborador** (ID: 4)
   - Visualización de proyectos y actividades
   - Completar asignaciones propias

### Flujo de autenticación

1. **Registro** (`/register`)
   - El usuario se registra con nombre, correo y contraseña
   - Se envía un email de verificación
   
2. **Verificación** (Link en email)
   - El usuario hace clic en el link del email
   - La cuenta queda verificada

3. **Login** (`/login`)
   - El usuario inicia sesión con correo y contraseña
   - Se recibe un JWT token que se guarda en localStorage
   - El usuario es redirigido al dashboard administrativo

4. **Recuperación de contraseña** (`/forgot-password`)
   - El usuario solicita recuperar su contraseña
   - Se envía un email con un link
   - El usuario puede establecer una nueva contraseña

## 🌐 Rutas Públicas

Estas rutas NO requieren autenticación:

- `/` - Landing page (Home)
- `/public/semilleros` - Lista de todos los semilleros
- `/public/semilleros/:id` - Detalle de un semillero
- `/public/proyectos` - Lista de todos los proyectos
- `/public/proyectos/:id` - Detalle de un proyecto

## 🔒 Rutas Privadas (Requieren Login)

Estas rutas requieren autenticación:

- `/admin/dashboard` - Dashboard con estadísticas
- `/admin/proyectos` - Gestión de proyectos
- `/admin/tareas` - Gestión de tareas
- `/admin/usuarios` - Gestión de usuarios

## 🔌 Servicios API Disponibles

### Autenticación
- `authService.register(userData)` - Registrar usuario
- `authService.login(credentials)` - Iniciar sesión
- `authService.verifyEmail(token)` - Verificar email
- `authService.forgotPassword(email)` - Recuperar contraseña
- `authService.resetPassword(token, password)` - Restablecer contraseña
- `authService.getCurrentUser()` - Obtener usuario actual
- `authService.logout()` - Cerrar sesión

### Públicos (Sin autenticación)
- `publicService.getSemilleros()` - Listar semilleros
- `publicService.getSemilleroById(id)` - Detalle de semillero
- `publicService.getProyectos()` - Listar proyectos
- `publicService.getProyectoById(id)` - Detalle de proyecto
- `publicService.getIntegrantesCampo(campoId)` - Integrantes de un campo
- `publicService.getHorariosCampo(campoId)` - Horarios de un campo
- `publicService.getContactoCampo(campoId)` - Contacto de un campo

### Administrativos (Con autenticación)
- **Semilleros**: `semillerosService.*`
- **Campos**: `camposService.*`
- **Proyectos**: `proyectosService.*`
- **Actividades**: `actividadesService.*`
- **Asignaciones**: `asignacionesService.*`
- **Integrantes**: `integrantesService.*`
- **Comentarios**: `comentariosService.*`
- **Dashboard**: `dashboardService.getEstadisticas()`
- **Historial**: `historialService.*`
- **Reportes**: `reportesService.*`
- **Uploads**: `uploadsService.*`

## 📡 Socket.IO (Tiempo Real)

### Eventos disponibles

```javascript
import { getSocket, SOCKET_EVENTS } from '@/services/socket';

const socket = getSocket();

// Escuchar eventos
socket.on(SOCKET_EVENTS.PROYECTO_NUEVO, (data) => {
  console.log('Nuevo proyecto creado:', data);
});

socket.on(SOCKET_EVENTS.ACTIVIDAD_COMPLETADA, (data) => {
  console.log('Actividad completada:', data);
});

socket.on(SOCKET_EVENTS.NOTIFICACION_NUEVA, (data) => {
  console.log('Nueva notificación:', data);
});
```

### Eventos completos
- `proyecto:nuevo`, `proyecto:actualizado`, `proyecto:eliminado`
- `actividad:nueva`, `actividad:actualizada`, `actividad:completada`
- `comentario:nuevo`
- `asignacion:nueva`, `asignacion:actualizada`
- `historial:nuevo`
- `notificacion:nueva`

## 🎨 Personalización

### Colores

Los colores están configurados en `tailwind.config.ts` y `src/index.css`. El sistema usa variables CSS para los colores del tema.

### Componentes UI

Los componentes están en `src/components/ui/` y son de shadcn/ui. Puedes personalizarlos editando los archivos directamente.

## 🚀 Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 📝 Notas Importantes

1. **Backend requerido**: Asegúrate de que el backend esté corriendo en `http://localhost:3000`

2. **CORS**: El backend debe tener CORS configurado para aceptar peticiones desde el frontend

3. **Socket.IO**: Para que funcionen las notificaciones en tiempo real, el backend debe tener Socket.IO configurado

4. **Email**: Para el registro y recuperación de contraseña, el backend debe tener configurado el servicio de email

5. **Cloudinary**: Para la carga de imágenes, el backend debe tener configurado Cloudinary

## 🐛 Solución de Problemas

### Error de CORS
Si ves errores de CORS, verifica que el backend tenga configurado:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Token expirado
Si el token expira, el usuario será redirigido automáticamente a `/login`

### Socket.IO no conecta
Verifica que el backend esté corriendo y que la URL en `socket.ts` sea correcta

## 📞 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.

---

Desarrollado con ❤️ para la Universidad Católica de Pereira
