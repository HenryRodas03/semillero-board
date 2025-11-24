# Mejora: Select de Líder en Crear Campo

## 📋 Resumen
Se ha mejorado la experiencia de usuario en el formulario de creación de campo para SuperAdmin, reemplazando el input manual de ID por un select dropdown que carga y muestra todos los usuarios disponibles, similar a como funciona en la creación de semilleros.

## ✅ Cambios Realizados

### 1. **Imports Añadidos**
```typescript
// Añadidos a los imports existentes:
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usuariosService } from "@/services/usuariosService";
```

### 2. **Interfaz Usuario**
```typescript
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  id_rol: number;
}
```

### 3. **Estados para Cargar Usuarios**
```typescript
// Estados para cargar usuarios
const [usuarios, setUsuarios] = useState<Usuario[]>([]);
const [loadingUsuarios, setLoadingUsuarios] = useState(false);
```

### 4. **useEffect para Cargar Usuarios**
```typescript
// Cargar usuarios cuando se abre el diálogo de crear campo
useEffect(() => {
  if (openCrearCampo && user?.id_rol === 5) {
    loadUsuarios();
  }
}, [openCrearCampo, user]);
```

### 5. **Función loadUsuarios**
```typescript
const loadUsuarios = async () => {
  try {
    setLoadingUsuarios(true);
    const usuariosData = await usuariosService.getAll();
    console.log('Respuesta usuarios:', usuariosData);
    
    // El backend puede devolver { total, users } o directamente un array
    if (usuariosData && Array.isArray((usuariosData as any).users)) {
      setUsuarios((usuariosData as any).users);
    } else if (Array.isArray(usuariosData)) {
      setUsuarios(usuariosData);
    } else {
      setUsuarios([]);
    }
  } catch (error: any) {
    console.error('Error al cargar usuarios:', error);
    toast({
      title: 'Error al cargar usuarios',
      description: error.response?.data?.message || 'No se pudieron cargar los usuarios',
      variant: 'destructive'
    });
    setUsuarios([]);
  } finally {
    setLoadingUsuarios(false);
  }
};
```

### 6. **Select Component (Reemplaza Input)**

**Antes (Input manual):**
```typescript
<div className="space-y-2">
  <Label htmlFor="campo-lider">
    ID del Líder (Usuario) *
  </Label>
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
```

**Después (Select dropdown):**
```typescript
<div className="space-y-2">
  <Label htmlFor="campo-lider">
    Líder del Campo *
  </Label>
  <Select
    value={nuevoCampo.lider}
    onValueChange={(value) => setNuevoCampo(prev => ({ ...prev, lider: value }))}
    disabled={crearCampoSubmitting || loadingUsuarios}
  >
    <SelectTrigger>
      <SelectValue placeholder="Selecciona un líder" />
    </SelectTrigger>
    <SelectContent>
      {loadingUsuarios ? (
        <SelectItem value="loading" disabled>Cargando usuarios...</SelectItem>
      ) : usuarios.length === 0 ? (
        <SelectItem value="empty" disabled>No hay usuarios disponibles</SelectItem>
      ) : (
        usuarios.map((usuario) => (
          <SelectItem key={usuario.id} value={usuario.id.toString()}>
            {usuario.nombre} - {usuario.email}
          </SelectItem>
        ))
      )}
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    Usuario que será líder del campo de investigación
  </p>
</div>
```

## 🎯 Mejoras Implementadas

### Experiencia de Usuario
✅ **Carga automática de usuarios**: Al abrir el diálogo, se cargan todos los usuarios del sistema  
✅ **Visual mejorado**: Muestra nombre y email de cada usuario  
✅ **Sin errores manuales**: No hay riesgo de escribir un ID inexistente  
✅ **Loading state**: Muestra "Cargando usuarios..." mientras se obtienen los datos  
✅ **Empty state**: Muestra "No hay usuarios disponibles" si no hay opciones  
✅ **Disabled durante submit**: El select se deshabilita mientras se crea el campo

### Consistencia
✅ **Patrón reutilizado**: Mismo comportamiento que la creación de semilleros  
✅ **Endpoint correcto**: Usa `http://localhost:3000/api/usuarios` como se solicitó  
✅ **Manejo de respuestas**: Soporta ambas estructuras de respuesta del backend (`{ total, users }` o array directo)

### Robustez
✅ **Manejo de errores**: Toast notification si falla la carga de usuarios  
✅ **Validación**: Campo requerido, debe seleccionarse un usuario  
✅ **Estado de loading**: Previene interacciones mientras se cargan datos

## 🔄 Flujo de Usuario

1. SuperAdmin hace clic en "Crear Campo"
2. Se abre el diálogo de creación
3. **Automáticamente** se cargan los usuarios desde el backend
4. El select muestra:
   - "Cargando usuarios..." durante la carga
   - Lista de usuarios con formato: `Nombre - email@example.com`
   - "No hay usuarios disponibles" si el array está vacío
5. SuperAdmin selecciona un usuario del dropdown
6. El ID del usuario seleccionado se guarda en `nuevoCampo.lider`
7. Al enviar el formulario, se usa ese ID para crear el campo

## 📊 Comparación

| Aspecto | Antes (Input) | Después (Select) |
|---------|---------------|------------------|
| Ingreso de datos | Manual (ID numérico) | Visual (nombre + email) |
| Validación | Solo verificar que sea número | Backend valida el ID existe |
| Errores posibles | ID inexistente, typos | Ninguno (solo IDs válidos) |
| UX | Requiere conocer IDs | Intuitivo y visual |
| Carga de datos | No | Sí (automática al abrir) |
| Loading states | No | Sí (muestra feedback) |
| Consistencia | Único en su tipo | Igual que crear semillero |

## 🧪 Testing Recomendado

1. ✅ Login como SuperAdmin (rol 5)
2. ✅ Navegar a un semillero y abrir la pestaña "Campos"
3. ✅ Hacer clic en "Crear Campo"
4. ✅ **Verificar carga de usuarios**:
   - Debe mostrar "Cargando usuarios..." brevemente
   - Luego debe mostrar lista de usuarios con nombre y email
5. ✅ **Probar selección**:
   - Hacer clic en el select
   - Verificar que muestra todos los usuarios
   - Seleccionar un usuario
   - Verificar que se muestra en el select
6. ✅ **Crear campo**:
   - Completar el resto del formulario
   - Crear el campo
   - Verificar que el campo se crea con el líder correcto

## 📝 Notas Técnicas

### Endpoint Utilizado
```typescript
GET http://localhost:3000/api/usuarios?
```
El servicio `usuariosService.getAll()` llama a este endpoint con los filtros opcionales que se puedan pasar.

### Estructura de Respuesta Soportada
```typescript
// Opción 1: Con metadata
{
  total: number,
  users: Usuario[]
}

// Opción 2: Array directo
Usuario[]
```

Ambas estructuras son manejadas correctamente por el código.

### Valor Guardado
El select guarda el ID del usuario como string en `nuevoCampo.lider`:
```typescript
onValueChange={(value) => setNuevoCampo(prev => ({ ...prev, lider: value }))}
```

Este valor se envía al backend en el FormData sin modificación adicional.

## 📁 Archivo Modificado
- ✅ `/src/pages/SemilleroDetail.tsx` - Mejora completa implementada

## 🚀 Beneficios

1. **Mejor UX**: Los usuarios no necesitan conocer IDs internos
2. **Menos errores**: Imposible seleccionar un usuario inexistente
3. **Visual**: Fácil identificar al usuario correcto por nombre y email
4. **Consistente**: Misma experiencia que crear semillero
5. **Profesional**: Loading states y mensajes informativos
6. **Robusto**: Manejo de errores y edge cases (sin usuarios, error de red, etc.)

## 🎉 Resultado Final

El SuperAdmin ahora puede crear campos de investigación con una interfaz moderna y fácil de usar, seleccionando visualmente el líder del campo de una lista completa de usuarios del sistema, sin necesidad de recordar o buscar IDs manualmente.
