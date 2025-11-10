# 🚀 Backend: Implementación de Endpoints para Líder de Semillero

## 📌 Contexto

El frontend necesita que implementes los endpoints descritos en `BackendGestorProyectos/docs/FRONTEND_LIDER_SEMILLERO.md` para que el **Líder de Semillero (rol 1)** pueda gestionar su semillero y sus campos de investigación.

## ❌ Error Actual

El frontend está intentando hacer esta petición:
```
GET http://localhost:3000/api/semilleros/mi-semillero/info
```

Y está obteniendo **500 Internal Server Error**, lo que significa que la ruta existe pero tiene un bug.

---

## 🎯 Endpoints a Implementar/Corregir

### 1. ✅ GET `/api/semilleros/mi-semillero/info`

**Estado:** Existe pero falla (500 error)

**Funcionalidad:** Obtener información del semillero que lidera el usuario autenticado

**Headers requeridos:**
```
Authorization: Bearer <token>
```

**Lógica:**
```javascript
// 1. Verificar que el usuario esté autenticado (middleware)
// 2. Obtener el ID del usuario desde req.usuario (viene del middleware de auth)
// 3. Buscar el semillero donde el campo 'lider' sea igual al ID del usuario
// 4. Si no encuentra semillero, retornar 404
// 5. Incluir en la respuesta:
//    - Datos del semillero
//    - Información de la línea de investigación (JOIN)
//    - Información del líder (JOIN con usuarios)
```

**Respuesta exitosa (200):**
```json
{
  "semillero": {
    "id": 1,
    "nombre": "Semillero TechLab",
    "lider": 2,
    "ruta_imagen": "https://res.cloudinary.com/.../imagen.jpg",
    "descripcion": "Descripción del semillero",
    "contacto": "techlab@ucp.edu.co",
    "creado_en": "2024-01-15T15:00:00.000Z",
    "lineas_investigacion_id": 1,
    "activo": 1,
    "linea": {
      "id": 1,
      "nombre": "Desarrollo de Software"
    },
    "liderUsuario": {
      "id": 2,
      "nombre": "María García",
      "correo": "maria.garcia@ucp.edu.co"
    }
  }
}
```

**Query SQL sugerido:**
```sql
SELECT 
  s.*,
  l.id as linea_id,
  l.nombre as linea_nombre,
  u.id as lider_id,
  u.nombre as lider_nombre,
  u.correo as lider_correo
FROM semilleros s
LEFT JOIN lineas_investigacion l ON s.lineas_investigacion_id = l.id
LEFT JOIN usuarios u ON s.lider = u.id
WHERE s.lider = ?
```

**Error esperado:**
```json
// 404 si no tiene semillero asignado
{
  "message": "No tienes un semillero asignado. Contacta al administrador."
}
```

---

### 2. ❓ PUT `/api/semilleros/mi-semillero/actualizar`

**Funcionalidad:** Actualizar información del semillero (con imagen opcional)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```javascript
{
  nombre: "Semillero Actualizado" (opcional),
  descripcion: "Nueva descripción" (opcional),
  contacto: "nuevo@email.com" (opcional, validar formato email),
  imagen: File (opcional, JPG/PNG/WebP, max 5MB)
}
```

**Lógica:**
```javascript
// 1. Verificar autenticación
// 2. Obtener semillero del usuario (donde lider = req.usuario.id)
// 3. Si no existe, retornar 404
// 4. Validar que al menos un campo se está actualizando
// 5. Si hay contacto, validar formato email
// 6. Si hay imagen:
//    - Validar tipo (JPG, PNG, WebP)
//    - Validar tamaño (max 5MB)
//    - Subir a Cloudinary
//    - Si ya había imagen anterior, eliminarla de Cloudinary
// 7. Actualizar base de datos
// 8. Retornar semillero actualizado
```

**Respuesta exitosa (200):**
```json
{
  "message": "Semillero actualizado exitosamente",
  "semillero": {
    "id": 1,
    "nombre": "Semillero Actualizado",
    "descripcion": "Nueva descripción",
    "contacto": "nuevo@email.com",
    "ruta_imagen": "https://res.cloudinary.com/.../nueva-imagen.jpg",
    "activo": 1
  }
}
```

**Errores esperados:**
```json
// 400 - Email inválido
{ "message": "El email de contacto no es válido" }

// 400 - Sin campos
{ "message": "No se proporcionaron campos para actualizar" }

// 404 - Sin semillero
{ "message": "No tienes un semillero asignado" }

// 500 - Error de imagen
{ "message": "Error al subir la imagen" }
```

---

### 3. ❓ DELETE `/api/semilleros/mi-semillero/imagen`

**Funcionalidad:** Eliminar la imagen del semillero (Cloudinary + DB)

**Headers:**
```
Authorization: Bearer <token>
```

**Lógica:**
```javascript
// 1. Verificar autenticación
// 2. Obtener semillero del usuario
// 3. Verificar que tenga imagen (ruta_imagen no null)
// 4. Eliminar de Cloudinary usando el public_id
// 5. Actualizar BD: SET ruta_imagen = NULL
// 6. Retornar éxito
```

**Respuesta exitosa (200):**
```json
{
  "message": "Imagen eliminada exitosamente"
}
```

**Errores:**
```json
// 404 - Sin imagen
{ "message": "El semillero no tiene imagen" }

// 404 - Sin semillero
{ "message": "No tienes un semillero asignado" }
```

---

### 4. ❓ PATCH `/api/semilleros/mi-semillero/estado`

**Funcionalidad:** Abrir o cerrar el semillero

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "activo": 1  // 1 = abierto, 0 = cerrado
}
```

**Lógica:**
```javascript
// 1. Verificar autenticación
// 2. Validar que 'activo' sea 0 o 1
// 3. Obtener semillero del usuario
// 4. Actualizar campo 'activo' en BD
// 5. Retornar mensaje de éxito
```

**Respuesta exitosa (200):**
```json
{
  "message": "Semillero abierto exitosamente",
  "activo": 1
}
```

O si se cierra:
```json
{
  "message": "Semillero cerrado exitosamente",
  "activo": 0
}
```

**Errores:**
```json
// 400 - Valor inválido
{ "message": "El campo 'activo' debe ser 0 (cerrado) o 1 (abierto)" }

// 404
{ "message": "No tienes un semillero asignado" }
```

---

### 5. ❓ GET `/api/semilleros/mi-semillero/campos`

**Funcionalidad:** Obtener todos los campos del semillero del líder

**Headers:**
```
Authorization: Bearer <token>
```

**Lógica:**
```javascript
// 1. Verificar autenticación
// 2. Obtener semillero del usuario (WHERE lider = req.usuario.id)
// 3. Si no existe, retornar 404
// 4. Buscar todos los campos donde id_semillero = semillero.id
// 5. Para cada campo, incluir información del líder del campo (JOIN)
// 6. Retornar array de campos
```

**Query SQL sugerido:**
```sql
-- Primero obtener el semillero del usuario
SELECT id FROM semilleros WHERE lider = ?

-- Luego obtener los campos
SELECT 
  c.*,
  u.id as lider_id,
  u.nombre as lider_nombre,
  u.correo as lider_correo
FROM campos_investigacion c
LEFT JOIN usuarios u ON c.lider = u.id
WHERE c.id_semillero = ?
ORDER BY c.activo DESC, c.nombre ASC
```

**Respuesta exitosa (200):**
```json
{
  "campos": [
    {
      "id": 1,
      "nombre": "Desarrollo Web Full Stack",
      "lider": 21,
      "descripcion": "Campo enfocado en desarrollo web moderno",
      "ruta_imagen": "https://res.cloudinary.com/.../campo.jpg",
      "id_semillero": 1,
      "activo": 1,
      "liderUsuario": {
        "id": 21,
        "nombre": "Carlos Rodríguez",
        "correo": "carlos.rodriguez@ucp.edu.co"
      }
    },
    {
      "id": 2,
      "nombre": "Machine Learning",
      "lider": 22,
      "descripcion": "Investigación en inteligencia artificial",
      "ruta_imagen": null,
      "id_semillero": 1,
      "activo": 0,
      "liderUsuario": {
        "id": 22,
        "nombre": "Ana Martínez",
        "correo": "ana.martinez@ucp.edu.co"
      }
    }
  ],
  "total": 2
}
```

**Errores:**
```json
// 404
{ "message": "No tienes un semillero asignado" }
```

---

### 6. ❓ PATCH `/api/campos/:id/estado`

**Funcionalidad:** Abrir o cerrar un campo (solo si pertenece al semillero del líder)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parámetros de URL:**
- `id` (number): ID del campo a modificar

**Body:**
```json
{
  "activo": 1  // 1 = abierto, 0 = cerrado
}
```

**Lógica:**
```javascript
// 1. Verificar autenticación
// 2. Validar que 'activo' sea 0 o 1
// 3. Obtener campo por ID
// 4. Verificar que el campo existe
// 5. Obtener semillero del usuario
// 6. VERIFICAR QUE campo.id_semillero === semillero.id (SEGURIDAD)
// 7. Si no coincide, retornar 403 (Forbidden)
// 8. Actualizar campo 'activo'
// 9. Retornar éxito
```

**Query SQL de verificación:**
```sql
-- Verificar que el campo pertenece al semillero del usuario
SELECT c.id 
FROM campos_investigacion c
INNER JOIN semilleros s ON c.id_semillero = s.id
WHERE c.id = ? AND s.lider = ?
```

**Respuesta exitosa (200):**
```json
{
  "message": "Campo abierto exitosamente",
  "campo": {
    "id": 1,
    "nombre": "Desarrollo Web Full Stack",
    "activo": 1
  }
}
```

**Errores:**
```json
// 400 - Valor inválido
{ "message": "El campo 'activo' debe ser 0 (cerrado) o 1 (abierto)" }

// 403 - Sin permisos
{ "message": "No tienes permisos para modificar este campo. Solo puedes modificar campos de tu semillero." }

// 404 - Campo no encontrado
{ "message": "Campo no encontrado" }
```

---

## 🔒 Consideraciones de Seguridad

### ⚠️ IMPORTANTE: Validaciones Requeridas

1. **Autenticación:** Todos los endpoints DEBEN verificar token JWT válido
2. **Verificación de Rol:** Solo usuarios con `id_rol = 1` pueden acceder
3. **Verificación de Propiedad:** 
   - El usuario solo puede modificar **su propio semillero** (WHERE lider = req.usuario.id)
   - El usuario solo puede modificar **campos de su semillero** (verificar id_semillero)
4. **Sanitización de Inputs:** Limpiar textos para prevenir XSS
5. **Validación de Emails:** Usar regex o librería de validación
6. **Validación de Imágenes:**
   - Tipos permitidos: JPG, PNG, WebP
   - Tamaño máximo: 5MB
   - Eliminar imagen anterior de Cloudinary al actualizar

---

## 📦 Estructura de Archivos Backend Sugerida

```
BackendGestorProyectos/
├── src/
│   ├── routes/
│   │   └── semilleros.routes.js (agregar nuevas rutas)
│   ├── controllers/
│   │   └── semilleros.controller.js (agregar nuevos métodos)
│   └── middlewares/
│       ├── auth.middleware.js (verificar token)
│       └── roles.middleware.js (verificar rol)
```

---

## 🧪 Testing

### Credenciales de Prueba

```javascript
// Usuario: Líder de Semillero
{
  correo: "maria.garcia@ucp.edu.co",
  contraseña: "admin123",
  id_rol: 1,
  id_semillero_liderado: 1
}
```

### Pruebas con cURL/PowerShell

```powershell
# 1. Login
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"correo":"maria.garcia@ucp.edu.co","contrasena":"admin123"}' `
  | Select-Object -ExpandProperty Content

# Guardar el token que te devuelve

# 2. Obtener mi semillero
Invoke-WebRequest -Uri "http://localhost:3000/api/semilleros/mi-semillero/info" `
  -Headers @{"Authorization"="Bearer <token>"} `
  | Select-Object -ExpandProperty Content

# 3. Obtener mis campos
Invoke-WebRequest -Uri "http://localhost:3000/api/semilleros/mi-semillero/campos" `
  -Headers @{"Authorization"="Bearer <token>"} `
  | Select-Object -ExpandProperty Content

# 4. Cambiar estado de mi semillero
Invoke-WebRequest -Uri "http://localhost:3000/api/semilleros/mi-semillero/estado" `
  -Method PATCH `
  -Headers @{"Authorization"="Bearer <token>"} `
  -ContentType "application/json" `
  -Body '{"activo":0}' `
  | Select-Object -ExpandProperty Content

# 5. Cambiar estado de un campo
Invoke-WebRequest -Uri "http://localhost:3000/api/campos/1/estado" `
  -Method PATCH `
  -Headers @{"Authorization"="Bearer <token>"} `
  -ContentType "application/json" `
  -Body '{"activo":0}' `
  | Select-Object -ExpandProperty Content
```

---

## ✅ Checklist de Implementación

- [ ] Corregir GET `/api/semilleros/mi-semillero/info` (actualmente da error 500)
- [ ] Implementar PUT `/api/semilleros/mi-semillero/actualizar`
- [ ] Implementar DELETE `/api/semilleros/mi-semillero/imagen`
- [ ] Implementar PATCH `/api/semilleros/mi-semillero/estado`
- [ ] Implementar GET `/api/semilleros/mi-semillero/campos`
- [ ] Implementar PATCH `/api/campos/:id/estado`
- [ ] Verificar que todos los endpoints requieren autenticación
- [ ] Verificar que solo rol 1 puede acceder
- [ ] Verificar que solo modifica su propio semillero/campos
- [ ] Probar con Postman/cURL cada endpoint
- [ ] Probar casos de error (404, 403, 400)
- [ ] Documentar errores en logs del servidor

---

## 📞 Contacto

Si tienes dudas sobre la implementación o los formatos de respuesta, consulta el archivo completo:
**`BackendGestorProyectos/docs/FRONTEND_LIDER_SEMILLERO.md`**

---

**Fecha:** 8 de noviembre de 2025  
**Prioridad:** 🔴 ALTA - El frontend ya está implementado y esperando estos endpoints
