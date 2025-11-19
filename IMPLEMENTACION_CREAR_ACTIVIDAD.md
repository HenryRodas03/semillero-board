# ➕ Implementación: Crear Actividades

## 📝 Funcionalidad Agregada

Se implementó la funcionalidad para crear nuevas actividades desde el tablero Kanban mediante un botón flotante con icono "+" en fondo verde.

---

## 🔗 Endpoint Utilizado

```http
POST http://localhost:3000/api/actividades
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{np
  "id_proyecto": 4,
  "titulo": "Diseño de la base de datos",
  "descripcion": "Crear el modelo entidad-relación del sistema",
  "id_estado": 1,
  "prioridad": "Alta",
  "id_integrante": 5,           // Opcional
  "fecha_creacion": "2024-11-16",  // Opcional
  "fecha_fin": "2024-11-20"      // Opcional
}
```

**Respuesta esperada:**
```json
{
  "message": "Actividad creada",
  "actividad": {
    "id": 12,
    "id_proyecto": 4,
    "id_integrante": 5,
    "titulo": "Diseño de la base de datos",
    "descripcion": "Crear el modelo entidad-relación del sistema",
    "id_estado": 1,
    "prioridad": "Alta",
    "fecha_creacion": "2024-11-16",
    "fecha_fin": "2024-11-20",
    "fecha_creacion": "2024-11-16T10:30:00.000Z"
  }
}
```

---

## 📁 Archivos Modificados

### 1. **`src/services/actividadesService.ts`**

Se agregó el método `crearActividad()`:

```typescript
/**
 * Crear una nueva actividad
 * POST /api/actividades
 */
crearActividad: async (data: {
  id_proyecto: number;
  titulo: string;
  descripcion: string;
  id_estado?: number;
  prioridad?: string;
  id_integrante?: number;
  fecha_creacion?: string;
  fecha_fin?: string;
}) => {
  console.log('➕ Creando nueva actividad:', data);
  const response = await api.post('/actividades', data);
  console.log('✅ Actividad creada:', response.data);
  return response.data;
},
```

---

### 2. **`src/pages/ProyectoActividades.tsx`**

#### ✅ Imports Agregados:
```typescript
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
```

#### ✅ Estados Agregados:
```typescript
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [isCreating, setIsCreating] = useState(false);

// Estados del formulario
const [formData, setFormData] = useState({
  titulo: '',
  descripcion: '',
  prioridad: 'Media',
  id_estado: 1,
  id_integrante: undefined as number | undefined,
  fecha_creacion: '',
  fecha_fin: ''
});
```

#### ✅ Función `handleCrearActividad`:
```typescript
const handleCrearActividad = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!id) return;
  
  // Validaciones
  if (!formData.titulo.trim()) {
    toast({ title: "❌ Error", description: "El título es obligatorio", variant: "destructive" });
    return;
  }

  if (!formData.descripcion.trim()) {
    toast({ title: "❌ Error", description: "La descripción es obligatoria", variant: "destructive" });
    return;
  }

  try {
    setIsCreating(true);
    
    // Preparar payload (solo incluir campos opcionales si tienen valor)
    const payload = {
      id_proyecto: parseInt(id),
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      id_estado: formData.id_estado,
      prioridad: formData.prioridad,
      ...(formData.id_integrante && { id_integrante: formData.id_integrante }),
      ...(formData.fecha_creacion && { fecha_creacion: formData.fecha_creacion }),
      ...(formData.fecha_fin && { fecha_fin: formData.fecha_fin }),
    };

    const response = await actividadesService.crearActividad(payload);
    
    // Recargar actividades del proyecto
    await loadProjectData();
    
    // Cerrar diálogo y resetear formulario
    setIsDialogOpen(false);
    setFormData({
      titulo: '',
      descripcion: '',
      prioridad: 'Media',
      id_estado: 1,
      id_integrante: undefined,
      fecha_creacion: '',
      fecha_fin: ''
    });
    
    // Mostrar toast de éxito
    toast({
      title: "✅ Actividad creada",
      description: `"${response.actividad?.titulo}" se creó exitosamente`,
    });

  } catch (error: any) {
    console.error('❌ Error al crear actividad:', error);
    
    // Mostrar mensaje de error del backend
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        "No se pudo crear la actividad";
    
    toast({
      title: "❌ Error",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setIsCreating(false);
  }
};
```

---

## 🎨 Interfaz de Usuario

### **Botón Flotante:**
```tsx
<Button
  className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white"
  size="icon"
>
  <Plus className="h-6 w-6" />
</Button>
```

**Características:**
- ✅ Posición fija en esquina inferior derecha
- ✅ Forma circular (rounded-full)
- ✅ Fondo verde (`bg-green-600`)
- ✅ Hover más oscuro (`hover:bg-green-700`)
- ✅ Icono `+` blanco de 24x24px
- ✅ Sombra pronunciada (`shadow-lg`)

---

### **Formulario en Modal:**

El diálogo contiene los siguientes campos:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| **Título** | Input text | ✅ Sí | Nombre de la actividad |
| **Descripción** | Textarea | ✅ Sí | Descripción detallada |
| **Prioridad** | Select | No | Alta / Media / Baja (default: Media) |
| **Estado Inicial** | Select | No | Pendiente / En Progreso / Finalizada (default: Pendiente) |
| **ID Integrante** | Input number | No | ID del responsable |
| **Fecha Inicio** | Input date | No | Fecha de inicio |
| **Fecha Fin** | Input date | No | Fecha de finalización |

---

## 🔄 Flujo de Creación

```
1. Usuario hace clic en botón flotante "+"
   └─> Se abre el diálogo modal

2. Usuario completa el formulario
   ├─> Título (obligatorio)
   ├─> Descripción (obligatoria)
   ├─> Prioridad (opcional, default: Media)
   ├─> Estado (opcional, default: Pendiente)
   ├─> ID Integrante (opcional)
   └─> Fechas (opcionales)

3. Usuario hace clic en "Crear Actividad"
   └─> handleCrearActividad() se ejecuta

4. Validaciones en frontend
   ├─> ¿Título vacío? → Toast de error
   └─> ¿Descripción vacía? → Toast de error

5. Preparar payload
   └─> Solo incluir campos opcionales si tienen valor

6. POST /api/actividades
   ├─> Success:
   │   ├─> Recargar actividades (loadProjectData())
   │   ├─> Cerrar diálogo
   │   ├─> Resetear formulario
   │   └─> Toast: "✅ Actividad creada"
   │
   └─> Error:
       └─> Toast con mensaje del backend

7. Actividad aparece en la columna correspondiente
   └─> Según su id_estado (1, 2 o 3)
```

---

## ✨ Características Implementadas

- ✅ **Botón flotante** con icono "+" verde
- ✅ **Modal responsivo** con scroll automático
- ✅ **Validación frontend** de campos obligatorios
- ✅ **Campos opcionales** manejados correctamente
- ✅ **Toast de confirmación** al crear
- ✅ **Toast de error** con mensaje del backend
- ✅ **Recarga automática** del tablero tras crear
- ✅ **Reseteo del formulario** tras éxito
- ✅ **Estado de carga** con spinner
- ✅ **Botones deshabilitados** durante creación
- ✅ **Logs en consola** para debugging

---

## 🧪 Cómo Probar

### 1. **Abrir el tablero de actividades:**
```
http://localhost:8080/proyecto/1/actividades
```

### 2. **Hacer clic en el botón verde "+" (esquina inferior derecha)**

### 3. **Completar el formulario:**
```
- Título: "Prueba de actividad"
- Descripción: "Esta es una actividad de prueba"
- Prioridad: Alta
- Estado: Pendiente
- (Dejar los demás campos vacíos)
```

### 4. **Hacer clic en "Crear Actividad"**

### 5. **Verificar:**
- ✅ Toast de confirmación
- ✅ La nueva actividad aparece en la columna "Pendientes"
- ✅ El modal se cierra
- ✅ Estadísticas se actualizan

### 6. **Verificar en consola:**
```javascript
➕ Creando nueva actividad: { 
  id_proyecto: 1, 
  titulo: "Prueba de actividad",
  ...
}
✅ Actividad creada: { 
  message: "Actividad creada",
  actividad: { id: 12, ... }
}
```

### 7. **Probar error:**
- Dejar el título vacío → Ver toast de error frontend
- Enviar ID integrante inválido → Ver toast con error del backend

---

## 📊 Validaciones

### **Frontend:**
- ✅ Título no puede estar vacío
- ✅ Descripción no puede estar vacía
- ✅ ID proyecto se toma de la URL automáticamente

### **Backend (según tu API):**
- Validaciones adicionales del servidor
- Mensajes de error mostrados en toast

---

## 🎯 Detalles Técnicos

### **Manejo de Campos Opcionales:**
```typescript
const payload = {
  // Campos obligatorios siempre
  id_proyecto: parseInt(id),
  titulo: formData.titulo.trim(),
  descripcion: formData.descripcion.trim(),
  id_estado: formData.id_estado,
  prioridad: formData.prioridad,
  
  // Campos opcionales solo si tienen valor
  ...(formData.id_integrante && { id_integrante: formData.id_integrante }),
  ...(formData.fecha_creacion && { fecha_creacion: formData.fecha_creacion }),
  ...(formData.fecha_fin && { fecha_fin: formData.fecha_fin }),
};
```

Esto evita enviar campos con valores `undefined` o vacíos al backend.

---

### **Manejo de Errores:**
```typescript
catch (error: any) {
  const errorMessage = error.response?.data?.message || 
                      error.response?.data?.error || 
                      "No se pudo crear la actividad";
  
  toast({
    title: "❌ Error",
    description: errorMessage,
    variant: "destructive",
  });
}
```

Muestra el mensaje exacto del backend si está disponible.

---

## 🔮 Posibles Mejoras Futuras

- [ ] Autocompletar ID integrante con dropdown de integrantes del proyecto
- [ ] Validación de fecha_fin > fecha_creacion
- [ ] Agregar campo de tags o etiquetas
- [ ] Subir archivos adjuntos
- [ ] Asignar múltiples integrantes
- [ ] Clonar actividades existentes
- [ ] Plantillas de actividades predefinidas
- [ ] Vista previa antes de crear

---

## ✅ Resultado Final

**Antes:**
- No había forma de crear actividades desde el frontend

**Ahora:**
- ✅ Botón flotante verde con "+" visible
- ✅ Modal con formulario completo
- ✅ Validaciones en tiempo real
- ✅ Integración con backend funcional
- ✅ Recarga automática del tablero
- ✅ Manejo robusto de errores

**¡Funcionalidad completa de creación de actividades implementada!** 🎉
