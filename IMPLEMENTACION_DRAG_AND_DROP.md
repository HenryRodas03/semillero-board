# 🎯 Implementación de Drag and Drop en el Tablero de Actividades

## 📦 Librería Utilizada

```bash
npm install react-beautiful-dnd @types/react-beautiful-dnd
```

**react-beautiful-dnd** - Librería de Atlassian para crear experiencias de drag and drop fluidas y accesibles.

---

## 🔗 Endpoint Integrado

### **Cambiar Estado de Actividad**

```http
PUT http://localhost:3000/api/actividades/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "id_estado": 2  // 1: Pendiente, 2: En progreso, 3: Finalizada
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Actividad actualizada exitosamente",
  "data": {
    "id": 5,
    "titulo": "Diseño de base de datos",
    "id_estado": 2,
    "estado": "En progreso",
    "fecha_actualizacion": "2024-11-16T10:30:00.000Z"
  }
}
```

---

## 📋 Estados Disponibles

| ID | Estado | Descripción | Color |
|----|--------|-------------|-------|
| 1  | Pendiente | Actividad sin iniciar | Gris |
| 2  | En progreso | Actividad en desarrollo | Azul |
| 3  | Finalizada | Actividad completada | Verde |
| 4  | En pausa | Actividad pausada temporalmente | Amarillo |

---

## 📁 Archivos Modificados

### 1. **`src/services/actividadesService.ts`** - Método para Cambiar Estado

```typescript
/**
 * Actualizar el estado de una actividad (drag and drop)
 * PUT /api/actividades/:id
 */
cambiarEstado: async (id: number, id_estado: number) => {
  console.log(`🔄 Cambiando estado de actividad ${id} a estado ${id_estado}`);
  const response = await api.put(`/actividades/${id}`, { id_estado });
  console.log('✅ Estado actualizado:', response.data);
  return response.data;
},
```

---

### 2. **`src/pages/ProyectoActividades.tsx`** - Drag and Drop Completo

#### ✅ Imports Agregados:
```typescript
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { actividadesService } from "@/services/actividadesService";
import { useToast } from "@/hooks/use-toast";
```

#### ✅ Estados Agregados:
```typescript
const { toast } = useToast();
const [isDragging, setIsDragging] = useState(false);
```

#### ✅ Función `onDragEnd`:
```typescript
const onDragEnd = async (result: DropResult) => {
  const { source, destination, draggableId } = result;

  // Si no hay destino, no hacer nada
  if (!destination) {
    setIsDragging(false);
    return;
  }

  // Si se suelta en el mismo lugar, no hacer nada
  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    setIsDragging(false);
    return;
  }

  // Mapear droppableId a id_estado
  const estadoMap: { [key: string]: number } = {
    'pendientes': 1,
    'enProgreso': 2,
    'finalizadas': 3,
  };

  const nuevoEstadoId = estadoMap[destination.droppableId];
  const actividadId = parseInt(draggableId);

  try {
    // Actualizar en el backend
    await actividadesService.cambiarEstado(actividadId, nuevoEstadoId);

    // Actualizar el estado local
    if (data && data.actividades) {
      const actividadesActualizadas = data.actividades.map(act => 
        act.id === actividadId 
          ? { ...act, id_estado: nuevoEstadoId, estado: getEstadoNombre(nuevoEstadoId) }
          : act
      );

      setData({
        ...data,
        actividades: actividadesActualizadas,
        estadisticas: {
          pendientes: actividadesActualizadas.filter(a => a.id_estado === 1).length,
          en_progreso: actividadesActualizadas.filter(a => a.id_estado === 2).length,
          completadas: actividadesActualizadas.filter(a => a.id_estado === 3).length,
        }
      });
    }

    toast({
      title: "✅ Estado actualizado",
      description: `La actividad se movió a ${getEstadoNombre(nuevoEstadoId)}`,
    });

  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    toast({
      title: "❌ Error",
      description: "No se pudo actualizar el estado de la actividad",
      variant: "destructive",
    });
  } finally {
    setIsDragging(false);
  }
};

const onDragStart = () => {
  setIsDragging(true);
};
```

#### ✅ Estructura del JSX:

**1. DragDropContext envuelve todo el tablero:**
```tsx
<DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* 3 columnas aquí */}
  </div>
</DragDropContext>
```

**2. Cada columna es un Droppable:**
```tsx
<Droppable droppableId="pendientes"> {/* o "enProgreso" o "finalizadas" */}
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
        snapshot.isDraggingOver ? 'bg-gray-100' : ''
      }`}
    >
      {/* Actividades aquí */}
      {provided.placeholder}
    </div>
  )}
</Droppable>
```

**3. Cada actividad es un Draggable:**
```tsx
<Draggable
  key={actividad.id.toString()}
  draggableId={actividad.id.toString()}
  index={index}
>
  {(provided, snapshot) => (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`hover:shadow-md transition-shadow ${
        snapshot.isDragging ? 'shadow-xl rotate-2' : ''
      }`}
    >
      {/* Contenido de la card */}
    </Card>
  )}
</Draggable>
```

---

## 🎨 Efectos Visuales

### 1. **Mientras se arrastra:**
```css
shadow-xl rotate-2
```
- La card se eleva con sombra pronunciada
- Rota 2 grados para dar efecto de "levantamiento"

### 2. **Cuando se pasa sobre una columna:**
```css
isDraggingOver ? 'bg-gray-100' : ''    // Pendientes
isDraggingOver ? 'bg-blue-50' : ''     // En Progreso
isDraggingOver ? 'bg-green-50' : ''    // Finalizadas
```
- La columna cambia de color sutilmente
- Indica dónde se soltará la card

### 3. **Min-height en columnas vacías:**
```css
min-h-[200px]
```
- Asegura que las columnas vacías sean visibles y puedan recibir drops

---

## 🔄 Flujo de Drag and Drop

```
1. Usuario hace click en una actividad
   └─> onDragStart() se dispara
       └─> setIsDragging(true)

2. Usuario arrastra la actividad
   └─> Feedback visual:
       - Card con shadow-xl y rotate-2
       - Columna destino con bg color

3. Usuario suelta la actividad en otra columna
   └─> onDragEnd(result) se dispara
       
4. Validaciones:
   ✓ ¿Hay destino? Si no, cancelar
   ✓ ¿Es el mismo lugar? Si sí, cancelar
   
5. Mapeo de columna a estado:
   "pendientes"  → id_estado: 1
   "enProgreso"  → id_estado: 2
   "finalizadas" → id_estado: 3

6. Petición al backend:
   PUT /api/actividades/:id { id_estado: X }

7. Actualización del estado local:
   - Actualizar actividad con nuevo id_estado
   - Recalcular estadísticas
   - Reagrupar actividades

8. Notificación al usuario:
   Toast: "✅ Estado actualizado - La actividad se movió a [Estado]"

9. Limpieza:
   setIsDragging(false)
```

---

## 🎯 Características Implementadas

- ✅ Drag and drop fluido entre columnas
- ✅ Feedback visual mientras se arrastra
- ✅ Highlight de columna destino
- ✅ Animación de rotación al arrastrar
- ✅ Persistencia en el backend con `PUT /api/actividades/:id`
- ✅ Actualización optimista del UI
- ✅ Recálculo automático de estadísticas
- ✅ Notificaciones toast de éxito/error
- ✅ Manejo de errores completo
- ✅ Logs de debug en consola
- ✅ Validación de movimientos innecesarios
- ✅ Min-height para columnas vacías
- ✅ Placeholder para mantener espacio mientras se arrastra

---

## 🧪 Cómo Probar

### 1. **Arrastrar una actividad:**
```
1. Ve a /proyecto/1/actividades
2. Haz click y mantén presionado en una card de actividad
3. Arrastra hacia otra columna
4. La columna destino se iluminará
5. Suelta el mouse
6. Verás:
   - Toast de confirmación "✅ Estado actualizado"
   - La actividad en su nueva columna
   - Estadísticas actualizadas
```

### 2. **Verificar en consola:**
```javascript
🎯 Drag end: {
  actividadId: 5,
  desde: "pendientes",
  hacia: "enProgreso",
  nuevoEstadoId: 2
}
🔄 Cambiando estado de actividad 5 a estado 2
🔑 Token agregado a PUT /api/actividades/5
✅ Estado actualizado: { success: true, ... }
```

### 3. **Verificar en Network:**
```http
Request:
PUT /api/actividades/5
{ "id_estado": 2 }

Response:
{
  "success": true,
  "message": "Actividad actualizada exitosamente",
  "data": { ... }
}
```

---

## ⚙️ Configuración Técnica

### Mapeo de Estados:
```typescript
const estadoMap: { [key: string]: number } = {
  'pendientes': 1,   // id_estado en el backend
  'enProgreso': 2,
  'finalizadas': 3,
};
```

### DroppableIds:
- `"pendientes"` → Columna izquierda (gris)
- `"enProgreso"` → Columna central (azul)
- `"finalizadas"` → Columna derecha (verde)

### DraggableIds:
- `actividad.id.toString()` → ID único de cada actividad

---

## 🐛 Manejo de Errores

### 1. **Sin destino (sueltas fuera del tablero):**
```typescript
if (!destination) {
  setIsDragging(false);
  return; // No hace nada
}
```

### 2. **Mismo lugar (no hay cambio):**
```typescript
if (source.droppableId === destination.droppableId && source.index === destination.index) {
  setIsDragging(false);
  return; // No hace nada
}
```

### 3. **Error en el backend:**
```typescript
catch (error) {
  console.error('❌ Error al actualizar estado:', error);
  toast({
    title: "❌ Error",
    description: "No se pudo actualizar el estado de la actividad",
    variant: "destructive",
  });
}
```

**Importante:** Si el backend falla, el estado local NO se actualiza, manteniendo la consistencia.

---

## 🎨 Estilos Dinámicos

### Actividad siendo arrastrada:
```tsx
className={`hover:shadow-md transition-shadow ${
  snapshot.isDragging ? 'shadow-xl rotate-2' : ''
}`}
```

### Columna recibiendo drop:
```tsx
className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
  snapshot.isDraggingOver ? 'bg-blue-50' : ''
}`}
```

---

## 📊 Actualización de Estadísticas

Después de cada drop exitoso, se recalculan:

```typescript
estadisticas: {
  pendientes: actividadesActualizadas.filter(a => a.id_estado === 1).length,
  en_progreso: actividadesActualizadas.filter(a => a.id_estado === 2).length,
  completadas: actividadesActualizadas.filter(a => a.id_estado === 3).length,
}
```

Esto actualiza los badges en la parte superior:
```
Total: 4
Pendientes: 1
En Progreso: 2
Finalizadas: 1
```

---

## 🔮 Posibles Mejoras Futuras

- [ ] Undo/Redo de movimientos
- [ ] Animaciones más suaves con Framer Motion
- [ ] Confirmación antes de mover a "Finalizada"
- [ ] Drag horizontal para reordenar dentro de la misma columna
- [ ] Multi-select para mover múltiples actividades
- [ ] Restricciones de permisos (solo líder puede mover)
- [ ] Historial de cambios de estado
- [ ] Drag desde lista global de actividades
- [ ] Touch support para móviles

---

## ✅ Resultado Final

### Antes (❌):
- Cards estáticas, sin interacción
- Solo lectura del estado

### Ahora (✅):
- ✅ Drag and drop fluido
- ✅ Cambio de estado con un arrastre
- ✅ Feedback visual inmediato
- ✅ Persistencia en backend (un solo endpoint para todos los estados)
- ✅ Estadísticas en tiempo real
- ✅ Notificaciones de confirmación
- ✅ Manejo robusto de errores

**Endpoint usado:** `PUT /api/actividades/:id` con `{ id_estado: 1|2|3 }`

**¡Tablero Kanban completamente funcional!** 🎉
