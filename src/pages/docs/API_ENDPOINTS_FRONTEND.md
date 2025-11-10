# 📡 API ENDPOINTS - Documentación para Frontend

**Base URL:** `http://localhost:5000/api`

---

## 🌍 MÓDULO 1: LANDING PAGE (Rutas Públicas - Sin Autenticación)

### 📚 Semilleros de Investigación

#### ✅ Listar todos los semilleros
```http
GET /api/semilleros
GET /api/semilleros/activos  (solo semilleros activos)
```

**Response Example:**
```json
{
  "semilleros": [
    {
      "id": 1,
      "nombre": "Semillero TechLab",
      "descripcion": "Semillero de desarrollo de software...",
      "ruta_imagen": "/uploads/semilleros/techlab.jpg",
      "contacto": "techlab@ucp.edu.co",
      "activo": 1,
      "creado_en": "2024-01-15T10:00:00.000Z",
      "lider": {
        "id": 2,
        "nombre": "María González"
      },
      "linea_investigacion": "Desarrollo de Software",
      "campos": [
        {
          "id": 1,
          "nombre": "Desarrollo Web Full Stack"
        }
      ]
    }
  ]
}
```

#### ✅ Detalle de un semillero
```http
GET /api/semilleros/:id
```

**Response:** Incluye todos los campos de investigación asociados

---

### 🔬 Campos de Investigación

#### ✅ Listar todos los campos
```http
GET /api/campos
```

**Response Example:**
```json
{
  "campos": [
    {
      "id": 1,
      "nombre": "Desarrollo Web Full Stack",
      "descripcion": "Campo enfocado en desarrollo web...",
      "ruta_imagen": "/uploads/campos/web-fullstack.jpg",
      "lider": {
        "id": 2,
        "nombre": "María González"
      },
      "semillero": {
        "id": 1,
        "nombre": "Semillero TechLab"
      }
    }
  ]
}
```

#### ✅ Detalle de un campo
```http
GET /api/campos/:id
```

**Response:** Incluye proyectos e integrantes del campo

---

### 📂 Proyectos

#### ✅ Listar todos los proyectos
```http
GET /api/projects
GET /api/proyectos  (alias)
```

**Query Parameters:**
- `estado`: 1 (En progreso), 2 (En pausa), 3 (Finalizado)
- `campo`: ID del campo de investigación

**Response Example:**
```json
{
  "projects": [
    {
      "id": 1,
      "titulo": "Sistema de Gestión Universitaria",
      "descripcion": "Sistema web para gestión...",
      "ruta_foto": "/uploads/proyectos/sistema-universitario.jpg",
      "url": "https://github.com/...",
      "porcentaje_avance": 65.00,
      "fecha_creacion": "2024-11-06T...",
      "estado": {
        "id": 1,
        "estado": "En progreso"
      },
      "campo": {
        "id": 1,
        "nombre": "Desarrollo Web Full Stack"
      }
    }
  ]
}
```

#### ✅ Filtrar proyectos por estado
```http
GET /api/projects/filter?estado=1
```

#### ✅ Detalle de un proyecto
```http
GET /api/projects/:id
```

**Response:** Incluye todas las actividades del proyecto

---

### 👥 Integrantes de un Campo

#### ✅ Listar integrantes
```http
GET /api/integrantes?id_campo=1
```

**Response Example:**
```json
{
  "integrantes": [
    {
      "id": 1,
      "usuario": {
        "id": 2,
        "nombre": "María González",
        "correo": "maria.gonzalez@ucp.edu.co"
      },
      "rol": {
        "id": 2,
        "nombre": "Admin Campo"
      },
      "fecha_ingreso": "2024-01-15T10:00:00.000Z",
      "fecha_salida": null,
      "activo": true
    }
  ]
}
```

---

## 🔐 MÓDULO 2: AUTENTICACIÓN

### 🔑 Login

#### ✅ Iniciar sesión
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "correo": "santiago.ramirez@ucp.edu.co",
  "contrasena": "Password123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Santiago Ramírez",
    "correo": "santiago.ramirez@ucp.edu.co",
    "id_rol": 1,
    "rol": "Admin Semillero"
  }
}
```

#### ✅ Verificar token
```http
GET /api/auth/verify
```

**Headers:**
```
Authorization: Bearer <token>
```

#### ✅ Recuperar contraseña
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "correo": "usuario@ucp.edu.co"
}
```

---

## 👤 MÓDULO 3: GESTIÓN DE USUARIOS (Requiere Autenticación)

**Headers requeridos:**
```
Authorization: Bearer <token>
```

### ✅ Listar usuarios
```http
GET /api/users
```

### ✅ Crear usuario (Solo Admin Semillero)
```http
POST /api/users
```

**Request Body:**
```json
{
  "nombre": "Nuevo Usuario",
  "correo": "nuevo@ucp.edu.co",
  "contrasena": "Password123!",
  "id_rol": 2
}
```

### ✅ Actualizar usuario
```http
PUT /api/users/:id
```

### ✅ Eliminar usuario
```http
DELETE /api/users/:id
```

---

## 📊 MÓDULO 4: GESTIÓN DE SEMILLEROS (Admin Semillero)

**Headers:** `Authorization: Bearer <token>`

### ✅ Crear semillero
```http
POST /api/semilleros
```

**Request Body:**
```json
{
  "nombre": "Nuevo Semillero",
  "lider": 2,
  "descripcion": "Descripción del semillero...",
  "contacto": "semillero@ucp.edu.co",
  "lineas_investigacion_id": 1,
  "ruta_imagen": "/uploads/semilleros/nuevo.jpg"
}
```

### ✅ Actualizar semillero
```http
PUT /api/semilleros/:id
```

### ✅ Cerrar/Abrir semillero
```http
PATCH /api/semilleros/:id/estado
```

**Request Body:**
```json
{
  "activo": 0
}
```
- `activo: 1` = Abierto
- `activo: 0` = Cerrado

### ✅ Eliminar semillero (permanente)
```http
DELETE /api/semilleros/:id
```

---

## 🔬 MÓDULO 5: GESTIÓN DE CAMPOS (Admin Semillero/Campo)

**Headers:** `Authorization: Bearer <token>`

### ✅ Crear campo (Solo Admin Semillero)
```http
POST /api/campos
```

**Request Body:**
```json
{
  "nombre": "Nuevo Campo",
  "lider": 3,
  "descripcion": "Descripción del campo...",
  "id_semillero": 1,
  "ruta_imagen": "/uploads/campos/nuevo.jpg"
}
```

### ✅ Actualizar campo (Admin Campo o superior)
```http
PUT /api/campos/:id
```

### ✅ Eliminar campo (Solo Admin Semillero)
```http
DELETE /api/campos/:id
```

---

## 📁 MÓDULO 6: GESTIÓN DE PROYECTOS (Admin Campo)

**Headers:** `Authorization: Bearer <token>`

### ✅ Crear proyecto
```http
POST /api/projects
```

**Request Body:**
```json
{
  "titulo": "Nuevo Proyecto",
  "descripcion": "Descripción del proyecto...",
  "id_estado": 1,
  "id_campo": 1,
  "url": "https://github.com/...",
  "ruta_foto": "/uploads/proyectos/nuevo.jpg",
  "porcentaje_avance": 0
}
```

### ✅ Actualizar proyecto
```http
PUT /api/projects/:id
```

### ✅ Eliminar proyecto
```http
DELETE /api/projects/:id
```

---

## ✅ MÓDULO 7: GESTIÓN DE ACTIVIDADES (Admin Campo/Delegado)

**Headers:** `Authorization: Bearer <token>`

### ✅ Listar actividades de un proyecto
```http
GET /api/actividades?id_proyecto=1
```

### ✅ Crear actividad
```http
POST /api/actividades
```

**Request Body:**
```json
{
  "titulo": "Nueva Actividad",
  "descripcion": "Descripción de la actividad...",
  "id_proyecto": 1,
  "id_integrante": 3,
  "id_estado": 1,
  "prioridad": "Alta"
}
```

### ✅ Actualizar actividad
```http
PUT /api/actividades/:id
```

**Request Body (actualizar estado):**
```json
{
  "id_estado": 3,
  "descripcion": "Actividad completada con éxito"
}
```

### ✅ Eliminar actividad
```http
DELETE /api/actividades/:id
```

---

## 💬 MÓDULO 8: COMENTARIOS EN ACTIVIDADES

**Headers:** `Authorization: Bearer <token>`

### ✅ Listar comentarios de una actividad
```http
GET /api/comentarios?id_actividad=1
```

### ✅ Crear comentario
```http
POST /api/comentarios
```

**Request Body:**
```json
{
  "id_actividad": 1,
  "contenido": "Este es un comentario en la actividad"
}
```

### ✅ Eliminar comentario
```http
DELETE /api/comentarios/:id
```

---

## 👥 MÓDULO 9: GESTIÓN DE INTEGRANTES (Admin Campo)

**Headers:** `Authorization: Bearer <token>`

### ✅ Agregar integrante a campo
```http
POST /api/integrantes
```

**Request Body:**
```json
{
  "id_usuario": 9,
  "id_campo": 1,
  "id_rol": 4,
  "fecha_ingreso": "2024-11-06"
}
```

### ✅ Actualizar integrante
```http
PUT /api/integrantes/:id
```

### ✅ Dar de baja integrante
```http
DELETE /api/integrantes/:id
```

---

## 📈 MÓDULO 10: DASHBOARD (Todos los roles autenticados)

**Headers:** `Authorization: Bearer <token>`

### ✅ Dashboard según rol
```http
GET /api/dashboard
```

**Response según rol:**

**Admin Semillero:**
```json
{
  "semilleros": 3,
  "campos": 5,
  "proyectos": 12,
  "usuarios": 45
}
```

**Admin Campo:**
```json
{
  "misCampos": 2,
  "proyectos": 8,
  "integrantes": 15,
  "actividades_pendientes": 23
}
```

**Delegado/Colaborador:**
```json
{
  "mis_proyectos": 2,
  "mis_actividades": 5,
  "actividades_pendientes": 3,
  "actividades_completadas": 2
}
```

---

## 📊 MÓDULO 11: REPORTES (Admin Semillero/Campo)

**Headers:** `Authorization: Bearer <token>`

### ✅ Generar reporte de campo
```http
POST /api/reportes/campo/:id
```

**Response:** PDF con proyectos, integrantes, estado

### ✅ Generar reporte de semillero
```http
POST /api/reportes/semillero/:id
```

**Response:** PDF con todos los campos y estadísticas

---

## 🔍 MÓDULO 12: BÚSQUEDA

### ✅ Búsqueda global
```http
GET /api/busqueda?q=machine+learning
```

**Response:**
```json
{
  "semilleros": [...],
  "campos": [...],
  "proyectos": [...]
}
```

---

## 📤 MÓDULO 13: SUBIDA DE ARCHIVOS

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

### ✅ Subir imagen
```http
POST /api/uploads/imagen
```

**Form Data:**
```
imagen: [archivo]
tipo: "semillero" | "campo" | "proyecto"
```

**Response:**
```json
{
  "url": "/uploads/semilleros/imagen-123456.jpg"
}
```

---

## 🚦 CÓDIGOS DE ESTADO HTTP

- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Error en los datos enviados
- `401` - No autenticado (token inválido o expirado)
- `403` - No autorizado (sin permisos para esta acción)
- `404` - Recurso no encontrado
- `500` - Error del servidor

---

## 🔐 ROLES Y PERMISOS

### Jerarquía de Roles:
1. **Admin Semillero** (id: 1) - Acceso total
2. **Admin Campo** (id: 2) - Gestión de su campo
3. **Delegado** (id: 3) - Asignación de tareas
4. **Colaborador** (id: 4) - Actualización de actividades propias

### Matriz de Permisos:

| Acción | Colaborador | Delegado | Admin Campo | Admin Semillero |
|--------|-------------|----------|-------------|-----------------|
| Ver información pública | ✅ | ✅ | ✅ | ✅ |
| Actualizar mis actividades | ✅ | ✅ | ✅ | ✅ |
| Crear actividades | ❌ | ✅ | ✅ | ✅ |
| Gestionar integrantes | ❌ | ❌ | ✅ | ✅ |
| Gestionar proyectos | ❌ | ❌ | ✅ | ✅ |
| Gestionar campos | ❌ | ❌ | ❌ | ✅ |
| Gestionar semilleros | ❌ | ❌ | ❌ | ✅ |
| Crear usuarios | ❌ | ❌ | ❌ | ✅ |

---

## 🧪 DATOS DE PRUEBA

### Usuarios de prueba:
```
Admin Semillero:
- Email: santiago.ramirez@ucp.edu.co
- Password: Password123!

Admin Campo:
- Email: maria.gonzalez@ucp.edu.co
- Password: Password123!

Delegado:
- Email: andres.torres@ucp.edu.co
- Password: Password123!

Colaborador:
- Email: juan.martinez@est.ucp.edu.co
- Password: Password123!
```

---

## 📌 NOTAS IMPORTANTES

1. **Todos los endpoints protegidos requieren el header:**
   ```
   Authorization: Bearer <token>
   ```

2. **El token expira en 24 horas**

3. **Las imágenes deben ser JPG/PNG, máximo 5MB**

4. **Fechas en formato ISO 8601:** `2024-11-06T10:00:00.000Z`

5. **Paginación disponible en:** Agregar `?page=1&limit=10` a endpoints de listado

6. **CORS habilitado** para desarrollo en `localhost:3000` y `localhost:5173`

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### **Fase 1: Landing Page**
- `GET /api/semilleros/activos`
- `GET /api/campos`
- `GET /api/projects`

### **Fase 2: Autenticación**
- `POST /api/auth/login`
- `GET /api/auth/verify`

### **Fase 3: Dashboard por Rol**
- `GET /api/dashboard`

### **Fase 4: CRUD según rol**
- Admin Semillero: Semilleros + Campos + Usuarios
- Admin Campo: Proyectos + Integrantes + Actividades
- Delegado: Actividades + Asignaciones
- Colaborador: Actualizar estado de actividades

---

**¿Necesitas más detalles de algún endpoint específico?** 🚀
