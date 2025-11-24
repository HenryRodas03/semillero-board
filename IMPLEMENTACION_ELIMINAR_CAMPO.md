# Implementación: Eliminar Campo de Investigación

## 📋 Resumen
Se ha implementado la funcionalidad de **Eliminar Campo de Investigación** para el SuperAdmin (rol 5) en la página de detalle de semillero (`SemilleroDetail.tsx`), permitiendo eliminar campos con confirmación mediante un AlertDialog.

## ✅ Cambios Realizados

### 1. **Imports Añadidos**
```typescript
// Añadido:
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
```

### 2. **Estados para Eliminar Campo**
```typescript
// Estados para eliminar campo
const [campoToDelete, setCampoToDelete] = useState<number | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
```

### 3. **Función handleDeleteCampo**
```typescript
const handleDeleteCampo = async () => {
  if (!campoToDelete) return;

  try {
    setIsDeleting(true);
    await camposService.delete(campoToDelete);
    
    toast({
      title: 'Éxito',
      description: 'Campo eliminado correctamente'
    });

    // Recargar datos del semillero
    await loadSemillero();
    setCampoToDelete(null);
  } catch (error: any) {
    console.error('❌ Error al eliminar campo:', error);
    toast({
      title: 'Error al eliminar campo',
      description: error.response?.data?.message || 'No se pudo eliminar el campo',
      variant: 'destructive'
    });
  } finally {
    setIsDeleting(false);
  }
};
```

### 4. **Tarjetas de Campo Modificadas**

**Antes:**
```typescript
<Card  
  key={campo.id} 
  className="hover:shadow-md transition-shadow cursor-pointer" 
  onClick={() => navigate(`/campos/${campo.id}`)}
>
  {/* ... contenido ... */}
</Card>
```

**Después:**
```typescript
<Card  
  key={campo.id} 
  className="hover:shadow-md transition-shadow"
>
  <CardHeader>
    {/* ... header content ... */}
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div className="space-y-2 text-sm">
        {/* Información del campo */}
      </div>
      
      {/* Botones de acción */}
      <div className="flex items-center gap-2 pt-2 border-t">
        <Button 
          className="flex-1" 
          onClick={() => navigate(`/campos/${campo.id}`)}
        >
          Ver campo
        </Button>
        {user?.id_rol === 5 && (
          <Button 
            variant="destructive" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setCampoToDelete(campo.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  </CardContent>
</Card>
```

### 5. **AlertDialog de Confirmación**
```typescript
{/* AlertDialog: Confirmar eliminación de campo */}
<AlertDialog open={campoToDelete !== null} onOpenChange={() => setCampoToDelete(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta acción no se puede deshacer. El campo de investigación será eliminado permanentemente.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDeleteCampo}
        disabled={isDeleting}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {isDeleting ? 'Eliminando...' : 'Eliminar'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## 🎯 Funcionalidades Implementadas

### Para SuperAdmin (rol 5) en SemilleroDetail:
✅ **Botón de eliminar campo**: Visible solo para rol 5, ícono de papelera roja  
✅ **AlertDialog de confirmación**: Previene eliminaciones accidentales  
✅ **Loading state**: Botón muestra "Eliminando..." durante la operación  
✅ **Recarga automática**: Después de eliminar, se recargan los datos del semillero  
✅ **Toast notifications**: Mensajes de éxito o error  
✅ **Manejo de errores**: Captura y muestra errores del backend

### Estructura de la Tarjeta:
✅ **Sección de información**: Líder y contacto del campo  
✅ **Sección de botones separada**: Con borde superior para mejor UI  
✅ **Botón "Ver campo"**: Ocupa el ancho completo (flex-1)  
✅ **Botón eliminar**: Ícono compacto al lado derecho  
✅ **Sin cursor-pointer global**: Evita navegación no deseada al hacer clic en la tarjeta

## 🔐 Control de Acceso

- La funcionalidad está **protegida por rol**: solo `user?.id_rol === 5` puede ver y usar el botón
- El botón de eliminar NO es visible para Admin Semillero (rol 1) ni otros roles
- SuperAdmin puede eliminar campos de cualquier semillero

## 🔄 Flujo de Eliminación

1. SuperAdmin hace clic en el ícono de papelera (🗑️) en una tarjeta de campo
2. Se abre el AlertDialog con:
   - Título: "¿Estás seguro?"
   - Descripción: Advertencia sobre la acción irreversible
   - Botón "Cancelar": Cierra el diálogo sin hacer nada
   - Botón "Eliminar": Procede con la eliminación
3. Al confirmar:
   - Botón cambia a "Eliminando..." y se deshabilita
   - Se llama a `DELETE /api/campos/:id`
   - Backend elimina el campo
4. Respuesta exitosa:
   - Toast de éxito: "Campo eliminado correctamente"
   - Se recargan los datos del semillero
   - El campo desaparece de la lista
5. Respuesta con error:
   - Toast de error con mensaje del backend
   - El campo permanece en la lista

## 📡 API Endpoint Utilizado

```
DELETE http://localhost:3000/api/campos/:id
Authorization: Bearer {token}
```

El servicio `camposService.delete(id)` maneja la petición automáticamente con el token del usuario autenticado.

## 🎨 Mejoras de UI

### Antes:
- Toda la tarjeta era clickeable
- No había forma de eliminar campos desde esta vista
- Había que entrar a cada campo para gestionarlo

### Después:
- Botones claramente separados en su propia sección
- Botón "Ver campo" para navegación
- Botón de eliminar visible solo para SuperAdmin
- Confirmación antes de eliminar (previene errores)
- Feedback visual durante la operación

## 📊 Estado del Proyecto

Con esta implementación, el SuperAdmin ahora puede gestionar completamente los campos desde la vista de semillero:

| Funcionalidad | Admin Semillero (rol 1) | SuperAdmin (rol 5) |
|---------------|------------------------|-------------------|
| Ver campos | ✅ Solo los propios | ✅ Todos |
| Crear campo | ✅ Solo en su semillero | ✅ En cualquier semillero |
| Ver detalle de campo | ✅ Sí | ✅ Sí |
| **Eliminar campo** | ❌ No | ✅ **Sí (NUEVO)** |
| Editar campo | ✅ Solo los propios | ⏳ Pendiente |

## 🧪 Testing Recomendado

1. ✅ Login como SuperAdmin (rol 5)
2. ✅ Navegar a cualquier semillero con campos
3. ✅ Ir a la pestaña "Campos de Investigación"
4. ✅ **Verificar botón de eliminar**:
   - Debe aparecer ícono de papelera roja al lado de "Ver campo"
   - Solo para SuperAdmin (rol 5)
5. ✅ **Hacer clic en eliminar**:
   - Debe abrir AlertDialog de confirmación
   - Leer mensaje de advertencia
   - Verificar que se pueden cancelar
6. ✅ **Confirmar eliminación**:
   - Botón debe cambiar a "Eliminando..."
   - Debe mostrar toast de éxito
   - Campo debe desaparecer de la lista
7. ✅ **Probar con otro rol**:
   - Login como Admin Semillero (rol 1)
   - Verificar que NO aparece el botón de eliminar

## ⚠️ Consideraciones

### Seguridad
- La eliminación requiere autorización en el backend
- Solo SuperAdmin puede eliminar campos
- Token JWT requerido en las peticiones

### Prevención de Errores
- AlertDialog previene eliminaciones accidentales
- Mensaje claro: "Esta acción no se puede deshacer"
- Botón deshabilitado durante la operación

### Experiencia de Usuario
- Feedback visual inmediato (loading state)
- Toast notifications claras
- Recarga automática de datos
- Manejo de errores con mensajes descriptivos

## 📁 Archivos Modificados

- ✅ `/src/pages/SemilleroDetail.tsx` - Implementación completa

## 🚀 Próximos Pasos Sugeridos

- Considerar añadir eliminación suave (soft delete) en lugar de eliminación permanente
- Agregar log de auditoría de eliminaciones
- Implementar funcionalidad de editar campo para SuperAdmin
- Considerar añadir confirmación adicional para campos con proyectos activos
- Agregar contador de proyectos asociados antes de eliminar

## 🎉 Resultado Final

El SuperAdmin ahora tiene control completo sobre la gestión de campos de investigación desde la vista de semillero, pudiendo eliminar campos con un sistema de confirmación robusto que previene errores y proporciona feedback claro en todo momento.
