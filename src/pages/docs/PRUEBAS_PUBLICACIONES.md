# 🧪 GUÍA DE PRUEBAS - API de Publicaciones

**Universidad Católica de Pereira - Sistema de Publicaciones**

---

## 🚀 **PASO 1: Reiniciar el Servidor**

```bash
# En la terminal del backend
npm start
```

**✅ Deberías ver:**
```
Servidor corriendo en puerto 3000
Conectado a la base de datos MySQL
```

---

## 📡 **ENDPOINTS DISPONIBLES:**

### **PÚBLICOS (No requieren autenticación):**
- `GET /api/publicaciones` - Todas las publicaciones
- `GET /api/publicaciones/campo/:id` - Publicaciones de un campo
- `GET /api/publicaciones/:id` - Detalle de una publicación

### **PROTEGIDOS (Requieren token JWT):**
- `GET /api/publicaciones/mis-publicaciones` - Mis publicaciones
- `POST /api/publicaciones` - Crear publicación
- `PUT /api/publicaciones/:id` - Actualizar publicación
- `DELETE /api/publicaciones/:id/imagen` - Eliminar imagen específica
- `DELETE /api/publicaciones/:id` - Eliminar publicación
- `PATCH /api/publicaciones/:id/estado` - Activar/Desactivar

---

## 🧪 **PRUEBAS CON POSTMAN/THUNDER CLIENT:**

### **PRUEBA 1: Listar todas las publicaciones (PÚBLICO)**

```http
GET http://localhost:3000/api/publicaciones
```

**Response esperada:**
```json
{
  "total": 6,
  "publicaciones": [
    {
      "id": 1,
      "id_campo": 1,
      "titulo": "Taller de React JS 2024",
      "descripcion": "Se llevó a cabo el taller...",
      "tipo": "Evento",
      "imagen_1": null,
      "imagen_2": null,
      "imagen_3": null,
      "fecha_publicacion": "2024-11-07T...",
      "campo_nombre": "Desarrollo Web Full Stack",
      "campo_imagen": "/uploads/campos/web-fullstack.jpg",
      "autor_nombre": "María González",
      "autor_correo": "maria.gonzalez@ucp.edu.co"
    },
    ...
  ]
}
```

---

### **PRUEBA 2: Publicaciones de un campo específico (PÚBLICO)**

```http
GET http://localhost:3000/api/publicaciones/campo/1
```

**Response esperada:**
```json
{
  "campo_id": 1,
  "total": 2,
  "publicaciones": [...]
}
```

---

### **PRUEBA 3: Iniciar sesión (Obtener token)**

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "correo": "maria.gonzalez@ucp.edu.co",
  "contrasena": "Password123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "nombre": "María González",
    "correo": "maria.gonzalez@ucp.edu.co",
    "id_rol": 2
  }
}
```

**📋 Copia el token para las siguientes pruebas**

---

### **PRUEBA 4: Ver mis publicaciones**

```http
GET http://localhost:3000/api/publicaciones/mis-publicaciones
Authorization: Bearer <tu-token-aquí>
```

---

### **PRUEBA 5: Crear publicación SIN imágenes**

```http
POST http://localhost:3000/api/publicaciones
Authorization: Bearer <token-de-maria-gonzalez>
Content-Type: application/json

{
  "id_campo": 1,
  "titulo": "Certificación AWS completada",
  "descripcion": "5 estudiantes del campo obtuvieron la certificación AWS Cloud Practitioner después de 3 meses de preparación intensiva.",
  "tipo": "Logro"
}
```

**✅ Response esperada:**
```json
{
  "mensaje": "Publicación creada exitosamente",
  "publicacion": {
    "id": 7,
    "id_campo": 1,
    "titulo": "Certificación AWS completada",
    "descripcion": "5 estudiantes del campo...",
    "tipo": "Logro",
    "imagen_1": null,
    "imagen_2": null,
    "imagen_3": null,
    "campo_nombre": "Desarrollo Web Full Stack",
    "autor_nombre": "María González"
  }
}
```

---

### **PRUEBA 6: Crear publicación CON 3 IMÁGENES**

**En Postman/Thunder Client:**

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/publicaciones`
3. **Headers:**
   - `Authorization: Bearer <tu-token>`
4. **Body:** `form-data`
   - `id_campo`: `1` (text)
   - `titulo`: `Proyecto Final Presentado` (text)
   - `descripcion`: `Los estudiantes presentaron sus proyectos finales...` (text)
   - `tipo`: `Evento` (text)
   - `imagen_1`: [Seleccionar archivo JPG/PNG] (file)
   - `imagen_2`: [Seleccionar archivo JPG/PNG] (file)
   - `imagen_3`: [Seleccionar archivo JPG/PNG] (file)

**✅ Response esperada:**
```json
{
  "mensaje": "Publicación creada exitosamente",
  "publicacion": {
    "id": 8,
    "imagen_1": "https://res.cloudinary.com/dw9krxrn4/image/upload/v.../semilleros-ucp/publicaciones/abc123.jpg",
    "imagen_2": "https://res.cloudinary.com/dw9krxrn4/image/upload/v.../semilleros-ucp/publicaciones/def456.jpg",
    "imagen_3": "https://res.cloudinary.com/dw9krxrn4/image/upload/v.../semilleros-ucp/publicaciones/ghi789.jpg"
  }
}
```

---

### **PRUEBA 7: Actualizar publicación**

```http
PUT http://localhost:3000/api/publicaciones/7
Authorization: Bearer <tu-token>
Content-Type: application/json

{
  "titulo": "Certificación AWS completada - Actualización",
  "descripcion": "Ahora son 8 estudiantes certificados!"
}
```

---

### **PRUEBA 8: Eliminar una imagen específica**

```http
DELETE http://localhost:3000/api/publicaciones/8/imagen
Authorization: Bearer <tu-token>
Content-Type: application/json

{
  "imagen": "imagen_2"
}
```

**✅ Response:**
```json
{
  "mensaje": "Imagen imagen_2 eliminada exitosamente"
}
```

---

### **PRUEBA 9: Desactivar publicación (soft delete)**

```http
DELETE http://localhost:3000/api/publicaciones/7
Authorization: Bearer <tu-token>
```

**✅ Response:**
```json
{
  "mensaje": "Publicación eliminada exitosamente"
}
```

---

### **PRUEBA 10: Activar/Desactivar publicación**

```http
PATCH http://localhost:3000/api/publicaciones/7/estado
Authorization: Bearer <tu-token>
Content-Type: application/json

{
  "activo": 1
}
```

---

## ⚠️ **VALIDACIONES IMPORTANTES:**

### **1. Solo el líder del campo puede crear publicaciones**
Si intentas crear con un usuario que NO es líder:
```json
{
  "mensaje": "Solo el líder del campo puede crear publicaciones"
}
```

### **2. Solo el autor puede editar/eliminar**
Si intentas editar una publicación de otro usuario:
```json
{
  "mensaje": "Solo el autor puede editar esta publicación"
}
```

### **3. Máximo 3 imágenes**
El middleware `upload.fields()` limita a 1 archivo por campo (imagen_1, imagen_2, imagen_3).

### **4. Tipos de archivo permitidos**
Solo JPG, PNG, GIF, WebP (según tu middleware de upload).

---

## 🔍 **VERIFICACIÓN EN BASE DE DATOS:**

```sql
-- Ver todas las publicaciones con detalles
SELECT 
    p.id,
    c.nombre AS campo,
    u.nombre AS autor,
    p.titulo,
    p.tipo,
    CASE 
        WHEN p.imagen_1 IS NOT NULL THEN '✅' ELSE '❌'
    END AS img1,
    CASE 
        WHEN p.imagen_2 IS NOT NULL THEN '✅' ELSE '❌'
    END AS img2,
    CASE 
        WHEN p.imagen_3 IS NOT NULL THEN '✅' ELSE '❌'
    END AS img3,
    p.activo,
    p.fecha_publicacion
FROM publicaciones p
INNER JOIN campos_investigacion c ON p.id_campo = c.id
INNER JOIN usuarios u ON p.id_usuario = u.id
ORDER BY p.fecha_publicacion DESC;
```

---

## 📊 **VERIFICACIÓN EN CLOUDINARY:**

**Visita:**
```
https://console.cloudinary.com/console/c-dw9krxrn4/media_library/folders/semilleros-ucp/publicaciones
```

**Deberías ver:**
```
semilleros-ucp/
└── publicaciones/
    ├── abc123.jpg
    ├── def456.jpg
    └── ghi789.jpg
```

---

## ✅ **CHECKLIST DE PRUEBAS:**

- [ ] Servidor corriendo sin errores
- [ ] GET públicos funcionan sin token
- [ ] Login devuelve token válido
- [ ] POST con token crea publicación sin imágenes
- [ ] POST con token y 3 archivos sube a Cloudinary
- [ ] URLs de Cloudinary son válidas (https://res.cloudinary.com/...)
- [ ] Solo líder del campo puede publicar
- [ ] Solo autor puede editar/eliminar
- [ ] Soft delete funciona (activo = 0)
- [ ] Imágenes aparecen en Cloudinary

---

## 🎯 **SIGUIENTE PASO:**

Una vez que todas las pruebas pasen:
1. ✅ Actualizar la Landing Page (Frontend)
2. ✅ Crear sección de "Publicaciones Recientes"
3. ✅ Galería con 3 imágenes por publicación
4. ✅ Panel de admin para que líder de campo publique

---

**¿Listo para probar?** 🚀
