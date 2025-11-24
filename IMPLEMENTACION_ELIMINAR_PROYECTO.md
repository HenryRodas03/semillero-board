# Implementación: Eliminar Proyecto

## 📋 Resumen
Se ha implementado la funcionalidad de **Eliminar Proyecto** en la página de detalle de campo (`CampoDetail.tsx`), permitiendo que Admin Semillero (rol 1), Líder Campo (rol 2) y SuperAdmin (rol 5) puedan eliminar proyectos con confirmación mediante AlertDialog.

## ✅ Cambios Realizados

### 1. **Imports Añadidos**
```typescript
// Añadidos:
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
```

### 2. **Estados para Eliminar Proyecto**
```typescript
// Eliminar proyecto
const [proyectoToDelete, setProyectoToDelete] = useState<number | null>(null);
const [isDeletingProyecto, setIsDeletingProyecto] = useState(false);
```

### 3. **Función handleDeleteProyecto**
```typescript
const handleDeleteProyecto = async () => {
  if (!proyectoToDelete) return;

  try {
    setIsDeletingProyecto(true);
    await proyectosService.delete(proyectoToDelete);
    
    toast({
      title: 'Éxito',
      description: 'Proyecto eliminado correctamente'
    });

    // Recargar el campo completo
    await loadCampoDetail();
    setProyectoToDelete(null);
  } catch (error: any) {
    console.error('❌ Error al eliminar proyecto:', error);
    toast({
      title: 'Error al eliminar proyecto',
      description: error.response?.data?.message || 'No se pudo eliminar el proyecto',
      variant: 'destructive'
    });
  } finally {
    setIsDeletingProyecto(false);
  }
};
```

### 4. **Tarjetas de Proyecto Modificadas**

**Antes:**
```typescript
<CardContent className="space-y-2">
  {proyecto.url && (
    <a href={proyecto.url} target="_blank" rel="noopener noreferrer">
      🔗 {proyecto.url}
    </a>
  )}
  <Button asChild size="sm" variant="outline" className="w-full">
    <Link to={`/projects/${proyecto.id}`}>
      Ver Proyecto
    </Link>
  </Button>
</CardContent>
```

**Después:**
```typescript
<CardContent className="space-y-2">
  {proyecto.url && (
    <a href={proyecto.url} target="_blank" rel="noopener noreferrer">
      🔗 {proyecto.url}
    </a>
  )}
  
  {/* Botones de acción */}
  <div className="flex items-center gap-2 pt-2">
    <Button asChild size="sm" variant="outline" className="flex-1">
      <Link to={`/projects/${proyecto.id}`}>
        Ver Proyecto
      </Link>
    </Button>
    
    {/* Botón eliminar - Solo visible para Admin Semillero (1), Líder Campo (2) o SuperAdmin (5) */}
    {(user?.id_rol === 1 || user?.id_rol === 2 || user?.id_rol === 5) && (
      <Button 
        variant="destructive" 
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setProyectoToDelete(proyecto.id);
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    )}
  </div>
</CardContent>
```

### 5. **AlertDialog de Confirmación**
```typescript
{/* AlertDialog: Confirmar eliminación de proyecto */}
<AlertDialog open={proyectoToDelete !== null} onOpenChange={() => setProyectoToDelete(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta acción no se puede deshacer. El proyecto será eliminado permanentemente junto con todas sus actividades y tareas asociadas.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isDeletingProyecto}>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDeleteProyecto}
        disabled={isDeletingProyecto}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {isDeletingProyecto ? 'Eliminando...' : 'Eliminar'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## 🎯 Funcionalidades Implementadas

### Para roles autorizados:
✅ **Botón de eliminar proyecto**: Visible para rol 1, 2 y 5  
✅ **AlertDialog de confirmación**: Previene eliminaciones accidentales con advertencia clara  
✅ **Loading state**: Botón muestra "Eliminando..." durante la operación  
✅ **Recarga automática**: Después de eliminar, se recargan los datos del campo  
✅ **Toast notifications**: Mensajes de éxito o error  
✅ **Manejo de errores**: Captura y muestra errores del backend  
✅ **Advertencia sobre datos asociados**: Menciona que se eliminarán actividades y tareas

### Estructura de la Tarjeta:
✅ **Sección de información**: Título, descripción, avance y URL del proyecto  
✅ **Sección de botones**: Con separación visual (pt-2)  
✅ **Botón "Ver Proyecto"**: Ocupa el ancho completo (flex-1)  
✅ **Botón eliminar**: Ícono compacto al lado derecho  
✅ **stopPropagation()**: Evita comportamientos no deseados

## 🔐 Control de Acceso

El botón de eliminar solo es visible para:
- ✅ **Admin Semillero (rol 1)**: Puede eliminar proyectos de sus campos
- ✅ **Líder Campo (rol 2)**: Puede eliminar proyectos de su campo
- ✅ **SuperAdmin (rol 5)**: Puede eliminar proyectos de cualquier campo

**NO visible para:**
- ❌ Colaboradores (rol 4)
- ❌ Otros roles no autorizados

## 🔄 Flujo de Eliminación

1. Usuario autorizado (rol 1, 2 o 5) hace clic en el ícono de papelera (🗑️)
2. Se abre el AlertDialog con:
   - Título: "¿Estás seguro?"
   - Descripción: Advertencia sobre la eliminación permanente de actividades y tareas
   - Botón "Cancelar": Cierra el diálogo sin hacer nada
   - Botón "Eliminar": Procede con la eliminación
3. Al confirmar:
   - Botón cambia a "Eliminando..." y se deshabilita
   - Se llama a `DELETE /api/projects/:id`
   - Backend elimina el proyecto
4. Respuesta exitosa:
   - Toast de éxito: "Proyecto eliminado correctamente"
   - Se recargan los datos del campo
   - El proyecto desaparece de la lista
5. Respuesta con error:
   - Toast de error con mensaje del backend
   - El proyecto permanece en la lista

## 📡 API Endpoint Utilizado

```
DELETE http://localhost:3000/api/projects/:id
Authorization: Bearer {token}
```

El servicio `proyectosService.delete(id)` maneja la petición automáticamente con el token del usuario autenticado.

## 🎨 Mejoras de UI

### Antes:
- Solo había botón "Ver Proyecto" que ocupaba todo el ancho
- No había forma de eliminar proyectos desde esta vista
- Había que entrar al proyecto para cualquier gestión

### Después:
- Botones claramente organizados en fila
- Botón "Ver Proyecto" ocupa espacio principal (flex-1)
- Botón de eliminar compacto al lado (size="icon")
- Confirmación antes de eliminar (previene errores)
- Feedback visual durante la operación
- Solo visible para roles autorizados

## 📊 Comparación de Permisos

| Rol | Ver Proyectos | Crear Proyectos | Eliminar Proyectos |
|-----|--------------|-----------------|-------------------|
| **Admin Semillero (1)** | ✅ Todos los de su semillero | ✅ En sus campos | ✅ **Sí (NUEVO)** |
| **Líder Campo (2)** | ✅ Los de su campo | ✅ En su campo | ✅ **Sí (NUEVO)** |
| Colaborador (4) | ✅ Los de sus campos | ❌ No | ❌ No |
| **SuperAdmin (5)** | ✅ Todos | ✅ En cualquier campo | ✅ **Sí (NUEVO)** |

## 🧪 Testing Recomendado

### Test 1: Admin Semillero (rol 1)
1. ✅ Login como Admin Semillero
2. ✅ Navegar a uno de sus campos
3. ✅ **Verificar botón de eliminar**:
   - Debe aparecer ícono de papelera roja
   - Al lado del botón "Ver Proyecto"
4. ✅ **Hacer clic en eliminar**:
   - Debe abrir AlertDialog
   - Leer advertencia sobre actividades y tareas
5. ✅ **Confirmar eliminación**:
   - Botón debe cambiar a "Eliminando..."
   - Toast de éxito
   - Proyecto desaparece

### Test 2: Líder Campo (rol 2)
1. ✅ Login como Líder de Campo
2. ✅ Navegar a su campo
3. ✅ Verificar que puede eliminar proyectos de su campo
4. ✅ Confirmar que NO puede eliminar proyectos de otros campos

### Test 3: SuperAdmin (rol 5)
1. ✅ Login como SuperAdmin
2. ✅ Navegar a cualquier campo
3. ✅ Verificar que puede eliminar cualquier proyecto
4. ✅ Probar en múltiples campos diferentes

### Test 4: Colaborador (rol 4)
1. ✅ Login como Colaborador
2. ✅ Navegar a un campo donde es integrante
3. ✅ **Verificar que NO aparece el botón de eliminar**
4. ✅ Confirmar que solo puede ver proyectos

### Test 5: Manejo de Errores
1. ✅ Simular error de red
2. ✅ Verificar que muestra toast de error
3. ✅ Confirmar que el proyecto no se elimina
4. ✅ Verificar que el estado se resetea correctamente

## ⚠️ Consideraciones Importantes

### Eliminación en Cascada
El mensaje del AlertDialog advierte que:
> "El proyecto será eliminado permanentemente junto con todas sus actividades y tareas asociadas."

Esto debe estar implementado en el backend para mantener la integridad de datos.

### Seguridad
- La eliminación requiere autorización en el backend
- Solo roles 1, 2 y 5 pueden eliminar proyectos
- Token JWT requerido en las peticiones
- Backend debe validar permisos adicionales

### Prevención de Errores
- AlertDialog previene eliminaciones accidentales
- Mensaje claro sobre consecuencias
- Botón deshabilitado durante la operación
- No hay forma de eliminar por error

### Experiencia de Usuario
- Feedback visual inmediato (loading state)
- Toast notifications claras
- Recarga automática de datos
- Manejo de errores con mensajes descriptivos
- Botón compacto que no invade el espacio

## 🐛 Fix Adicional

Se corrigieron errores de TypeScript en el select de líder del campo (líneas 1144-1145):

**Antes:**
```typescript
const usuarioNombre = integrante.usuario?.nombre || integrante.nombre || 'Sin nombre';
const usuarioCorreo = integrante.usuario?.correo || integrante.correo || '';
```

**Después:**
```typescript
const usuarioNombre = integrante.usuario?.nombre || 'Sin nombre';
const usuarioCorreo = integrante.usuario?.correo || '';
```

Se removieron las propiedades `integrante.nombre` e `integrante.correo` que no existen en el tipo `Integrante`.

## 📁 Archivos Modificados

- ✅ `/src/pages/CampoDetail.tsx` - Implementación completa

## 🚀 Próximos Pasos Sugeridos

- Implementar soft delete en lugar de eliminación permanente
- Agregar log de auditoría de eliminaciones
- Considerar opción de "archivar" en lugar de eliminar
- Agregar contador de actividades/tareas antes de eliminar
- Implementar confirmación adicional para proyectos con mucha información
- Agregar opción de recuperar proyectos eliminados (papelera)

## 🎉 Resultado Final

Los usuarios con roles Admin Semillero (1), Líder Campo (2) y SuperAdmin (5) ahora pueden eliminar proyectos directamente desde la vista de detalle del campo, con un sistema de confirmación robusto que previene errores y proporciona feedback claro, manteniendo una interfaz limpia y profesional.

## 📊 Estado Actual de Permisos

| Acción | Admin Semillero (1) | Líder Campo (2) | Colaborador (4) | SuperAdmin (5) |
|--------|---------------------|-----------------|-----------------|----------------|
| Ver proyectos | ✅ Sus campos | ✅ Su campo | ✅ Sí | ✅ Todos |
| Crear proyectos | ✅ Sus campos | ✅ Su campo | ❌ No | ✅ Todos |
| **Eliminar proyectos** | ✅ **Sus campos** | ✅ **Su campo** | ❌ **No** | ✅ **Todos** |
| Editar proyectos | ✅ Sus campos | ✅ Su campo | ⏳ Pendiente | ✅ Todos |

El sistema ahora tiene una gestión completa de proyectos con permisos bien definidos por rol.
