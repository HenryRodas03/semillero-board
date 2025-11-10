# 🎨 Guía Completa para Desarrollo del Frontend

## 📋 Índice

1. [Introducción y Configuración Inicial](#fase-1-introducción-y-configuración-inicial)
2. [Autenticación y Sistema de Roles](#fase-2-autenticación-y-sistema-de-roles)
3. [Módulos Administrativos y CRUD](#fase-3-módulos-administrativos-y-crud)
4. [Características Avanzadas](#fase-4-características-avanzadas)

---

# FASE 1: Introducción y Configuración Inicial

## 🎯 Objetivo
Configurar el proyecto frontend, conectar con el backend y crear la estructura base con páginas públicas.

---

## 🔧 Configuración del Proyecto

### 1.1 Información del Backend

**URL Base:** `http://localhost:3000/api`

**Tecnologías del Backend:**
- Express.js 4.18.2
- MySQL + Sequelize ORM
- JWT para autenticación
- Socket.IO para tiempo real
- Cloudinary para imágenes

### 1.2 Configuración de Axios (Recomendado)

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 1.3 Configuración de Socket.IO

```javascript
// src/services/socket.js
import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  socket = io('http://localhost:3000', {
    auth: {
      token: token
    },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('Socket conectado:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket desconectado');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const getSocket = () => socket;

// Eventos disponibles para escuchar:
// - proyecto:nuevo
// - proyecto:actualizado
// - proyecto:eliminado
// - actividad:nueva
// - actividad:actualizada
// - actividad:completada
// - comentario:nuevo
// - asignacion:nueva
// - asignacion:actualizada
// - historial:nuevo
// - notificacion:nueva
```

---

## 🌍 Endpoints Públicos (Sin Autenticación)

### 1.4 GET /public/semilleros
**Descripción:** Lista todos los semilleros activos

```javascript
// Sin autenticación requerida
const getSemillerosPublicos = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/public/semilleros');
    return response.data;
  } catch (error) {
    console.error('Error al obtener semilleros:', error);
    throw error;
  }
};

// Respuesta esperada:
[
  {
    "id": 1,
    "nombre": "GISDEL",
    "descripcion": "Grupo de investigación...",
    "ruta_imagen": "https://...",
    "estado": "Activo",
    "fecha_creacion": "2024-01-15T00:00:00.000Z",
    "totalCampos": 3,
    "totalProyectos": 15,
    "totalIntegrantes": 45
  }
]
```

### 1.5 GET /public/proyectos
**Descripción:** Lista todos los proyectos activos

```javascript
const getProyectosPublicos = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/public/proyectos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    throw error;
  }
};

// Respuesta esperada:
[
  {
    "id": 1,
    "nombre": "Sistema de Gestión de Proyectos",
    "descripcion": "Plataforma web para gestión...",
    "ruta_imagen": "https://...",
    "fecha_inicio": "2024-01-15",
    "fecha_fin": "2024-12-15",
    "estado": "En Progreso",
    "porcentaje_completado": 65,
    "campo": {
      "id": 1,
      "nombre": "Ingeniería de Software"
    },
    "totalActividades": 12,
    "actividadesCompletadas": 8
  }
]
```

### 1.6 GET /public/semilleros/:id
**Descripción:** Detalle completo de un semillero

```javascript
const getSemilleroPublico = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/public/semilleros/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener semillero:', error);
    throw error;
  }
};

// Respuesta esperada:
{
  "id": 1,
  "nombre": "GISDEL",
  "descripcion": "Grupo de investigación...",
  "ruta_imagen": "https://...",
  "estado": "Activo",
  "fecha_creacion": "2024-01-15T00:00:00.000Z",
  "campos": [
    {
      "id": 1,
      "nombre": "Ingeniería de Software",
      "descripcion": "...",
      "totalProyectos": 5
    }
  ],
  "estadisticas": {
    "totalCampos": 3,
    "totalProyectos": 15,
    "totalIntegrantes": 45
  }
}
```

### 1.7 GET /public/proyectos/:id
**Descripción:** Detalle completo de un proyecto

```javascript
const getProyectoPublico = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/public/proyectos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    throw error;
  }
};

// Respuesta esperada:
{
  "id": 1,
  "nombre": "Sistema de Gestión de Proyectos",
  "descripcion": "Plataforma web para gestión...",
  "ruta_imagen": "https://...",
  "fecha_inicio": "2024-01-15",
  "fecha_fin": "2024-12-15",
  "estado": "En Progreso",
  "porcentaje_completado": 65,
  "campo": {
    "id": 1,
    "nombre": "Ingeniería de Software",
    "semillero": {
      "id": 1,
      "nombre": "GISDEL"
    }
  },
  "estadisticas": {
    "totalActividades": 12,
    "actividadesCompletadas": 8,
    "totalAsignaciones": 20,
    "asignacionesCompletadas": 15
  }
}
```

### 1.8 GET /public/campos/:id/integrantes
**Descripción:** Lista integrantes activos de un campo

```javascript
const getIntegrantesCampo = async (campoId) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/public/campos/${campoId}/integrantes`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener integrantes:', error);
    throw error;
  }
};

// Respuesta esperada:
[
  {
    "id": 1,
    "id_usuario": 5,
    "id_rol": 3,
    "fecha_ingreso": "2024-01-15",
    "estado": "Activo",
    "usuario": {
      "nombre": "Juan Pérez",
      "correo": "juan@ucp.edu.co"
    },
    "rol": {
      "nombre": "Delegado"
    },
    "tiempoActivo": "10 meses"
  }
]
```

### 1.9 GET /public/campos/:id/horarios
**Descripción:** Obtiene horarios de reunión de un campo

```javascript
const getHorariosCampo = async (campoId) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/public/campos/${campoId}/horarios`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    throw error;
  }
};

// Respuesta esperada:
{
  "id": 1,
  "nombre": "Ingeniería de Software",
  "horario_reunion": "Miércoles 2:00 PM - 4:00 PM, Edificio 7, Sala 301"
}
```

### 1.10 GET /public/campos/:id/contacto
**Descripción:** Obtiene información de contacto de un campo

```javascript
const getContactoCampo = async (campoId) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/public/campos/${campoId}/contacto`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener contacto:', error);
    throw error;
  }
};

// Respuesta esperada:
{
  "id": 1,
  "nombre": "Ingeniería de Software",
  "contacto_email": "campo.software@ucp.edu.co",
  "contacto_redes_sociales": {
    "facebook": "https://facebook.com/campoSoftware",
    "instagram": "https://instagram.com/campo_software",
    "website": "https://software.ucp.edu.co"
  }
}
```

---

## 🎨 Componentes Sugeridos para Fase 1

### 1.11 Páginas Públicas a Crear

1. **Landing Page** (`/`)
   - Hero section
   - Lista de semilleros (consumir GET /public/semilleros)
   - Lista de proyectos destacados (consumir GET /public/proyectos)
   - Footer con información

2. **Página de Semilleros** (`/semilleros`)
   - Grid/Lista de todos los semilleros
   - Tarjetas con imagen, nombre, descripción
   - Click para ver detalle

3. **Detalle de Semillero** (`/semilleros/:id`)
   - Información completa del semillero
   - Lista de campos asociados
   - Estadísticas

4. **Página de Proyectos** (`/proyectos`)
   - Grid/Lista de todos los proyectos
   - Filtros por estado
   - Búsqueda

5. **Detalle de Proyecto** (`/proyectos/:id`)
   - Información completa del proyecto
   - Barra de progreso
   - Estadísticas de actividades

6. **Página de Campo** (`/campos/:id`)
   - Información del campo
   - Integrantes activos
   - Horarios de reunión
   - Información de contacto con enlaces a redes sociales

---

## ✅ Checklist Fase 1

- [ ] Configurar proyecto (React/Vue/Angular)
- [ ] Instalar axios y socket.io-client
- [ ] Crear servicio API con interceptores
- [ ] Crear servicio Socket.IO
- [ ] Implementar Landing Page
- [ ] Implementar página de Semilleros
- [ ] Implementar detalle de Semillero
- [ ] Implementar página de Proyectos
- [ ] Implementar detalle de Proyecto
- [ ] Implementar página de Campo con integrantes y contacto
- [ ] Probar todos los endpoints públicos
- [ ] Diseño responsive

---

# FASE 2: Autenticación y Sistema de Roles

## 🎯 Objetivo
Implementar el sistema de autenticación JWT, registro de usuarios, verificación de email, recuperación de contraseña y navegación según roles.

---

## 🔐 Endpoints de Autenticación

### 2.1 POST /auth/register
**Descripción:** Registrar nuevo usuario

```javascript
const register = async (userData) => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/register', {
      nombre: userData.nombre,
      correo: userData.correo,
      contraseña: userData.contraseña,
      id_rol: userData.id_rol // 1: Admin Semillero, 2: Admin Campo, 3: Delegado, 4: Colaborador
    });
    return response.data;
  } catch (error) {
    console.error('Error en registro:', error.response?.data);
    throw error;
  }
};

// Request Body:
{
  "nombre": "Juan Pérez",
  "correo": "juan@ucp.edu.co",
  "contraseña": "Password123!",
  "id_rol": 4
}

// Respuesta exitosa (201):
{
  "message": "Usuario registrado. Revisa tu correo para verificar tu cuenta."
}

// Errores posibles:
// 400 - { "message": "Faltan campos requeridos" }
// 409 - { "message": "El correo ya está registrado" }
```

### 2.2 POST /auth/login
**Descripción:** Iniciar sesión

```javascript
const login = async (credentials) => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      correo: credentials.correo,
      contraseña: credentials.contraseña
    });
    
    // Guardar token y usuario en localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Error en login:', error.response?.data);
    throw error;
  }
};

// Request Body:
{
  "correo": "juan@ucp.edu.co",
  "contraseña": "Password123!"
}

// Respuesta exitosa (200):
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan@ucp.edu.co",
    "id_rol": 4,
    "verificado": true,
    "rol": {
      "id": 4,
      "nombre": "Colaborador"
    }
  }
}

// Errores posibles:
// 400 - { "message": "Faltan campos requeridos" }
// 401 - { "message": "Credenciales incorrectas" }
// 403 - { "message": "Cuenta no verificada. Revisa tu correo." }
```

### 2.3 GET /auth/verify-email/:token
**Descripción:** Verificar email después del registro

```javascript
const verifyEmail = async (token) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    console.error('Error en verificación:', error.response?.data);
    throw error;
  }
};

// URL de ejemplo:
// http://localhost:3000/api/auth/verify-email/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Respuesta exitosa (200):
{
  "message": "Email verificado con éxito. Ya puedes iniciar sesión."
}

// Errores posibles:
// 400 - { "message": "Token de verificación inválido o expirado" }
// 404 - { "message": "Usuario no encontrado" }
```

### 2.4 POST /auth/forgot-password
**Descripción:** Solicitar recuperación de contraseña

```javascript
const forgotPassword = async (email) => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/forgot-password', {
      correo: email
    });
    return response.data;
  } catch (error) {
    console.error('Error en recuperación:', error.response?.data);
    throw error;
  }
};

// Request Body:
{
  "correo": "juan@ucp.edu.co"
}

// Respuesta exitosa (200):
{
  "message": "Correo de recuperación enviado"
}

// Errores posibles:
// 400 - { "message": "Falta el correo" }
// 404 - { "message": "Usuario no encontrado" }
```

### 2.5 POST /auth/reset-password/:token
**Descripción:** Restablecer contraseña con token

```javascript
const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`http://localhost:3000/api/auth/reset-password/${token}`, {
      nuevaContraseña: newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error al restablecer contraseña:', error.response?.data);
    throw error;
  }
};

// Request Body:
{
  "nuevaContraseña": "NewPassword123!"
}

// Respuesta exitosa (200):
{
  "message": "Contraseña actualizada con éxito"
}

// Errores posibles:
// 400 - { "message": "Token inválido o expirado" }
// 400 - { "message": "Falta la nueva contraseña" }
```

### 2.6 GET /auth/me
**Descripción:** Obtener información del usuario actual (requiere token)

```javascript
const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me'); // Usa api con interceptor
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario:', error.response?.data);
    throw error;
  }
};

// Headers requeridos:
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Respuesta exitosa (200):
{
  "id": 1,
  "nombre": "Juan Pérez",
  "correo": "juan@ucp.edu.co",
  "id_rol": 4,
  "verificado": true,
  "fecha_creacion": "2024-01-15T10:30:00.000Z",
  "rol": {
    "id": 4,
    "nombre": "Colaborador",
    "permisos": {
      "ver_proyectos": true,
      "crear_proyectos": false,
      "editar_proyectos": false,
      "eliminar_proyectos": false,
      "completar_asignaciones": true,
      "comentar": true
    }
  }
}

// Errores posibles:
// 401 - { "message": "Token no proporcionado" }
// 401 - { "message": "Token inválido" }
// 404 - { "message": "Usuario no encontrado" }
```

---

## 🛡️ Sistema de Roles

### 2.7 Jerarquía de Roles

| ID | Nombre | Nivel | Descripción |
|----|--------|-------|-------------|
| 1 | Admin Semillero | 🔴 Alto | Acceso total al sistema |
| 2 | Admin Campo | 🟡 Medio-Alto | Gestión de su campo |
| 3 | Delegado | 🟢 Medio | Gestión de proyectos y actividades |
| 4 | Colaborador | 🔵 Bajo | Solo visualización y completar asignaciones |

### 2.8 Matriz de Permisos

```javascript
// Permisos por rol (usar en frontend para mostrar/ocultar funciones)
const PERMISOS = {
  ADMIN_SEMILLERO: {
    id: 1,
    nombre: 'Admin Semillero',
    permisos: {
      // Semilleros
      crear_semillero: true,
      editar_semillero: true,
      eliminar_semillero: true,
      // Campos
      crear_campo: true,
      editar_campo: true,
      eliminar_campo: true,
      // Proyectos
      crear_proyecto: true,
      editar_proyecto: true,
      eliminar_proyecto: true,
      // Actividades
      crear_actividad: true,
      editar_actividad: true,
      eliminar_actividad: true,
      // Asignaciones
      crear_asignacion: true,
      editar_asignacion: true,
      eliminar_asignacion: true,
      completar_asignacion: true,
      // Integrantes
      agregar_integrante: true,
      editar_integrante: true,
      eliminar_integrante: true,
      activar_desactivar_integrante: true,
      // Comentarios
      comentar: true,
      eliminar_comentarios: true,
      // Reportes
      generar_reportes: true,
      // Uploads
      subir_imagen_semillero: true,
      subir_imagen_campo: true,
      subir_imagen_proyecto: true,
      // Dashboard
      ver_dashboard: true
    }
  },
  ADMIN_CAMPO: {
    id: 2,
    nombre: 'Admin Campo',
    permisos: {
      // Solo puede gestionar SU campo
      editar_campo: true, // Solo su campo
      crear_proyecto: true, // En su campo
      editar_proyecto: true, // De su campo
      eliminar_proyecto: true, // De su campo
      crear_actividad: true,
      editar_actividad: true,
      eliminar_actividad: true,
      crear_asignacion: true,
      editar_asignacion: true,
      eliminar_asignacion: true,
      completar_asignacion: true,
      agregar_integrante: true, // A su campo
      editar_integrante: true,
      eliminar_integrante: true,
      activar_desactivar_integrante: true,
      comentar: true,
      generar_reportes: true,
      subir_imagen_campo: true,
      subir_imagen_proyecto: true,
      ver_dashboard: true
    }
  },
  DELEGADO: {
    id: 3,
    nombre: 'Delegado',
    permisos: {
      crear_proyecto: true,
      editar_proyecto: true, // Solo sus proyectos
      eliminar_proyecto: true, // Solo sus proyectos
      crear_actividad: true,
      editar_actividad: true,
      eliminar_actividad: true,
      crear_asignacion: true,
      editar_asignacion: true,
      eliminar_asignacion: true,
      completar_asignacion: true,
      comentar: true,
      generar_reportes: true,
      subir_imagen_campo: true,
      subir_imagen_proyecto: true,
      ver_dashboard: true
    }
  },
  COLABORADOR: {
    id: 4,
    nombre: 'Colaborador',
    permisos: {
      // Solo lectura y completar sus asignaciones
      ver_proyectos: true,
      ver_actividades: true,
      ver_asignaciones: true,
      completar_asignacion: true, // Solo las propias
      comentar: true,
      ver_dashboard: true
    }
  }
};

// Helper para verificar permisos
const tienePermiso = (usuario, permiso) => {
  const rolPermisos = Object.values(PERMISOS).find(r => r.id === usuario.id_rol);
  return rolPermisos?.permisos[permiso] || false;
};

// Uso en componentes:
// if (tienePermiso(user, 'crear_proyecto')) {
//   // Mostrar botón crear proyecto
// }
```

---

## 🎨 Componentes Sugeridos para Fase 2

### 2.9 Páginas de Autenticación

1. **Login** (`/login`)
   - Formulario: correo, contraseña
   - Link a "Olvidé mi contraseña"
   - Link a "Registrarse"
   - Validación de errores

2. **Registro** (`/register`)
   - Formulario: nombre, correo, contraseña, confirmar contraseña
   - Selector de rol (Colaborador por defecto)
   - Validación de contraseña segura
   - Link a "Ya tengo cuenta"

3. **Verificación Email** (`/verify-email/:token`)
   - Mensaje de éxito/error
   - Redirect a login después de 3 segundos

4. **Olvidé Contraseña** (`/forgot-password`)
   - Formulario: correo
   - Mensaje de confirmación

5. **Restablecer Contraseña** (`/reset-password/:token`)
   - Formulario: nueva contraseña, confirmar
   - Validación de contraseña segura
   - Redirect a login después de cambiar

6. **Perfil de Usuario** (`/profile`)
   - Mostrar información del usuario logueado
   - Opción para cambiar contraseña
   - Mostrar rol y permisos

### 2.10 Navegación Dinámica según Rol

```javascript
// Estructura de menú según rol
const getMenuItems = (usuario) => {
  const menuBase = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' }
  ];

  if (tienePermiso(usuario, 'crear_semillero')) {
    menuBase.push({ label: 'Semilleros', path: '/admin/semilleros', icon: 'group' });
  }

  if (tienePermiso(usuario, 'crear_campo')) {
    menuBase.push({ label: 'Campos', path: '/admin/campos', icon: 'science' });
  }

  if (tienePermiso(usuario, 'crear_proyecto')) {
    menuBase.push({ label: 'Proyectos', path: '/admin/proyectos', icon: 'folder' });
  }

  menuBase.push(
    { label: 'Mis Actividades', path: '/mis-actividades', icon: 'task' },
    { label: 'Comentarios', path: '/comentarios', icon: 'comment' }
  );

  if (tienePermiso(usuario, 'generar_reportes')) {
    menuBase.push({ label: 'Reportes', path: '/reportes', icon: 'analytics' });
  }

  menuBase.push({ label: 'Mi Perfil', path: '/profile', icon: 'person' });

  return menuBase;
};
```

---

## ✅ Checklist Fase 2

- [ ] Implementar página de Login
- [ ] Implementar página de Registro
- [ ] Implementar flujo de verificación de email
- [ ] Implementar recuperación de contraseña
- [ ] Implementar página de perfil
- [ ] Crear contexto/store de autenticación
- [ ] Implementar guards de rutas según rol
- [ ] Crear componente de navegación dinámica
- [ ] Implementar logout
- [ ] Manejar token expirado (redirect a login)
- [ ] Probar todos los endpoints de auth

---

*Continúa en la siguiente sección...*
