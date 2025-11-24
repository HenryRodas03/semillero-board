# Implementación: Crear Campo para SuperAdmin

## 📋 Resumen
Se ha implementado la funcionalidad de **Crear Campo de Investigación** para el SuperAdmin (rol 5) en la página de detalle de semillero (`SemilleroDetail.tsx`), permitiendo la misma funcionalidad que tiene el Admin Semillero (rol 1) en su vista.

## ✅ Cambios Realizados

### 1. **Imports Añadidos** (líneas 1-16)
```typescript
// Añadidos:
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { camposService } from "@/services/camposService";
import { Plus } from "lucide-react";
```

### 2. **Estados para Crear Campo** (después de línea 63)
```typescript
// Estados para crear campo (solo para rol 5)
const [openCrearCampo, setOpenCrearCampo] = useState(false);
const [crearCampoSubmitting, setCrearCampoSubmitting] = useState(false);
const [nuevoCampo, setNuevoCampo] = useState({ 
  nombre: '', 
  descripcion: '', 
  lider: '',
  horario_reunion: '',
  contacto_email: '',
  contacto_redes_sociales: ''
});
const [nuevoCampoImagen, setNuevoCampoImagen] = useState<File | null>(null);
const [nuevoCampoImagenPreview, setNuevoCampoImagenPreview] = useState<string>('');
```

### 3. **Funciones Handler** (después de cancelEdit)
```typescript
// Abrir diálogo
const openCrearCampoDialog = () => setOpenCrearCampo(true);

// Manejar carga de imagen
const handleNuevoCampoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setNuevoCampoImagen(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNuevoCampoImagenPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};

// Crear campo
const handleCrearCampo = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validaciones
  if (!nuevoCampo.nombre.trim()) {
    toast({ title: 'Nombre requerido', description: 'Indica el nombre del campo', variant: 'destructive' });
    return;
  }

  if (!nuevoCampo.lider || !nuevoCampo.lider.trim()) {
    toast({ title: 'Líder requerido', description: 'Debes especificar el ID del usuario líder', variant: 'destructive' });
    return;
  }

  if (!nuevoCampo.descripcion.trim()) {
    toast({ title: 'Descripción requerida', description: 'Indica la descripción del campo', variant: 'destructive' });
    return;
  }

  if (!id || !semillero) {
    toast({ title: 'Error', description: 'No se pudo identificar el semillero', variant: 'destructive' });
    return;
  }

  try {
    setCrearCampoSubmitting(true);
    const data = new FormData();
    data.append('nombre', nuevoCampo.nombre);
    data.append('lider', nuevoCampo.lider);
    data.append('descripcion', nuevoCampo.descripcion);
    data.append('id_semillero', id); // Especificar el semillero explícitamente
    
    // Campos opcionales
    if (nuevoCampo.horario_reunion) {
      data.append('horario_reunion', nuevoCampo.horario_reunion);
    }
    if (nuevoCampo.contacto_email) {
      data.append('contacto_email', nuevoCampo.contacto_email);
    }
    if (nuevoCampo.contacto_redes_sociales) {
      data.append('contacto_redes_sociales', nuevoCampo.contacto_redes_sociales);
    }
    if (nuevoCampoImagen) {
      data.append('imagen', nuevoCampoImagen);
    }

    await camposService.create(data);
    
    // Recargar datos del semillero
    await loadSemillero();
    
    // Reset y cerrar diálogo
    setOpenCrearCampo(false);
    setNuevoCampo({ 
      nombre: '', 
      descripcion: '', 
      lider: '',
      horario_reunion: '',
      contacto_email: '',
      contacto_redes_sociales: ''
    });
    setNuevoCampoImagen(null);
    setNuevoCampoImagenPreview('');
    toast({ title: 'Campo creado', description: 'El campo de investigación fue creado correctamente' });
  } catch (error: any) {
    console.error('❌ Error al crear campo:', error);
    toast({ 
      title: 'Error al crear campo', 
      description: error.response?.data?.message || error.message || 'No fue posible crear el campo', 
      variant: 'destructive' 
    });
  } finally {
    setCrearCampoSubmitting(false);
  }
};
```

### 4. **Botón "Crear Campo"** (en TabsContent de campos)
```typescript
<TabsContent value="campos" className="space-y-4">
  {/* Botón crear campo para SuperAdmin (rol 5) */}
  {user?.id_rol === 5 && (
    <div className="flex items-center justify-between">
      <div />
      <div>
        <Button size="sm" onClick={openCrearCampoDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Campo
        </Button>
      </div>
    </div>
  )}
  
  {/* ... resto del contenido de campos ... */}
</TabsContent>
```

### 5. **Dialog Completo** (antes del LoadingOverlay)
```typescript
{/* Dialog: Crear Campo (solo para SuperAdmin - rol 5) */}
{user?.id_rol === 5 && (
  <Dialog open={openCrearCampo} onOpenChange={setOpenCrearCampo}>
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Crear Campo de Investigación</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleCrearCampo} className="space-y-4">
        {/* Preview de imagen */}
        {nuevoCampoImagenPreview && (
          <div className="flex justify-center">
            <img 
              src={nuevoCampoImagenPreview} 
              alt="Preview" 
              className="w-32 h-32 object-cover rounded-lg border-2 border-border"
            />
          </div>
        )}
        
        {/* Campos del formulario */}
        <div className="space-y-2">
          <Label htmlFor="campo-nombre">Nombre del Campo *</Label>
          <Input 
            id="campo-nombre"
            value={nuevoCampo.nombre} 
            onChange={(e) => setNuevoCampo(prev => ({ ...prev, nombre: e.target.value }))} 
            placeholder="Ej: Inteligencia Artificial"
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="campo-lider">ID del Líder (Usuario) *</Label>
          <Input 
            id="campo-lider"
            type="number"
            value={nuevoCampo.lider} 
            onChange={(e) => setNuevoCampo(prev => ({ ...prev, lider: e.target.value }))} 
            placeholder="Ej: 2"
            required 
          />
          <p className="text-xs text-muted-foreground">
            ID del usuario que será líder del campo (debe tener rol 2)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="campo-descripcion">Descripción *</Label>
          <Textarea 
            id="campo-descripcion"
            value={nuevoCampo.descripcion} 
            onChange={(e) => setNuevoCampo(prev => ({ ...prev, descripcion: e.target.value }))} 
            placeholder="Describe el campo de investigación..."
            rows={4}
            required
          />
        </div>
        
        {/* Campos opcionales: imagen, horario, email, redes sociales */}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => {
              setOpenCrearCampo(false);
              setNuevoCampo({ 
                nombre: '', 
                descripcion: '', 
                lider: '',
                horario_reunion: '',
                contacto_email: '',
                contacto_redes_sociales: ''
              });
              setNuevoCampoImagen(null);
              setNuevoCampoImagenPreview('');
            }}
            disabled={crearCampoSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={crearCampoSubmitting}>
            {crearCampoSubmitting ? 'Creando...' : 'Crear Campo'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)}
```

## 🎯 Funcionalidades Implementadas

### Para SuperAdmin (rol 5) en SemilleroDetail:
✅ **Botón "Crear Campo"** visible en la pestaña de Campos  
✅ **Dialog con formulario completo**:
   - Campos requeridos: Nombre, Líder (ID de usuario), Descripción
   - Campos opcionales: Imagen, Horario de reuniones, Email, Redes sociales
   - Preview de imagen al seleccionar archivo
   - Validaciones de formulario
   - Loading state durante la creación

✅ **Creación de campo**:
   - Se envía `id_semillero` explícitamente al backend
   - Soporte para FormData (permite subir imagen)
   - Recarga automática de datos después de crear
   - Toast notifications para éxito/error

✅ **Experiencia de usuario**:
   - Botón solo visible para rol 5
   - Estado de loading con texto "Creando..."
   - Reset completo del formulario al cerrar
   - Manejo de errores con mensajes descriptivos

## 🔐 Control de Acceso
- La funcionalidad está **protegida por rol**: solo `user?.id_rol === 5` puede ver y usar el botón
- El diálogo también está condicionado al rol 5
- El Admin Semillero (rol 1) ya tiene esta funcionalidad en su propia vista `MiSemillero.tsx`

## 📝 Diferencia con Admin Semillero
La principal diferencia con la implementación en `MiSemillero.tsx` es:
- **MiSemillero**: El `id_semillero` se auto-asigna en el backend basado en el usuario autenticado
- **SemilleroDetail**: Se debe enviar explícitamente `id_semillero` porque el SuperAdmin puede crear campos para cualquier semillero

## 🧪 Testing Recomendado
1. ✅ Login como SuperAdmin (rol 5)
2. ✅ Navegar a cualquier semillero (lista de semilleros → Ver semillero)
3. ✅ Ir a la pestaña "Campos de Investigación"
4. ✅ Verificar que aparece el botón "Crear Campo"
5. ✅ Hacer clic y completar el formulario
6. ✅ Verificar validaciones de campos requeridos
7. ✅ Probar subir una imagen (opcional)
8. ✅ Crear el campo y verificar que:
   - Se muestra el toast de éxito
   - El campo aparece en la lista
   - El diálogo se cierra y resetea

## 📊 Estado del Proyecto
Con esta implementación, el SuperAdmin ahora tiene **paridad de funcionalidades** con el Admin Semillero en lo que respecta a la gestión de campos:

| Funcionalidad | Admin Semillero (rol 1) | SuperAdmin (rol 5) |
|---------------|------------------------|-------------------|
| Ver semilleros | ✅ Solo el propio | ✅ Todos |
| Editar semillero | ✅ Solo el propio | ✅ Todos |
| Eliminar semillero | ❌ No | ✅ Todos |
| Ver campos | ✅ Solo los propios | ✅ Todos |
| **Crear campo** | ✅ **Sí** | ✅ **Sí (NUEVO)** |
| Editar campo | ✅ Solo los propios | ⏳ Pendiente |
| Eliminar campo | ⏳ Pendiente | ⏳ Pendiente |

## 📁 Archivos Modificados
- ✅ `/src/pages/SemilleroDetail.tsx` - Implementación completa

## 🚀 Próximos Pasos
- Considerar añadir funcionalidad de editar campos para SuperAdmin
- Considerar añadir funcionalidad de eliminar campos para SuperAdmin
- Agregar un selector de usuarios (dropdown) en lugar de ingresar ID manualmente
