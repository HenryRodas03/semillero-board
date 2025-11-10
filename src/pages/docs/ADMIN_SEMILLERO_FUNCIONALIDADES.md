# Funcionalidades del Admin Semillero (Admin de Admins)

**Rol ID:** 1  
**Nombre:** Admin Semillero  
**Descripción:** Máximo nivel de administración con control total sobre semilleros, campos de investigación, usuarios y toda la plataforma.

---

## 📋 Funcionalidades Implementadas

### 1️⃣ **Gestión de Semilleros** ✅

#### Crear Semillero
- **Endpoint:** `POST /api/semilleros`
- **Autenticación:** ✅ JWT Token + Admin Semillero
- **Campos requeridos:**
  - `nombre` (string, max 100 caracteres)
  - `lider` (integer, ID del usuario líder)
  - `descripcion` (text)
  - `lineas_investigacion_id` (integer, ID de línea de investigación)
- **Campos opcionales:**
  - `ruta_imagen` (string, ruta de imagen del semillero)
  - `contacto` (string, email o teléfono)
  - `activo` (tinyint, default: 1)

**Ejemplo Request:**
```json
POST /api/semilleros
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "nombre": "Semillero de IA",
  "lider": 2,
  "descripcion": "Investigación en inteligencia artificial",
  "lineas_investigacion_id": 1,
  "contacto": "ia@ucp.edu.co",
  "ruta_imagen": "/uploads/semilleros/ia.jpg"
}
```

**Response:**
```json
{
  "message": "Semillero creado",
  "semillero": {
    "id": 5,
    "nombre": "Semillero de IA",
    "lider": 2,
    "descripcion": "Investigación en inteligencia artificial",
    "lineas_investigacion_id": 1,
    "contacto": "ia@ucp.edu.co",
    "ruta_imagen": "/uploads/semilleros/ia.jpg",
    "activo": 1,
    "creado_en": "2025-11-06T15:30:00.000Z"
  }
}
```

---

#### Actualizar Semillero
- **Endpoint:** `PUT /api/semilleros/:id`
- **Autenticación:** ✅ JWT Token + Admin Semillero
- **Campos actualizables:** Todos los campos del semillero

**Ejemplo Request:**
```json
PUT /api/semilleros/5
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "nombre": "Semillero de IA Avanzada",
  "descripcion": "Investigación avanzada en IA y ML"
}
```

**Response:**
```json
{
  "message": "Semillero actualizado"
}
```

---

#### Cerrar/Abrir Semillero (NUEVO) 🆕
- **Endpoint:** `PATCH /api/semilleros/:id/estado`
- **Autenticación:** ✅ JWT Token + Admin Semillero
- **Descripción:** Permite cerrar un semillero sin eliminarlo, preservando su historial
- **Campo requerido:**
  - `activo` (0 = cerrado, 1 = abierto)

**Ejemplo Request - Cerrar semillero:**
```json
PATCH /api/semilleros/5/estado
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "activo": 0
}
```

**Response:**
```json
{
  "message": "Semillero cerrado exitosamente",
  "semillero": {
    "id": 5,
    "nombre": "Semillero de IA Avanzada",
    "activo": 0,
    ...
  }
}
```

**Ejemplo Request - Abrir semillero:**
```json
PATCH /api/semilleros/5/estado
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "activo": 1
}
```

---

#### Eliminar Semillero
- **Endpoint:** `DELETE /api/semilleros/:id`
- **Autenticación:** ✅ JWT Token + Admin Semillero
- **⚠️ ADVERTENCIA:** Elimina permanentemente el semillero y TODOS sus campos asociados (CASCADE)

**Ejemplo Request:**
```json
DELETE /api/semilleros/5
Headers: { "Authorization": "Bearer <token>" }
```

**Response:**
```json
{
  "message": "Semillero eliminado"
}
```

---

#### Listar Todos los Semilleros
- **Endpoint:** `GET /api/semilleros`
- **Autenticación:** ❌ Pública
- **Descripción:** Retorna TODOS los semilleros (activos e inactivos) con sus relaciones

**Response:**
```json
{
  "semilleros": [
    {
      "id": 1,
      "nombre": "Semillero Tech",
      "activo": 1,
      "lider": 2,
      "linea": {
        "id": 1,
        "nombre": "Desarrollo de Software"
      },
      "liderUsuario": {
        "id": 2,
        "nombre": "Juan Pérez",
        "correo": "juan@ucp.edu.co"
      }
    }
  ]
}
```

---

#### Listar Semilleros Activos (NUEVO) 🆕
- **Endpoint:** `GET /api/semilleros/activos`
- **Autenticación:** ❌ Pública
- **Descripción:** Retorna solo semilleros con `activo = 1`

**Response:**
```json
{
  "semilleros": [
    {
      "id": 1,
      "nombre": "Semillero Tech",
      "activo": 1,
      ...
    }
  ]
}
```

---

#### Ver Detalle de Semillero
- **Endpoint:** `GET /api/semilleros/:id`
- **Autenticación:** ❌ Pública
- **Descripción:** Retorna un semillero con sus campos de investigación

**Response:**
```json
{
  "semillero": {
    "id": 1,
    "nombre": "Semillero Tech",
    "activo": 1,
    ...
  },
  "campos": [
    {
      "id": 1,
      "nombre": "Desarrollo Web",
      "id_semillero": 1
    }
  ]
}
```

---

### 2️⃣ **Gestión de Campos de Investigación** ✅

#### Crear Campo de Investigación
- **Endpoint:** `POST /api/campos`
- **Autenticación:** ✅ JWT Token + Admin Semillero
- **Campos requeridos:**
  - `nombre` (string, max 100)
  - `lider` (integer, ID del usuario líder)
  - `descripcion` (text)
  - `id_semillero` (integer, **DEBE pertenecer a un semillero**)
- **Campos opcionales:**
  - `ruta_imagen` (string)
  - `horario_reunion` (string)
  - `contacto_email` (string, validado)
  - `contacto_redes_sociales` (JSON, validado)

**Validaciones automáticas:**
- ✅ Email válido si se proporciona
- ✅ Redes sociales con formato correcto
- ✅ Sanitización de textos (XSS prevention)

**Ejemplo Request:**
```json
POST /api/campos
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "nombre": "Desarrollo Backend",
  "lider": 3,
  "descripcion": "Investigación en arquitecturas backend",
  "id_semillero": 1,
  "horario_reunion": "Viernes 3:00 PM",
  "contacto_email": "backend@ucp.edu.co",
  "contacto_redes_sociales": {
    "instagram": "@backend_ucp",
    "linkedin": "backend-research-ucp"
  }
}
```

**Response:**
```json
{
  "message": "Campo de investigación creado",
  "campo": {
    "id": 10,
    "nombre": "Desarrollo Backend",
    "lider": 3,
    "id_semillero": 1,
    ...
  }
}
```

---

#### Actualizar Campo de Investigación
- **Endpoint:** `PUT /api/campos/:id`
- **Autenticación:** ✅ JWT Token + Admin Campo (o superior)
- **Descripción:** Admin Campo puede actualizar SU campo, Admin Semillero puede actualizar CUALQUIER campo

---

#### Eliminar Campo de Investigación
- **Endpoint:** `DELETE /api/campos/:id`
- **Autenticación:** ✅ JWT Token + Admin Semillero
- **⚠️ ADVERTENCIA:** Elimina el campo y TODOS sus proyectos asociados (CASCADE)

---

#### Listar Todos los Campos
- **Endpoint:** `GET /api/campos`
- **Autenticación:** ❌ Pública

---

#### Ver Detalle de Campo
- **Endpoint:** `GET /api/campos/:id`
- **Autenticación:** ❌ Pública
- **Descripción:** Retorna el campo con sus proyectos e integrantes

---

### 3️⃣ **Gestión de Usuarios** ✅

#### Crear Usuario (Registro)
- **Endpoint:** `POST /api/auth/register`
- **Autenticación:** ✅ JWT Token + Admin Campo (o superior)
- **Campos requeridos:**
  - `nombre` (string)
  - `correo` (email único)
  - `contrasena` (string, min 6 caracteres)
  - `id_rol` (integer, debe ser un rol asignable por el usuario actual)

**Restricciones según jerarquía:**
- Admin Semillero (rol 1) → puede crear roles: 2, 3, 4
- Admin Campo (rol 2) → puede crear roles: 3, 4
- Delegado (rol 3) → puede crear rol: 4
- Colaborador (rol 4) → no puede crear usuarios

---

#### Obtener Roles Asignables
- **Endpoint:** `GET /api/roles/asignables`
- **Autenticación:** ✅ JWT Token + Admin Campo (o superior)
- **Descripción:** Retorna los roles que el usuario actual puede asignar

**Response para Admin Semillero:**
```json
{
  "roles": [
    { "id": 2, "nombre": "Admin Campo" },
    { "id": 3, "nombre": "Delegado" },
    { "id": 4, "nombre": "Colaborador" }
  ],
  "userRole": 1,
  "message": "Como Admin Semillero puedes asignar roles: Admin Campo, Delegado, Colaborador"
}
```

---

### 4️⃣ **Visualización Global** ✅

#### Dashboard de Estadísticas
- **Endpoint:** `GET /api/dashboard/estadisticas`
- **Autenticación:** ✅ JWT Token
- **Descripción:** Estadísticas completas de la plataforma

**Response:**
```json
{
  "totalUsuarios": 20,
  "totalSemilleros": 4,
  "totalCampos": 9,
  "totalProyectos": 13,
  "proyectosActivos": 10,
  "proyectosEnPausa": 2,
  "proyectosFinalizados": 1
}
```

---

## 🗄️ Base de Datos

### Migración Requerida

Para habilitar la funcionalidad de cerrar/abrir semilleros, ejecuta:

```sql
-- Archivo: migrations/add_semillero_estado.sql
USE `gestion_proyectos_db`;

ALTER TABLE `semilleros`
ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1 
COMMENT 'Indica si el semillero está activo (1) o cerrado (0)';

UPDATE `semilleros` SET `activo` = 1;
```

---

## 🔐 Permisos Resumidos

| Acción | Admin Semillero | Admin Campo | Delegado | Colaborador |
|--------|----------------|-------------|----------|-------------|
| Crear semillero | ✅ | ❌ | ❌ | ❌ |
| Actualizar semillero | ✅ | ❌ | ❌ | ❌ |
| Cerrar/Abrir semillero | ✅ | ❌ | ❌ | ❌ |
| Eliminar semillero | ✅ | ❌ | ❌ | ❌ |
| Crear campo | ✅ | ❌ | ❌ | ❌ |
| Actualizar campo | ✅ | ✅ (su campo) | ❌ | ❌ |
| Eliminar campo | ✅ | ❌ | ❌ | ❌ |
| Crear usuarios | ✅ | ✅ | ✅ | ❌ |
| Ver estadísticas | ✅ | ✅ | ✅ | ✅ |

---

## 📝 Notas Importantes

1. **Cerrar vs Eliminar Semillero:**
   - ⭐ **RECOMENDADO:** Usar `PATCH /api/semilleros/:id/estado` con `activo: 0` para cerrar
   - ⚠️ **NO RECOMENDADO:** `DELETE /api/semilleros/:id` elimina permanentemente

2. **Relación Semillero-Campo:**
   - Todo campo DEBE pertenecer a un semillero (`id_semillero` requerido)
   - Si eliminas un semillero, se eliminan TODOS sus campos (CASCADE)
   - Si cierras un semillero, los campos permanecen pero el semillero no acepta nuevos registros

3. **Jerarquía de Roles:**
   - Admin Semillero (1) > Admin Campo (2) > Delegado (3) > Colaborador (4)
   - Cada nivel solo puede crear usuarios de niveles inferiores

---

## 🚀 Próximos Pasos

- [ ] Filtrar semilleros cerrados en endpoints públicos (opcional)
- [ ] Agregar validación: no permitir crear campos en semilleros cerrados
- [ ] Implementar soft-delete para campos también
- [ ] Dashboard con gráficas de semilleros activos vs cerrados
- [ ] Historial de cambios de estado de semilleros
