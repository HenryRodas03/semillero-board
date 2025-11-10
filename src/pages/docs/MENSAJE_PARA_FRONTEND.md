# 📢 Mensaje para el Equipo Frontend

## ✅ Backend Actualizado - Rutas Implementadas

Hola equipo frontend 👋

He corregido todos los errores del backend que estaban causando los 404 y el 500 en el sistema. **Todas las rutas que necesitaban ahora están funcionando.**

---

## 🎉 Rutas Nuevas Implementadas

Se han creado las siguientes rutas que estaban faltando:

### 1. Líneas de Investigación
- ✅ `GET /api/lineas-investigacion` - Listar todas las líneas
- ✅ `GET /api/lineas-investigacion/:id` - Obtener una línea específica

### 2. Proyectos por Semillero
- ✅ `GET /api/semilleros/:id/proyectos` - Obtener todos los proyectos de un semillero

**Ejemplo de uso:**
```javascript
// Obtener proyectos del semillero con ID 1
const response = await axios.get('/api/semilleros/1/proyectos');
```

### 3. Integrantes por Semillero
- ✅ `GET /api/semilleros/:id/integrantes` - Obtener todos los integrantes activos de un semillero

**Ejemplo de uso:**
```javascript
// Obtener integrantes del semillero con ID 1
const response = await axios.get('/api/semilleros/1/integrantes');
```

### 4. Actividades por Proyecto
- ✅ `GET /api/proyectos/:id/actividades` - Obtener todas las actividades de un proyecto (ordenadas por prioridad)

**Ejemplo de uso:**
```javascript
// Obtener actividades del proyecto con ID 5
const response = await axios.get('/api/proyectos/5/actividades');
```

### 5. Alias para Usuarios
- ✅ `GET /api/usuarios` - Ahora funciona como alias de `/api/users`

---

## ⚠️ ACCIÓN REQUERIDA: Agregar Token de Autenticación

### 🚨 Problema Actual

Actualmente, el frontend está haciendo peticiones a rutas protegidas **SIN enviar el token JWT**, lo que causa errores **404** o **401**.

**Ejemplo de código INCORRECTO (actual):**
```typescript
// ❌ Esto NO funciona - falta el token
export const getAll = async () => {
  return axios.get(`${API_URL}/usuarios`);
};
```

### ✅ Solución: Agregar Headers con Token

Deben modificar **TODAS** las funciones en sus servicios que llamen a rutas protegidas para incluir el token en los headers.

**Código CORRECTO:**
```typescript
// ✅ Esto SÍ funciona - incluye el token
export const getAll = async () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/usuarios`, {
    headers: { 
      Authorization: `Bearer ${token}` 
    }
  });
};
```

---

## 📝 Archivos que Deben Modificar

### 1. `usuariosService.ts` (o similar)

```typescript
const API_URL = 'http://localhost:3000/api/usuarios';

// Helper para obtener headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { 
      Authorization: `Bearer ${token}` 
    }
  };
};

// Modificar TODAS estas funciones:
export const getAll = async () => {
  return axios.get(`${API_URL}`, getAuthHeaders());
};

export const getById = async (id: number) => {
  return axios.get(`${API_URL}/${id}`, getAuthHeaders());
};

export const create = async (data: any) => {
  return axios.post(`${API_URL}`, data, getAuthHeaders());
};

export const update = async (id: number, data: any) => {
  return axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
};

export const delete = async (id: number) => {
  return axios.delete(`${API_URL}/${id}`, getAuthHeaders());
};
```

### 2. `semillerosService.ts` (o similar)

```typescript
const API_URL = 'http://localhost:3000/api/semilleros';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { 
      Authorization: `Bearer ${token}` 
    }
  };
};

// Solo las rutas que empiezan con /mi-semillero necesitan token
export const getMiSemilleroInfo = async () => {
  return axios.get(`${API_URL}/mi-semillero/info`, getAuthHeaders());
};

export const updateMiSemillero = async (data: any) => {
  return axios.put(`${API_URL}/mi-semillero`, data, getAuthHeaders());
};

// Las rutas públicas NO necesitan token:
export const getAll = async () => {
  return axios.get(`${API_URL}`); // Sin token - es pública
};

export const getById = async (id: number) => {
  return axios.get(`${API_URL}/${id}`); // Sin token - es pública
};

export const getProyectos = async (id: number) => {
  return axios.get(`${API_URL}/${id}/proyectos`); // Sin token - es pública
};

export const getIntegrantes = async (id: number) => {
  return axios.get(`${API_URL}/${id}/integrantes`); // Sin token - es pública
};
```

### 3. `lineasInvestigacionService.ts` (NUEVO)

```typescript
const API_URL = 'http://localhost:3000/api/lineas-investigacion';

// Estas rutas son PÚBLICAS - no necesitan token
export const getAll = async () => {
  return axios.get(`${API_URL}`);
};

export const getById = async (id: number) => {
  return axios.get(`${API_URL}/${id}`);
};
```

### 4. `proyectosService.ts` (o similar)

```typescript
const API_URL = 'http://localhost:3000/api/proyectos';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { 
      Authorization: `Bearer ${token}` 
    }
  };
};

// Rutas públicas (sin token):
export const getActividades = async (id: number) => {
  return axios.get(`${API_URL}/${id}/actividades`); // Sin token - es pública
};

// Rutas protegidas (con token):
export const create = async (data: any) => {
  return axios.post(`${API_URL}`, data, getAuthHeaders());
};

export const update = async (id: number, data: any) => {
  return axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
};

export const delete = async (id: number) => {
  return axios.delete(`${API_URL}/${id}`, getAuthHeaders());
};
```

---

## 🔐 ¿Qué Rutas Necesitan Token?

### Rutas PROTEGIDAS (requieren token):
- ✅ `/api/usuarios/*` - Todas las operaciones
- ✅ `/api/semilleros/mi-semillero/*` - Todas las operaciones del líder
- ✅ `/api/campos/mi-campo/*` - Todas las operaciones del líder de campo
- ✅ Crear, actualizar, eliminar proyectos, actividades, etc.

### Rutas PÚBLICAS (sin token):
- ✅ `/api/lineas-investigacion` - Listar y obtener
- ✅ `/api/semilleros` - Listar semilleros
- ✅ `/api/semilleros/:id` - Obtener detalle de semillero
- ✅ `/api/semilleros/:id/proyectos` - Proyectos de un semillero
- ✅ `/api/semilleros/:id/integrantes` - Integrantes de un semillero
- ✅ `/api/proyectos/:id/actividades` - Actividades de un proyecto

---

## 🛡️ Manejo de Errores de Autenticación

También deben agregar manejo de errores para redireccionar al login cuando el token expire:

```typescript
// En su configuración de axios o en un interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      // Usuario no tiene permisos
      alert('No tienes permisos para realizar esta acción');
    }
    return Promise.reject(error);
  }
);
```

---

## 🧪 Cómo Probar

### 1. Login
```javascript
// Hacer login primero
const response = await axios.post('/api/auth/login', {
  correo: 'maria.garcia@ucp.edu.co',
  password: 'admin123'
});

// Guardar el token
localStorage.setItem('token', response.data.token);
```

### 2. Usar Token en Peticiones
```javascript
// Ahora usar el token en peticiones protegidas
const token = localStorage.getItem('token');

const usuarios = await axios.get('/api/usuarios', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 📊 Resumen de Cambios Necesarios

| Archivo | Cambio Necesario | Prioridad |
|---------|------------------|-----------|
| `usuariosService.ts` | Agregar token a TODAS las funciones | 🔴 ALTA |
| `semillerosService.ts` | Agregar token solo a rutas `/mi-semillero/*` | 🔴 ALTA |
| `camposService.ts` | Agregar token solo a rutas `/mi-campo/*` | 🟡 MEDIA |
| `proyectosService.ts` | Agregar token a create/update/delete | 🟡 MEDIA |
| `actividadesService.ts` | Agregar token a create/update/delete | 🟡 MEDIA |
| `axios config` | Agregar interceptor para errores 401/403 | 🟢 BAJA |
| Crear `lineasInvestigacionService.ts` | Crear servicio para líneas (sin token) | 🟢 BAJA |

---

## ✅ Checklist para Frontend

- [ ] Crear helper `getAuthHeaders()` en cada servicio
- [ ] Modificar `usuariosService.ts` - agregar token a todas las funciones
- [ ] Modificar `semillerosService.ts` - agregar token a rutas `/mi-semillero/*`
- [ ] Modificar `camposService.ts` - agregar token a rutas `/mi-campo/*`
- [ ] Modificar `proyectosService.ts` - agregar token a create/update/delete
- [ ] Modificar `actividadesService.ts` - agregar token a create/update/delete
- [ ] Crear `lineasInvestigacionService.ts` para las nuevas rutas
- [ ] Agregar interceptor de axios para manejar errores 401/403
- [ ] Probar login con `maria.garcia@ucp.edu.co` / `admin123`
- [ ] Verificar que el token se guarda en localStorage
- [ ] Probar todas las rutas protegidas con el token
- [ ] Verificar que las rutas públicas funcionan sin token

---

## 📞 Contacto

Si tienen alguna duda o encuentran algún error:
1. Revisen la documentación completa en `docs/FIXES_REQUERIDOS.md`
2. Verifiquen que el servidor backend esté corriendo en `http://localhost:3000`
3. Usen las DevTools del navegador para ver los headers que están enviando

---

## 🎯 Credenciales de Prueba

Para testing:
- **Email:** `maria.garcia@ucp.edu.co`
- **Password:** `admin123`
- **Rol:** Líder de Semillero (rol 1)
- **Semillero:** Semillero TechLab

---

**Estado del Backend:** ✅ Listo y funcionando en puerto 3000  
**Fecha:** 8 de noviembre de 2025  
**Próximo paso:** Frontend debe implementar autenticación con tokens

¡Cualquier duda me avisan! 🚀
