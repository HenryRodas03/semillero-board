# 🎨 Prompt para el Agente Frontend - Admin Semillero

## 📋 Contexto

El backend ya tiene implementadas todas las funcionalidades para el **Admin Semillero (rol_id = 1)**. Necesito que implementes la interfaz de usuario para gestionar semilleros y campos de investigación.

---

## 🎯 Funcionalidades a Implementar

### 1️⃣ **Gestión de Semilleros**

#### **Vista: Lista de Semilleros** (`/admin/semilleros`)

**Requisitos:**
- Tabla o grid mostrando todos los semilleros
- Columnas visibles:
  - Nombre del semillero
  - Líder (nombre del usuario)
  - Línea de investigación
  - Estado (Activo/Cerrado) con badge visual
  - Fecha de creación
  - Acciones (Editar, Cerrar/Abrir, Eliminar)

**Indicadores visuales:**
- 🟢 Badge verde para semilleros activos (`activo = 1`)
- 🔴 Badge rojo para semilleros cerrados (`activo = 0`)

**Acciones disponibles:**
- ➕ Botón "Crear Semillero" (abre modal/formulario)
- ✏️ Editar semillero (abre modal con datos precargados)
- 🔄 Toggle Estado (botón para cerrar/abrir con confirmación)
- 🗑️ Eliminar (con confirmación de alerta severa: "Esto eliminará también todos los campos asociados")

**API Endpoints:**
```typescript
// Listar todos los semilleros
GET /api/semilleros
Response: {
  semilleros: [
    {
      id: 1,
      nombre: "Semillero Tech",
      activo: 1,
      lider: 2,
      linea: {
        id: 1,
        nombre: "Desarrollo de Software"
      },
      liderUsuario: {
        id: 2,
        nombre: "Juan Pérez",
        correo: "juan@ucp.edu.co"
      },
      descripcion: "...",
      contacto: "tech@ucp.edu.co",
      creado_en: "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

#### **Modal/Formulario: Crear Semillero**

**Campos del formulario:**
1. **Nombre*** (text input)
   - Requerido
   - Max 100 caracteres
   - Placeholder: "Ej: Semillero de Inteligencia Artificial"

2. **Líder*** (select dropdown)
   - Requerido
   - Cargar usuarios con `GET /api/usuarios` o endpoint similar
   - Mostrar: nombre + correo
   - Value: id del usuario

3. **Línea de Investigación*** (select dropdown)
   - Requerido
   - Cargar con `GET /api/lineas-investigacion` (verificar endpoint exacto)
   - Mostrar: nombre de la línea
   - Value: id de la línea

4. **Descripción*** (textarea)
   - Requerido
   - Min 50 caracteres
   - Placeholder: "Describe el propósito y objetivos del semillero..."

5. **Contacto** (email/phone input)
   - Opcional
   - Placeholder: "contacto@ucp.edu.co o +57 300 123 4567"

6. **Imagen** (file upload)
   - Opcional
   - Tipos aceptados: jpg, png, webp
   - Max 2MB
   - Preview de imagen antes de subir

**Validaciones frontend:**
- Todos los campos requeridos deben estar llenos
- Email válido si se proporciona contacto
- Descripción mínimo 50 caracteres

**API Request:**
```typescript
// Crear semillero
POST /api/semilleros
Headers: {
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
Body: {
  "nombre": "Semillero de IA",
  "lider": 2,
  "descripcion": "Investigación en inteligencia artificial y machine learning",
  "lineas_investigacion_id": 1,
  "contacto": "ia@ucp.edu.co",
  "ruta_imagen": "/uploads/semilleros/ia.jpg" // Si se subió imagen
}

Response 201: {
  "message": "Semillero creado",
  "semillero": { ... }
}

// Manejo de errores:
Response 400: { "message": "Faltan campos requeridos" }
Response 401: { "message": "Token inválido o expirado" }
Response 403: { "message": "No tienes permisos" }
Response 500: { "message": "Error del servidor" }
```

**Comportamiento post-creación:**
1. Cerrar modal
2. Mostrar toast/notificación de éxito: "✅ Semillero creado exitosamente"
3. Recargar lista de semilleros
4. Opcional: Scroll automático al nuevo semillero

---

#### **Modal/Formulario: Editar Semillero**

**Similar a crear, pero:**
- Precargar todos los datos del semillero seleccionado
- Título: "Editar Semillero: [Nombre del Semillero]"
- Todos los campos editables excepto `creado_en`
- Botón "Guardar Cambios" en lugar de "Crear"

**API Request:**
```typescript
// Actualizar semillero
PUT /api/semilleros/:id
Headers: {
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
Body: {
  // Solo los campos que cambiaron
  "nombre": "Semillero de IA Avanzada",
  "descripcion": "Nueva descripción actualizada"
}

Response 200: {
  "message": "Semillero actualizado"
}
```

---

#### **Acción: Cerrar/Abrir Semillero** 🆕

**Comportamiento:**
- Si el semillero está **Activo** (activo = 1):
  - Mostrar botón "🔴 Cerrar Semillero"
  - Al hacer clic, mostrar modal de confirmación:
    ```
    ¿Cerrar este semillero?
    
    El semillero "Semillero Tech" dejará de aceptar nuevos registros.
    Los campos asociados permanecerán, pero no podrás crear nuevos.
    
    Esta acción es reversible, puedes reabrir el semillero después.
    
    [Cancelar] [Sí, Cerrar]
    ```

- Si el semillero está **Cerrado** (activo = 0):
  - Mostrar botón "🟢 Abrir Semillero"
  - Al hacer clic, abrir directamente (sin confirmación)

**API Request:**
```typescript
// Cerrar semillero
PATCH /api/semilleros/:id/estado
Headers: {
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
Body: {
  "activo": 0  // 0 para cerrar, 1 para abrir
}

Response 200: {
  "message": "Semillero cerrado exitosamente",
  "semillero": {
    "id": 1,
    "nombre": "Semillero Tech",
    "activo": 0,
    ...
  }
}

// Abrir semillero
PATCH /api/semilleros/:id/estado
Body: { "activo": 1 }

Response 200: {
  "message": "Semillero abierto exitosamente",
  "semillero": { ... }
}
```

**Comportamiento post-acción:**
1. Actualizar el estado visual del badge en la tabla
2. Cambiar el botón de acción (Cerrar ↔ Abrir)
3. Mostrar toast: "✅ Semillero cerrado/abierto exitosamente"
4. NO recargar toda la página, solo actualizar el item

---

#### **Acción: Eliminar Semillero**

**Modal de confirmación (estricto):**
```
⚠️ ¡ELIMINAR PERMANENTEMENTE!

Estás por eliminar el semillero "Semillero Tech"

ADVERTENCIA:
• Se eliminarán TODOS los campos de investigación asociados
• Se eliminarán TODOS los proyectos de esos campos
• Esta acción NO se puede deshacer

Escribe "ELIMINAR" para confirmar:
[____________________]

[Cancelar] [Eliminar Permanentemente]
```

**Validación:**
- Usuario debe escribir exactamente "ELIMINAR" (case-insensitive)
- Botón de eliminar deshabilitado hasta que escriba correctamente

**API Request:**
```typescript
// Eliminar semillero
DELETE /api/semilleros/:id
Headers: {
  "Authorization": "Bearer <token>"
}

Response 200: {
  "message": "Semillero eliminado"
}
```

**Comportamiento post-eliminación:**
1. Cerrar modal
2. Remover el semillero de la lista
3. Mostrar toast: "✅ Semillero eliminado permanentemente"

---

### 2️⃣ **Gestión de Campos de Investigación**

#### **Vista: Lista de Campos** (`/admin/campos`)

**Requisitos:**
- Tabla o grid mostrando todos los campos
- Columnas visibles:
  - Nombre del campo
  - Semillero al que pertenece
  - Líder del campo
  - Horario de reunión
  - Email de contacto
  - Acciones (Editar, Eliminar)

**Filtros:**
- 📌 Filtrar por semillero (dropdown)
- 🔍 Búsqueda por nombre de campo

**Acciones disponibles:**
- ➕ Botón "Crear Campo de Investigación"
- ✏️ Editar campo
- 🗑️ Eliminar campo

**API Endpoints:**
```typescript
// Listar todos los campos
GET /api/campos
Response: {
  campos: [
    {
      id: 1,
      nombre: "Desarrollo Web",
      lider: 3,
      descripcion: "...",
      id_semillero: 1,
      semillero: {
        id: 1,
        nombre: "Semillero Tech"
      },
      liderUsuario: {
        id: 3,
        nombre: "María López",
        correo: "maria@ucp.edu.co"
      },
      horario_reunion: "Viernes 3:00 PM",
      contacto_email: "web@ucp.edu.co",
      contacto_redes_sociales: {
        "instagram": "@webdev_ucp",
        "linkedin": "webdev-research"
      }
    }
  ]
}
```

---

#### **Modal/Formulario: Crear Campo de Investigación**

**Campos del formulario:**
1. **Nombre del Campo*** (text input)
   - Requerido
   - Max 100 caracteres
   - Placeholder: "Ej: Desarrollo Web Full Stack"

2. **Semillero*** (select dropdown) 🔴 **IMPORTANTE**
   - Requerido
   - **Cargar solo semilleros activos:** `GET /api/semilleros/activos`
   - Mostrar: nombre del semillero
   - Value: id del semillero
   - Si no hay semilleros activos, deshabilitar formulario y mostrar:
     ```
     ⚠️ No hay semilleros activos disponibles.
     Crea o activa un semillero antes de crear campos.
     ```

3. **Líder del Campo*** (select dropdown)
   - Requerido
   - Cargar usuarios
   - Mostrar: nombre + correo
   - Value: id del usuario

4. **Descripción*** (textarea)
   - Requerido
   - Min 50 caracteres
   - Placeholder: "Describe el enfoque y actividades del campo..."

5. **Horario de Reunión** (text input)
   - Opcional
   - Placeholder: "Ej: Viernes 3:00 PM - 5:00 PM"

6. **Email de Contacto** (email input)
   - Opcional
   - Validación: debe ser email válido
   - Placeholder: "campo@ucp.edu.co"

7. **Redes Sociales** (inputs dinámicos) - Opcional
   - Instagram (text input) - Placeholder: "@campo_ucp"
   - LinkedIn (text input) - Placeholder: "campo-investigacion-ucp"
   - Facebook (text input) - Placeholder: "CampoUCP"
   - Twitter/X (text input) - Placeholder: "@campo_ucp"
   - YouTube (URL input) - Placeholder: "https://youtube.com/@campoucp"

8. **Imagen** (file upload)
   - Opcional
   - Preview de imagen

**Validaciones frontend:**
- Campos requeridos completos
- Email válido si se proporciona
- Redes sociales con formatos correctos:
  - Instagram: debe empezar con @ o ser username
  - YouTube: debe ser URL válida
  - Otros: texto libre

**API Request:**
```typescript
// Crear campo
POST /api/campos
Headers: {
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
Body: {
  "nombre": "Desarrollo Backend",
  "lider": 3,
  "descripcion": "Investigación en arquitecturas backend y APIs REST",
  "id_semillero": 1,  // REQUERIDO - debe ser un semillero activo
  "horario_reunion": "Viernes 3:00 PM",
  "contacto_email": "backend@ucp.edu.co",
  "contacto_redes_sociales": {
    "instagram": "@backend_ucp",
    "linkedin": "backend-research-ucp",
    "youtube": "https://youtube.com/@backenducp"
  },
  "ruta_imagen": "/uploads/campos/backend.jpg"
}

Response 201: {
  "message": "Campo de investigación creado",
  "campo": { ... }
}

// Posibles errores:
Response 400: { 
  "message": "Email de contacto no válido"
}
Response 400: { 
  "message": "Redes sociales no válidas",
  "errors": ["Instagram debe empezar con @", "YouTube debe ser URL válida"]
}
```

---

#### **Modal/Formulario: Editar Campo**

**Similar a crear, pero:**
- Precargar datos del campo seleccionado
- Título: "Editar Campo: [Nombre del Campo]"
- Todos los campos editables

**API Request:**
```typescript
// Actualizar campo
PUT /api/campos/:id
Headers: {
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
Body: {
  // Solo campos modificados
  "nombre": "Desarrollo Backend Avanzado",
  "horario_reunion": "Jueves 4:00 PM"
}

Response 200: {
  "message": "Campo de investigación actualizado"
}
```

---

#### **Acción: Eliminar Campo**

**Modal de confirmación:**
```
⚠️ Eliminar Campo de Investigación

Estás por eliminar el campo "Desarrollo Web"

ADVERTENCIA:
• Se eliminarán TODOS los proyectos asociados a este campo
• Se eliminarán todos los integrantes y actividades relacionadas
• Esta acción NO se puede deshacer

¿Estás seguro de continuar?

[Cancelar] [Sí, Eliminar]
```

**API Request:**
```typescript
// Eliminar campo
DELETE /api/campos/:id
Headers: {
  "Authorization": "Bearer <token>"
}

Response 200: {
  "message": "Campo de investigación eliminado"
}
```

---

### 3️⃣ **Dashboard de Semilleros** (Vista Inicial)

**Ubicación:** `/admin/dashboard` o `/admin/semilleros/dashboard`

**Cards de estadísticas:**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 📚 Semilleros   │  │ 🔬 Campos       │  │ 👥 Total        │
│                 │  │                 │  │                 │
│      4          │  │      9          │  │    20 usuarios  │
│   Total         │  │   Activos       │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ 🟢 Activos      │  │ 🔴 Cerrados     │
│                 │  │                 │
│      3          │  │      1          │
│   semilleros    │  │   semilleros    │
└─────────────────┘  └─────────────────┘
```

**Gráfico (opcional):**
- Gráfico de pastel: Semilleros activos vs cerrados
- Gráfico de barras: Campos por semillero

**Tabla resumen:**
- Lista de semilleros con conteo de campos asociados
- Click en fila → navega a detalle del semillero

**API Endpoint:**
```typescript
GET /api/dashboard/estadisticas
Headers: {
  "Authorization": "Bearer <token>"
}

Response: {
  "totalUsuarios": 20,
  "totalSemilleros": 4,
  "totalCampos": 9,
  "totalProyectos": 13,
  "proyectosActivos": 10,
  "proyectosEnPausa": 2,
  "proyectosFinalizados": 1
}

// Para conteo de semilleros activos/cerrados:
GET /api/semilleros

// Filtrar manualmente:
const activos = semilleros.filter(s => s.activo === 1).length;
const cerrados = semilleros.filter(s => s.activo === 0).length;
```

---

## 🎨 Especificaciones de Diseño

### Paleta de Colores
- **Activo:** Verde (#10B981 o similar)
- **Cerrado:** Rojo/Naranja (#EF4444 o similar)
- **Primario:** Azul (#3B82F6)
- **Peligro:** Rojo (#DC2626)
- **Advertencia:** Amarillo (#F59E0B)

### Componentes UI
- **Tablas:** Sortable, paginación si >20 items
- **Modales:** Tamaño mediano-grande, overlay oscuro
- **Botones:**
  - Primario: Crear, Guardar
  - Secundario: Editar, Cerrar/Abrir
  - Peligro: Eliminar
- **Toasts/Notificaciones:** Top-right corner, auto-dismiss en 3-5s
- **Badges:** Pequeños, redondeados, colores según estado

### Responsive
- **Desktop (>1024px):** Tabla completa con todas las columnas
- **Tablet (768-1023px):** Ocultar columnas menos importantes
- **Mobile (<768px):** Vista de cards en lugar de tabla

---

## 🔐 Autenticación y Permisos

**Verificación en frontend:**
```typescript
// Verificar que el usuario tenga rol_id = 1 (Admin Semillero)
const user = getAuthUser(); // Desde tu contexto/store
if (user.id_rol !== 1) {
  // Redirigir a página de acceso denegado
  navigate('/unauthorized');
}
```

**Headers en todas las peticiones:**
```typescript
headers: {
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
}
```

**Manejo de errores de autenticación:**
- **401:** Token inválido/expirado → Logout y redirigir a login
- **403:** Sin permisos → Mostrar mensaje "No tienes permisos para esta acción"

---

## 🚀 Orden de Implementación Sugerido

1. **Fase 1:** Dashboard de estadísticas (vista general)
2. **Fase 2:** Lista de semilleros + Crear/Editar
3. **Fase 3:** Cerrar/Abrir semilleros (funcionalidad nueva)
4. **Fase 4:** Eliminar semilleros (con validaciones estrictas)
5. **Fase 5:** Lista de campos + Crear/Editar/Eliminar
6. **Fase 6:** Filtros y búsqueda avanzada
7. **Fase 7:** Gráficos y visualizaciones

---

## 📝 Notas Importantes

1. **Diferencia entre Cerrar y Eliminar:**
   - **Cerrar:** Reversible, conserva datos, solo marca como inactivo
   - **Eliminar:** Irreversible, borra permanentemente todo

2. **Relación Semillero-Campo:**
   - Al crear campo, solo mostrar semilleros ACTIVOS
   - Un semillero cerrado NO puede tener nuevos campos
   - Campos existentes en semilleros cerrados permanecen visibles

3. **Validaciones de Backend:**
   - Email: Regex válido
   - Redes sociales: Formato correcto por plataforma
   - Textos: Sanitizados (prevención XSS)

4. **UX Best Practices:**
   - Confirmaciones para acciones destructivas
   - Feedback visual inmediato
   - Mensajes de error claros
   - Loading states en peticiones async

---

## 🧪 Testing Manual

Checklist de pruebas:

**Semilleros:**
- [ ] Crear semillero con todos los campos
- [ ] Crear semillero solo con campos requeridos
- [ ] Editar nombre y descripción
- [ ] Cerrar semillero activo
- [ ] Abrir semillero cerrado
- [ ] Intentar eliminar semillero con campos (debe advertir)
- [ ] Eliminar semillero sin campos

**Campos:**
- [ ] Crear campo en semillero activo
- [ ] Verificar que no aparezcan semilleros cerrados en dropdown
- [ ] Editar horario y contacto
- [ ] Agregar redes sociales
- [ ] Eliminar campo
- [ ] Verificar que se muestran los campos del semillero correcto

**Permisos:**
- [ ] Intentar acceder con otro rol (debe redirigir)
- [ ] Token expirado (debe hacer logout)

---

## ❓ Preguntas Frecuentes

**Q: ¿Qué pasa si intento crear un campo en un semillero cerrado?**  
A: El dropdown de semilleros solo debe mostrar semilleros activos (usar endpoint `/api/semilleros/activos`).

**Q: ¿Puedo reabrir un semillero cerrado?**  
A: Sí, usando el botón "Abrir Semillero" que ejecuta `PATCH /api/semilleros/:id/estado` con `activo: 1`.

**Q: ¿Se eliminan los campos al cerrar un semillero?**  
A: No. Cerrar es un "soft delete", los campos permanecen. Solo al ELIMINAR se borran.

**Q: ¿El líder del semillero debe ser Admin?**  
A: No necesariamente. Puede ser cualquier usuario (Admin Campo, Delegado, etc.).

---

## 📞 Soporte

Si tienes dudas sobre endpoints, respuestas o estructura de datos, revisa:
- Documentación completa: `docs/ADMIN_SEMILLERO_FUNCIONALIDADES.md`
- Pruebas en Postman/Insomnia con los ejemplos proporcionados
- Consulta logs del backend para ver requests/responses
