# Implementación de Loading Spinners con BounceLoader

## 📦 Instalación
```bash
npm install react-spinners
```

## 🎨 Componente LoadingOverlay Creado

**Ubicación:** `src/components/ui/LoadingOverlay.tsx`

```typescript
import { BounceLoader } from 'react-spinners';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = 'Cargando...' 
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
        <BounceLoader color="#3b82f6" size={60} />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};
```

## ✅ Archivos Implementados

### 1. **SemilleroDetail.tsx**
- **Estado:** `submitting`
- **Operación:** Actualización de semillero
- **Mensaje:** "Guardando cambios..."

```tsx
<LoadingOverlay isLoading={submitting} message="Guardando cambios..." />
```

### 2. **CampoDetail.tsx**
- **Estados:** `crearProyectoSubmitting`, `crearIntegranteSubmitting`, `editarCampoSubmitting`
- **Operaciones:** 
  - Crear proyecto
  - Agregar integrante
  - Actualizar campo
- **Mensajes:**
  - "Creando proyecto..."
  - "Agregando integrante..."
  - "Actualizando campo..."

```tsx
<LoadingOverlay isLoading={crearProyectoSubmitting} message="Creando proyecto..." />
<LoadingOverlay isLoading={crearIntegranteSubmitting} message="Agregando integrante..." />
<LoadingOverlay isLoading={editarCampoSubmitting} message="Actualizando campo..." />
```

### 3. **CampoDetailLider.tsx**
- **Estado:** `crearProyectoSubmitting`
- **Operación:** Crear proyecto
- **Mensaje:** "Creando proyecto..."

```tsx
<LoadingOverlay isLoading={crearProyectoSubmitting} message="Creando proyecto..." />
```

### 4. **MiSemillero.tsx**
- **Estados:** `submitting`, `crearCampoSubmitting`
- **Operaciones:**
  - Actualizar semillero
  - Crear campo
- **Mensajes:**
  - "Guardando cambios..."
  - "Creando campo..."

```tsx
<LoadingOverlay isLoading={submitting} message="Guardando cambios..." />
<LoadingOverlay isLoading={crearCampoSubmitting} message="Creando campo..." />
```

### 5. **ProyectoActividades.tsx**
- **Estados:** `isCreating`, `isEditing`
- **Operaciones:**
  - Crear actividad
  - Actualizar actividad
- **Mensajes:**
  - "Creando actividad..."
  - "Actualizando actividad..."

```tsx
<LoadingOverlay isLoading={isCreating} message="Creando actividad..." />
<LoadingOverlay isLoading={isEditing} message="Actualizando actividad..." />
```

## 🎯 Características

1. **Overlay de pantalla completa:** Cubre toda la pantalla con fondo semitransparente
2. **Backdrop blur:** Efecto de desenfoque en el fondo
3. **Centrado perfecto:** Spinner y mensaje centrados vertical y horizontalmente
4. **Z-index alto (50):** Se muestra sobre todos los demás elementos
5. **Customizable:** Mensaje personalizable por operación
6. **Responsive:** Funciona en todos los tamaños de pantalla
7. **Accesible:** No permite interacción con la UI mientras está activo

## 🔧 Uso

```tsx
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

// En el componente
const [submitting, setSubmitting] = useState(false);

// En el JSX (antes del cierre del div principal)
<LoadingOverlay isLoading={submitting} message="Guardando..." />
```

## 📊 Cobertura

- ✅ Gestión de Semilleros (creación/edición)
- ✅ Gestión de Campos (creación/edición)
- ✅ Gestión de Proyectos (creación)
- ✅ Gestión de Integrantes (agregar)
- ✅ Gestión de Actividades (creación/edición)

## 🎨 Personalización

Para cambiar el color del spinner:
```tsx
<BounceLoader color="#008042" size={60} /> // Verde
<BounceLoader color="#ffd429" size={60} /> // Amarillo
```

Para cambiar el tamaño:
```tsx
<BounceLoader color="#3b82f6" size={80} /> // Más grande
<BounceLoader color="#3b82f6" size={40} /> // Más pequeño
```

## 📝 Notas

- El componente LoadingOverlay puede ser usado en cualquier página o componente
- Se puede tener múltiples LoadingOverlay en el mismo componente (uno por cada operación)
- Solo se muestra uno a la vez gracias a la lógica `if (!isLoading) return null`
- El overlay previene interacción del usuario con la UI durante operaciones asíncronas
