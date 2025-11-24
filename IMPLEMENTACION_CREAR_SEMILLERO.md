# Implementación: Crear Semillero (Rol 5 - SuperAdmin)

## 📋 Descripción
Se implementó la funcionalidad para que el SuperAdmin (rol 5) pueda crear nuevos semilleros desde la vista de Semilleros.

## 🔧 Cambios Realizados

### 1. **Servicio semillerosService.ts**
Se actualizó el método `create` para soportar FormData (multipart/form-data):

```typescript
async create(data: FormData): Promise<Semillero> {
  const response = await api.post('/semilleros', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}
```

### 2. **Página Semilleros.tsx**

#### Imports Agregados:
```typescript
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useToast } from '@/hooks/use-toast';
import { usuariosService } from '@/services/usuariosService';
import { lineasInvestigacionService } from '@/services/lineasInvestigacionService';
import { Plus, Upload, X } from 'lucide-react';
```

#### Estados Agregados:
```typescript
// Estados para crear semillero
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [isCreating, setIsCreating] = useState(false);
const [usuarios, setUsuarios] = useState<any[]>([]);
const [lineasInvestigacion, setLineasInvestigacion] = useState<any[]>([]);
const [loadingUsuarios, setLoadingUsuarios] = useState(false);
const [loadingLineas, setLoadingLineas] = useState(false);

const [formData, setFormData] = useState({
  nombre: '',
  descripcion: '',
  contacto: '',
  lider: '',
  lineas_investigacion_id: ''
});
const [selectedImage, setSelectedImage] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string>('');
```

#### Funciones Implementadas:

**1. loadUsuariosYLineas():**
- Carga usuarios y líneas de investigación cuando se abre el dialog
- Se ejecuta automáticamente con useEffect cuando `isCreateDialogOpen` es true

**2. handleImageChange():**
- Valida tamaño de imagen (máx 5MB)
- Crea preview base64
- Maneja el archivo seleccionado

**3. handleCreateSemillero():**
- Valida campos requeridos (nombre, líder, línea de investigación)
- Construye FormData con todos los campos
- Envía imagen si fue seleccionada
- Recarga lista de semilleros después de crear
- Resetea formulario y cierra dialog

**4. resetForm():**
- Limpia todos los campos del formulario
- Remueve imagen seleccionada y preview

#### UI Implementada:

**Botón de Crear (visible solo para rol 5):**
```tsx
{user?.id_rol === 5 && (
  <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#008042] hover:bg-[#025d31] text-white">
    <Plus className="w-4 h-4 mr-2" />
    Crear Semillero
  </Button>
)}
```

**Dialog con Formulario:**
- Nombre del Semillero (Input - requerido)
- Descripción (Textarea - requerido)
- Líder del Semillero (Select - requerido)
- Línea de Investigación (Select - requerido)
- Correo de Contacto (Input email - opcional)
- Imagen del Semillero (File input - opcional)
  - Preview de imagen
  - Botón para remover imagen
  - Validación de tamaño (5MB max)

**Loading Overlay:**
```tsx
<LoadingOverlay isLoading={isCreating} message="Creando semillero..." />
```

## 📡 Endpoint Backend

**URL:** `POST http://localhost:3000/api/semilleros`

**Content-Type:** `multipart/form-data`

**Campos Requeridos:**
```json
{
  "nombre": "string",
  "lider": "number (id del usuario)",
  "descripcion": "string",
  "lineas_investigacion_id": "number (id de línea)"
}
```

**Campos Opcionales:**
```json
{
  "contacto": "string (email)",
  "imagen": "File (archivo de imagen)"
}
```

## ✅ Características Implementadas

1. **Validación de Formulario:**
   - Nombre: Obligatorio, no vacío
   - Líder: Obligatorio, debe seleccionar un usuario
   - Línea de Investigación: Obligatorio
   - Descripción: Obligatorio
   - Contacto: Opcional, validación de formato email
   - Imagen: Opcional, máximo 5MB

2. **Carga Dinámica de Datos:**
   - Lista de usuarios se carga al abrir el dialog
   - Lista de líneas de investigación se carga al abrir el dialog
   - Indicadores de carga mientras se obtienen los datos

3. **Manejo de Imágenes:**
   - Preview en tiempo real
   - Validación de tamaño
   - Botón para remover imagen seleccionada
   - Soporte para formatos: JPG, PNG, GIF

4. **UX/UI:**
   - Loading overlay durante creación
   - Toast notifications para éxito/error
   - Botón deshabilitado durante creación
   - Cancelar resetea el formulario
   - Dialog con scroll para contenido largo

5. **Permisos:**
   - Solo visible para usuarios con `id_rol === 5` (SuperAdmin)
   - Botón de crear solo aparece si el rol es 5

## 🎨 Estilos
- Botón verde corporativo: `bg-[#008042] hover:bg-[#025d31]`
- Dialog responsivo: `max-w-2xl max-h-[90vh] overflow-y-auto`
- Preview de imagen: `w-24 h-24 object-cover rounded-lg border`

## 🔄 Flujo de Trabajo

1. Usuario con rol 5 entra a vista de Semilleros
2. Ve el botón "Crear Semillero" en el header
3. Click en el botón abre el dialog
4. Se cargan automáticamente usuarios y líneas de investigación
5. Usuario completa el formulario (campos requeridos marcados con *)
6. Opcionalmente sube una imagen (preview se muestra)
7. Click en "Crear Semillero"
8. Muestra loading overlay con BounceLoader
9. Se envía FormData al backend
10. Backend crea el semillero y retorna datos
11. Frontend recarga lista de semilleros
12. Toast de éxito y cierre de dialog
13. Formulario se resetea para próximo uso

## 📝 Notas Técnicas

- **FormData:** Se usa para soportar envío de archivos multipart
- **useEffect:** Carga datos solo cuando se abre el dialog (optimización)
- **Estado loading:** Previene múltiples submissions
- **Validación cliente:** Antes de enviar al backend
- **Array.isArray():** Normaliza respuestas del backend que pueden variar
- **File API:** Para manejar y preview de imágenes
- **Toast:** Feedback inmediato al usuario

## 🐛 Manejo de Errores

- Error al cargar usuarios/líneas: Toast con mensaje
- Error de validación: Toast específico por campo
- Error del backend: Muestra mensaje del servidor
- Error de red: Toast genérico
- Imagen muy grande: Toast y no se carga

## 🚀 Mejoras Futuras

1. Agregar campo de búsqueda en selects (usuarios, líneas)
2. Permitir crear línea de investigación desde el mismo dialog
3. Permitir crear usuario líder desde el mismo dialog
4. Drag & drop para subir imagen
5. Crop de imagen antes de subir
6. Vista previa más grande de la imagen
7. Validación de duplicados de nombre
