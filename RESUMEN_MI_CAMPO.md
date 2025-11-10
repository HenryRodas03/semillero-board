# 🎓 Sistema "Mi Campo" - Gestión para Admin Campo

## 📋 Resumen de Implementación

Se ha implementado exitosamente el módulo **"Mi Campo"** que permite a los Admin Campo (rol 2) gestionar su campo de investigación asignado.

---

## 📂 Archivos Creados/Modificados

### ✅ Nuevos Archivos

1. **`src/components/campos/EditarMiCampoDialog.tsx`** (390 líneas)
   - Componente modal para editar información del campo
   - Formulario completo con validaciones
   - Upload de imagen con preview
   - Manejo de redes sociales

2. **`src/pages/MiCampo.tsx`** (290 líneas)
   - Página principal "Mi Campo"
   - Vista detallada de información del campo
   - Botón para editar
   - Opción para eliminar imagen
   - Diseño responsivo con cards

### 🔧 Archivos Modificados

3. **`src/services/camposService.ts`**
   - ✅ Agregado: `getMiCampo()` - Obtener mi campo asignado
   - ✅ Agregado: `actualizarMiCampo(data)` - Actualizar con FormData
   - ✅ Agregado: `eliminarImagenMiCampo()` - Eliminar imagen

4. **`src\App.tsx`**
   - ✅ Agregada ruta: `/admin/mi-campo` (protegida)
   - ✅ Importado componente `MiCampo`

5. **`src/components/Layout/AppSidebar.tsx`**
   - ✅ Agregado menú "Mi Campo" con icono `GraduationCap`
   - ✅ Visible solo para `rolesPermitidos: [2]` (Admin Campo)

---

## 🎯 Funcionalidades Implementadas

### ✅ Ver Mi Campo
- Card principal con imagen destacada
- Información completa del campo
- Horario de reunión
- Email de contacto
- Redes sociales (Facebook, Instagram, Twitter, LinkedIn, YouTube)
- Información del líder del campo

### ✅ Editar Mi Campo
- Modal con formulario completo
- Campos editables:
  - ✏️ Nombre (requerido, máx 100 caracteres)
  - 📝 Descripción (requerido, máx 1000 caracteres)
  - 📅 Horario de reunión (opcional)
  - 📧 Email de contacto (opcional)
  - 🌐 Redes sociales (5 plataformas)
  - 🖼️ Imagen (JPG/PNG/WebP, máx 5MB)
- Preview de imagen antes de subir
- Validaciones en tiempo real
- Loading states durante guardado

### ✅ Eliminar Imagen
- Botón de eliminar sobre la imagen
- AlertDialog de confirmación
- Eliminación desde Cloudinary
- Actualización inmediata en UI

---

## 🔐 Control de Acceso

### Permisos por Rol

| Funcionalidad | Admin Semillero (1) | Admin Campo (2) | Otros Roles |
|---------------|---------------------|-----------------|-------------|
| Ver "Mi Campo" | ❌ | ✅ | ❌ |
| Editar Mi Campo | ❌ | ✅ | ❌ |
| Eliminar Imagen | ❌ | ✅ | ❌ |

### Validaciones de Seguridad

1. ✅ **Menú visible solo para Admin Campo (rol 2)**
2. ✅ **Ruta protegida con `PrivateRoute`**
3. ✅ **Backend valida JWT y propiedad del campo**
4. ✅ **Usuario sin campo asignado ve mensaje de error**

---

## 📡 Endpoints del Backend (Esperados)

### 1. GET `/api/campos/mi-campo/info`
**Headers:** `Authorization: Bearer <token>`

**Respuesta (200):**
```json
{
  "id": 1,
  "nombre": "Desarrollo Web Full Stack",
  "descripcion": "Campo enfocado en...",
  "ruta_imagen": "https://cloudinary.com/...",
  "lider": 21,
  "id_semillero": 1,
  "horario_reunion": "Viernes 3:00 PM - 5:00 PM",
  "contacto_email": "web.dev@ucp.edu.co",
  "contacto_redes_sociales": {
    "facebook": "https://facebook.com/...",
    "instagram": "@ucpwebdev"
  },
  "semillero_nombre": "Semillero TechLab",
  "lider_nombre": "Carlos Rodríguez",
  "lider_correo": "carlos.rodriguez@ucp.edu.co"
}
```

**Error (404):**
```json
{
  "mensaje": "No tienes un campo asignado. Contacta al administrador."
}
```

### 2. PUT `/api/campos/mi-campo/actualizar`
**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (FormData):**
- `nombre` (string, opcional)
- `descripcion` (string, opcional)
- `horario_reunion` (string, opcional)
- `contacto_email` (string, opcional)
- `contacto_redes_sociales` (JSON string, opcional)
- `imagen` (File, opcional)

**Respuesta (200):**
```json
{
  "mensaje": "Campo actualizado exitosamente",
  "campo": { /* objeto campo actualizado */ }
}
```

### 3. DELETE `/api/campos/mi-campo/imagen`
**Headers:** `Authorization: Bearer <token>`

**Respuesta (200):**
```json
{
  "mensaje": "Imagen eliminada exitosamente"
}
```

---

## 🎨 Componentes de UI Utilizados

### Shadcn/ui
- ✅ `Dialog` - Modal para editar
- ✅ `AlertDialog` - Confirmación eliminar imagen
- ✅ `Card` - Contenedores de información
- ✅ `Button` - Acciones
- ✅ `Input` - Campos de texto
- ✅ `Textarea` - Descripción
- ✅ `Label` - Etiquetas de formulario
- ✅ `Badge` - Tag del semillero
- ✅ `toast` - Notificaciones

### Iconos (lucide-react)
- 🎓 `GraduationCap` - Icono del menú "Mi Campo"
- ✏️ `Edit` - Botón editar
- 📅 `Calendar` - Horario
- 📧 `Mail` - Email
- 🌐 `Facebook, Instagram, Twitter, LinkedIn, YouTube` - Redes sociales
- 🗑️ `Trash2` - Eliminar imagen
- ⏳ `Loader2` - Loading spinner
- ⚠️ `AlertCircle` - Sin campo asignado

---

## 🔄 Flujo de Usuario

### Escenario 1: Admin Campo con campo asignado

1. **Login** → Sistema verifica rol 2
2. **Sidebar** → Ve opción "Mi Campo" 🎓
3. **Click en "Mi Campo"** → Carga información del campo
4. **Vista principal:**
   - Card con imagen destacada
   - Nombre, descripción
   - Horario, email, redes sociales
   - Botón "Editar Campo"
   - Botón eliminar imagen (si tiene)
5. **Click "Editar Campo"** → Abre modal
6. **Formulario de edición:**
   - Campos prellenados
   - Puede cambiar cualquier campo
   - Upload nueva imagen (preview)
   - Guardar → Toast de éxito
7. **Página se recarga** → Muestra datos actualizados

### Escenario 2: Admin Campo sin campo asignado

1. **Login** → Sistema verifica rol 2
2. **Sidebar** → Ve opción "Mi Campo" 🎓
3. **Click en "Mi Campo"** → API retorna 404
4. **Vista de error:**
   - ⚠️ Icono AlertCircle
   - Mensaje: "No tienes un campo de investigación asignado"
   - Instrucción: "Contacta al administrador del semillero"

### Escenario 3: Usuario de otro rol

1. **Sidebar** → NO ve opción "Mi Campo"
2. **Intento de acceso directo** → `/admin/mi-campo`
3. **Sistema** → Ruta protegida permite acceso (cualquier rol autenticado)
4. **Backend** → Retorna 404 o 403 (no es líder de ningún campo)
5. **Mensaje de error** mostrado

---

## ✅ Validaciones Implementadas

### Frontend

1. **Nombre:**
   - ✅ Campo requerido
   - ✅ Máximo 100 caracteres

2. **Descripción:**
   - ✅ Campo requerido
   - ✅ Máximo 1000 caracteres

3. **Email:**
   - ✅ Validación de formato email
   - ✅ Campo opcional

4. **Imagen:**
   - ✅ Formatos: JPG, PNG, WebP
   - ✅ Tamaño máximo: 5MB
   - ✅ Preview antes de subir
   - ✅ Opción para remover

5. **Redes Sociales:**
   - ✅ URLs válidas (Facebook, LinkedIn, YouTube)
   - ✅ Username con @ (Instagram, Twitter)

### Backend (Esperado)

1. ✅ JWT token válido
2. ✅ Usuario es líder del campo
3. ✅ Validación de email
4. ✅ Validación de URLs
5. ✅ Validación de formato de imagen
6. ✅ Eliminación segura en Cloudinary

---

## 🎯 Estados de UI

### Loading States
- ⏳ Cargando información del campo
- ⏳ Guardando cambios
- ⏳ Eliminando imagen

### Empty States
- ⚠️ Sin campo asignado

### Error States
- ❌ Error al cargar campo
- ❌ Error al actualizar
- ❌ Error al eliminar imagen
- ❌ Imagen muy grande (>5MB)
- ❌ Formato de imagen no válido

### Success States
- ✅ Campo actualizado exitosamente
- ✅ Imagen eliminada exitosamente

---

## 🧪 Testing Checklist

### Pruebas Funcionales

- [ ] **Cargar Mi Campo** - GET endpoint funciona
- [ ] **Editar nombre** - Se actualiza correctamente
- [ ] **Editar descripción** - Se actualiza correctamente
- [ ] **Editar horario** - Se actualiza correctamente
- [ ] **Editar email** - Validación funciona
- [ ] **Editar redes sociales** - Todas las plataformas
- [ ] **Subir imagen nueva** - Se reemplaza la anterior
- [ ] **Eliminar imagen** - Se elimina de Cloudinary
- [ ] **Preview de imagen** - Funciona antes de subir
- [ ] **Validación 5MB** - Rechaza imágenes grandes
- [ ] **Validación formatos** - Solo JPG/PNG/WebP
- [ ] **Usuario sin campo** - Muestra mensaje correcto
- [ ] **Toast notifications** - Aparecen correctamente
- [ ] **Loading states** - Spinners funcionan
- [ ] **Modal se cierra** - Después de guardar

### Pruebas de Seguridad

- [ ] **Token JWT requerido** - 401 sin token
- [ ] **Solo líder puede editar** - 403 si no es líder
- [ ] **Admin Campo rol 2** - Solo ellos ven el menú
- [ ] **Otros roles** - No ven "Mi Campo"
- [ ] **Sanitización inputs** - Backend valida

### Pruebas de UI/UX

- [ ] **Responsive** - Mobile, tablet, desktop
- [ ] **Preview imagen** - Se ve correctamente
- [ ] **Formulario prellenado** - Datos actuales
- [ ] **Botón eliminar imagen** - Solo si tiene imagen
- [ ] **Redes sociales** - Links funcionan
- [ ] **Email mailto** - Se abre cliente de correo

---

## 🐛 Troubleshooting

### Problema: "No tienes un campo asignado"

**Causas posibles:**
1. Usuario no es líder de ningún campo en BD
2. Backend no encuentra el campo del usuario
3. Token JWT no contiene información correcta

**Solución:**
```sql
-- Verificar en base de datos
SELECT * FROM campos_investigacion WHERE lider = <id_usuario>;

-- Si no existe, asignar campo al usuario
UPDATE campos_investigacion SET lider = <id_usuario> WHERE id = <id_campo>;
```

### Problema: Error 404 al cargar /api/campos/mi-campo/info

**Causas posibles:**
1. Backend no tiene la ruta implementada
2. Ruta mal escrita en backend

**Solución:**
Verificar que el backend tenga:
```javascript
router.get('/mi-campo/info', verificarToken, async (req, res) => {
  // Implementación
});
```

### Problema: Error al subir imagen

**Causas posibles:**
1. Cloudinary no configurado
2. Imagen supera 5MB
3. Formato no permitido

**Solución:**
- Verificar `.env` tiene credenciales de Cloudinary
- Verificar validación en frontend y backend
- Comprimir imagen antes de subir

---

## 📞 Próximos Pasos

### Fase 2 (Opcional - Mejoras)

1. **Agregar estadísticas del campo:**
   - Número de proyectos
   - Número de integrantes
   - Próximos eventos

2. **Historial de cambios:**
   - Log de modificaciones
   - Quién y cuándo

3. **Galería de imágenes:**
   - Múltiples imágenes del campo
   - Carrousel en vista pública

4. **Integración con proyectos:**
   - Ver proyectos del campo
   - Crear proyecto desde aquí

---

## 📝 Notas Importantes

1. **Un Admin Campo solo puede gestionar UN campo** (el asignado como líder)
2. **La actualización es parcial** - Solo se envían campos modificados
3. **Imagen anterior se elimina automáticamente** al subir una nueva
4. **Redes sociales se envían como JSON string** en FormData
5. **El menú solo aparece para rol 2** (Admin Campo)

---

## ✨ Resumen de Cambios

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `EditarMiCampoDialog.tsx` | Nuevo | Modal de edición con formulario completo |
| `MiCampo.tsx` | Nuevo | Página principal de gestión |
| `camposService.ts` | Modificado | +3 métodos nuevos |
| `App.tsx` | Modificado | +1 ruta nueva |
| `AppSidebar.tsx` | Modificado | +1 menú nuevo |

**Total:** 2 archivos nuevos, 3 archivos modificados

---

**Estado:** ✅ Implementación Completa  
**Testing:** ⏳ Pendiente  
**Última actualización:** 7 de Noviembre 2025
