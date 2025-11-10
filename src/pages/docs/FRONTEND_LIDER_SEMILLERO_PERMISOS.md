# 🔐 Corrección de Permisos para Líder de Semillero

**Fecha:** 8 de noviembre de 2025  
**Prioridad:** 🔴 **CRÍTICA**

---

## 🚨 PROBLEMA ACTUAL

El frontend está mostrando a María García (Líder de Semillero) información que **NO debería ver**:

❌ **Problemas identificados:**
1. Muestra **TODOS los semilleros** en lugar de solo el suyo
2. Muestra botón "**+ Nuevo Semillero**" (no debería poder crear semilleros)
3. Permite ver detalles de **otros semilleros**
4. Muestra opción "**Gestionar Semilleros**" (solo debe gestionar EL SUYO)
5. Puede ver campos de **otros semilleros**

---

## ✅ SOLUCIÓN: Cambios Requeridos en Frontend

### **📋 Resumen de Cambios:**

| Componente/Página | Cambio Requerido | Prioridad |
|-------------------|------------------|-----------|
| Dashboard Admin | Ocultar sección completa si es líder (rol=1) | 🔴 Alta |
| Lista de Semilleros | Mostrar solo SU semillero | 🔴 Alta |
| Botón "Nuevo Semillero" | Ocultar si rol=1 | 🔴 Alta |
| "Gestionar Semilleros" | Cambiar a "Mi Semillero" | 🔴 Alta |
| Gestión de Campos | Filtrar solo campos de SU semillero | 🔴 Alta |

---

## 🔧 CAMBIOS ESPECÍFICOS POR COMPONENTE

### **1. Dashboard Principal - Mostrar Solo SU Semillero**

**Archivo:** `Dashboard.tsx` o `AdminDashboard.tsx` (según estructura)

**Problema:** Muestra lista de todos los semilleros

**Solución:**

```typescript
// ❌ ANTES - Muestra todos los semilleros
const [semilleros, setSemilleros] = useState([]);

useEffect(() => {
  const loadSemilleros = async () => {
    const response = await semillerosService.getAll();
    setSemilleros(response.data.semilleros);
  };
  loadSemilleros();
}, []);

// ✅ DESPUÉS - Mostrar solo MI semillero si es líder
const [miSemillero, setMiSemillero] = useState(null);
const { user } = useAuth(); // Obtener usuario autenticado

useEffect(() => {
  const loadData = async () => {
    if (user.rol === 1) {
      // Es líder de semillero - solo cargar SU semillero
      const response = await semillerosService.getMiSemillero();
      setMiSemillero(response.data.semillero);
    } else {
      // Es admin global - cargar todos
      const response = await semillerosService.getAll();
      setSemilleros(response.data.semilleros);
    }
  };
  loadData();
}, [user]);
```

---

### **2. Botón "Nuevo Semillero" - Ocultar para Líderes**

**Problema:** El botón "+ Nuevo Semillero" está visible para todos

**Solución:**

```tsx
// ❌ ANTES - Siempre visible
<Button onClick={() => setShowDialog(true)}>
  + Nuevo Semillero
</Button>

// ✅ DESPUÉS - Solo visible para super admin
{user.rol !== 1 && (
  <Button onClick={() => setShowDialog(true)}>
    + Nuevo Semillero
  </Button>
)}

// O mejor aún, el botón no debería existir porque esas rutas están deshabilitadas
// Eliminar completamente:
// <Button onClick={() => setShowDialog(true)}>
//   + Nuevo Semillero
// </Button>
```

---

### **3. Tabla de Semilleros - Mostrar Solo el Propio**

**Problema:** La tabla muestra todos los semilleros

**Solución:**

```tsx
// ❌ ANTES
<Table>
  <TableBody>
    {semilleros.map((semillero) => (
      <TableRow key={semillero.id}>
        <TableCell>{semillero.nombre}</TableCell>
        <TableCell>{semillero.lider}</TableCell>
        <TableCell>
          <Button onClick={() => navigate(`/semilleros/${semillero.id}`)}>
            Ver Detalles
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// ✅ DESPUÉS - Mostrar solo su semillero si es líder
{user.rol === 1 ? (
  // Vista para líder de semillero - Solo SU semillero
  <Card>
    <CardHeader>
      <CardTitle>Mi Semillero</CardTitle>
    </CardHeader>
    <CardContent>
      {miSemillero ? (
        <>
          <h3>{miSemillero.nombre}</h3>
          <p>{miSemillero.descripcion}</p>
          <Badge variant={miSemillero.activo ? 'success' : 'destructive'}>
            {miSemillero.activo ? 'Activo' : 'Cerrado'}
          </Badge>
          <p>Campos: {miSemillero.campos?.length || 0}</p>
          
          <Button onClick={() => navigate('/mi-semillero')}>
            Gestionar Mi Semillero
          </Button>
        </>
      ) : (
        <p>No tienes un semillero asignado</p>
      )}
    </CardContent>
  </Card>
) : (
  // Vista para super admin - Todos los semilleros
  <Table>
    <TableBody>
      {semilleros.map((semillero) => (
        <TableRow key={semillero.id}>
          {/* ... */}
        </TableRow>
      ))}
    </TableBody>
  </Table>
)}
```

---

### **4. Navegación/Menú - Cambiar Opciones Según Rol**

**Problema:** El menú muestra "Gestionar Semilleros" para todos

**Solución:**

```tsx
// ❌ ANTES
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <Link to="/semilleros">
      <Database className="mr-2 h-4 w-4" />
      Gestionar Semilleros
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>

// ✅ DESPUÉS - Cambiar texto y ruta según rol
{user.rol === 1 ? (
  <SidebarMenuItem>
    <SidebarMenuButton asChild>
      <Link to="/mi-semillero">
        <Database className="mr-2 h-4 w-4" />
        Mi Semillero
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
) : (
  <SidebarMenuItem>
    <SidebarMenuButton asChild>
      <Link to="/semilleros">
        <Database className="mr-2 h-4 w-4" />
        Gestionar Semilleros
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
)}
```

---

### **5. Página de Gestión de Campos - Filtrar por Semillero**

**Problema:** Muestra TODOS los campos cuando líder solo debe ver los suyos

**Archivo:** `CamposPage.tsx` o similar

**Solución:**

```typescript
// ❌ ANTES - Carga todos los campos
useEffect(() => {
  const loadCampos = async () => {
    const response = await camposService.getAll();
    setCampos(response.data.campos);
  };
  loadCampos();
}, []);

// ✅ DESPUÉS - Filtrar por semillero del líder
useEffect(() => {
  const loadCampos = async () => {
    if (user.rol === 1) {
      // Líder de semillero - solo sus campos
      const response = await semillerosService.getMisCampos();
      setCampos(response.data.campos);
    } else {
      // Super admin - todos los campos
      const response = await camposService.getAll();
      setCampos(response.data.campos);
    }
  };
  loadCampos();
}, [user]);
```

---

### **6. Servicios - Agregar Endpoint para MI Semillero**

**Archivo:** `src/services/semillerosService.ts`

**Agregar:**

```typescript
// Endpoint específico para obtener MI semillero (líder autenticado)
export const getMiSemillero = async () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/semilleros/mi-semillero/info`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Endpoint para obtener MIS campos
export const getMisCampos = async () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/semilleros/mi-semillero/campos`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Endpoint para actualizar MI semillero
export const updateMiSemillero = async (data: any) => {
  const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/semilleros/mi-semillero/actualizar`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Endpoint para abrir/cerrar MI semillero
export const toggleMiSemilleroEstado = async (activo: 0 | 1) => {
  const token = localStorage.getItem('token');
  return axios.patch(`${API_URL}/semilleros/mi-semillero/estado`, 
    { activo }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
```

---

### **7. Crear Nuevo Campo - Auto-asignar Semillero**

**Problema:** El formulario pide seleccionar semillero

**Solución:**

```tsx
// ❌ ANTES - Muestra selector de semillero
<FormField name="id_semillero" label="Semillero">
  <Select value={formData.id_semillero} onChange={handleChange}>
    {semilleros.map(s => (
      <option key={s.id} value={s.id}>{s.nombre}</option>
    ))}
  </Select>
</FormField>

// ✅ DESPUÉS - NO mostrar selector si es líder (se asigna automáticamente)
{user.rol !== 1 && (
  <FormField name="id_semillero" label="Semillero">
    <Select value={formData.id_semillero} onChange={handleChange}>
      {semilleros.map(s => (
        <option key={s.id} value={s.id}>{s.nombre}</option>
      ))}
    </Select>
  </FormField>
)}

// El backend asigna automáticamente el semillero del líder
// Ver src/controllers/campoController.js línea 52
```

---

### **8. Protección de Rutas - Redirigir si Intenta Acceder a Otros Semilleros**

**Archivo:** `ProtectedRoute.tsx` o similar

**Agregar validación:**

```tsx
// Si el usuario es líder de semillero y está intentando ver OTRO semillero
const SemilleroDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si es líder de semillero
    if (user.rol === 1) {
      // Obtener SU semillero
      const fetchMiSemillero = async () => {
        const response = await semillerosService.getMiSemillero();
        const miSemilleroId = response.data.semillero.id;
        
        // Si está intentando ver OTRO semillero, redirigir al suyo
        if (parseInt(id) !== miSemilleroId) {
          toast.error('Solo puedes gestionar tu propio semillero');
          navigate(`/semilleros/${miSemilleroId}`);
        }
      };
      fetchMiSemillero();
    }
  }, [id, user, navigate]);
  
  // ... resto del componente
};
```

---

## 📊 TABLA DE ENDPOINTS SEGÚN ROL

### **Endpoints para Líder de Semillero (rol = 1):**

| Método | Endpoint | Descripción | Token |
|--------|----------|-------------|-------|
| GET | `/api/semilleros/mi-semillero/info` | Obtener SU semillero | ✅ Requerido |
| PUT | `/api/semilleros/mi-semillero/actualizar` | Actualizar SU semillero | ✅ Requerido |
| DELETE | `/api/semilleros/mi-semillero/imagen` | Eliminar imagen de SU semillero | ✅ Requerido |
| GET | `/api/semilleros/mi-semillero/campos` | Obtener SUS campos | ✅ Requerido |
| PATCH | `/api/semilleros/mi-semillero/estado` | Abrir/cerrar SU semillero | ✅ Requerido |
| POST | `/api/campos` | Crear campo (auto-asigna su semillero) | ✅ Requerido |
| PUT | `/api/campos/:id` | Actualizar campo (valida ownership) | ✅ Requerido |
| PATCH | `/api/campos/:id/estado` | Cambiar estado campo (valida ownership) | ✅ Requerido |
| DELETE | `/api/campos/:id` | Eliminar campo (valida ownership) | ✅ Requerido |

### **Endpoints PÚBLICOS (sin token):**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/semilleros` | Listar todos (vista pública) |
| GET | `/api/semilleros/:id` | Ver detalle semillero (público) |
| GET | `/api/semilleros/:id/proyectos` | Proyectos del semillero |
| GET | `/api/semilleros/:id/integrantes` | Integrantes del semillero |

### **Endpoints DESHABILITADOS para Líderes:**

| Método | Endpoint | Motivo |
|--------|----------|--------|
| ~~POST~~ | ~~/api/semilleros~~ | No puede crear semilleros |
| ~~PUT~~ | ~~/api/semilleros/:id~~ | No puede modificar otros semilleros |
| ~~DELETE~~ | ~~/api/semilleros/:id~~ | No puede eliminar semilleros |

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN

### **Paso 1: Servicios**
- [ ] Agregar `getMiSemillero()` en `semillerosService.ts`
- [ ] Agregar `getMisCampos()` en `semillerosService.ts`
- [ ] Agregar `updateMiSemillero()` en `semillerosService.ts`
- [ ] Agregar `toggleMiSemilleroEstado()` en `semillerosService.ts`
- [ ] Agregar token JWT a TODOS los endpoints protegidos

### **Paso 2: Componentes de UI**
- [ ] Ocultar botón "Nuevo Semillero" si rol=1
- [ ] Cambiar "Gestionar Semilleros" → "Mi Semillero" si rol=1
- [ ] Mostrar solo SU semillero en dashboard si rol=1
- [ ] Filtrar campos por semillero propio si rol=1
- [ ] Ocultar selector de semillero al crear campo si rol=1

### **Paso 3: Validaciones de Rutas**
- [ ] Redirigir si líder intenta ver otro semillero
- [ ] Redirigir si líder intenta crear semillero
- [ ] Redirigir si líder intenta modificar otro semillero

### **Paso 4: Menú/Navegación**
- [ ] Ajustar opciones del sidebar según rol
- [ ] Ocultar opciones de admin global si rol=1

### **Paso 5: Testing**
- [ ] Login como María García (rol=1)
- [ ] Verificar que solo ve SU semillero
- [ ] Verificar que NO puede crear semilleros
- [ ] Verificar que solo ve SUS campos
- [ ] Intentar acceder a `/semilleros` (debería redirigir a `/mi-semillero`)

---

## 🧪 EJEMPLO COMPLETO - Página "Mi Semillero"

**Archivo:** `pages/MiSemillero.tsx` (NUEVO)

```tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { semillerosService } from '@/services/semillerosService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function MiSemilleroPage() {
  const { user } = useAuth();
  const [semillero, setSemillero] = useState(null);
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMiSemillero();
  }, []);

  const loadMiSemillero = async () => {
    try {
      setLoading(true);
      
      // Obtener MI semillero
      const semilleroRes = await semillerosService.getMiSemillero();
      setSemillero(semilleroRes.data.semillero);
      
      // Obtener MIS campos
      const camposRes = await semillerosService.getMisCampos();
      setCampos(camposRes.data.campos);
      
    } catch (error) {
      console.error('Error al cargar mi semillero:', error);
      toast.error('Error al cargar información del semillero');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async () => {
    try {
      const nuevoEstado = semillero.activo ? 0 : 1;
      await semillerosService.toggleMiSemilleroEstado(nuevoEstado);
      
      toast.success(
        nuevoEstado ? 'Semillero abierto exitosamente' : 'Semillero cerrado exitosamente'
      );
      
      loadMiSemillero(); // Recargar
    } catch (error) {
      toast.error('Error al cambiar estado del semillero');
    }
  };

  if (loading) return <div>Cargando...</div>;
  
  if (!semillero) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>No tienes un semillero asignado. Contacta al administrador.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Información del Semillero */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{semillero.nombre}</span>
            <Badge variant={semillero.activo ? 'success' : 'destructive'}>
              {semillero.activo ? 'Abierto' : 'Cerrado'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">Descripción</h4>
            <p>{semillero.descripcion}</p>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={() => navigate('/mi-semillero/editar')}>
              Editar Información
            </Button>
            <Button 
              variant={semillero.activo ? 'destructive' : 'default'}
              onClick={handleToggleEstado}
            >
              {semillero.activo ? 'Cerrar Semillero' : 'Abrir Semillero'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campos del Semillero */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mis Campos de Investigación</span>
            <Button onClick={() => navigate('/campos/nuevo')}>
              + Nuevo Campo
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campos.length === 0 ? (
            <p>No tienes campos creados aún.</p>
          ) : (
            <div className="space-y-4">
              {campos.map((campo) => (
                <Card key={campo.id}>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold">{campo.nombre}</h4>
                    <p className="text-sm text-gray-600">{campo.descripcion}</p>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/campos/${campo.id}`)}
                      >
                        Ver Detalles
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/campos/${campo.id}/editar`)}
                      >
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ⚠️ ERRORES COMUNES A EVITAR

### **1. No agregar el token JWT**
```typescript
// ❌ MAL - Sin token
const response = await axios.get('/api/semilleros/mi-semillero/info');

// ✅ BIEN - Con token
const token = localStorage.getItem('token');
const response = await axios.get('/api/semilleros/mi-semillero/info', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### **2. Seguir usando endpoint incorrecto**
```typescript
// ❌ MAL - Sigue usando el endpoint de todos
const response = await semillerosService.getAll();

// ✅ BIEN - Usa endpoint específico según rol
const response = user.rol === 1 
  ? await semillerosService.getMiSemillero()
  : await semillerosService.getAll();
```

### **3. No validar rol en el componente**
```tsx
// ❌ MAL - Muestra todo sin validar
<Button onClick={createSemillero}>Nuevo Semillero</Button>

// ✅ BIEN - Valida rol primero
{user.rol !== 1 && (
  <Button onClick={createSemillero}>Nuevo Semillero</Button>
)}
```

---

## 🎯 RESULTADO ESPERADO

Después de implementar estos cambios, María García (rol=1) debería:

✅ Ver solo **SU semillero** "Semillero TechLab"  
✅ Ver solo **SUS campos** de ese semillero  
✅ NO ver botón "Nuevo Semillero"  
✅ NO poder acceder a `/semilleros` (lista de todos)  
✅ Ser redirigida a `/mi-semillero` automáticamente  
✅ Ver menú "Mi Semillero" en lugar de "Gestionar Semilleros"  
✅ Poder crear campos SOLO para su semillero  
✅ Poder abrir/cerrar SU semillero  

---

## 📞 SOPORTE

**Backend ya está listo con:**
- ✅ Rutas `/mi-semillero/*` funcionando
- ✅ Validación de ownership en campos
- ✅ Middleware `isOwnSemillero` activo
- ✅ Rutas globales de semilleros deshabilitadas

**Credenciales de prueba:**
- Email: `maria.garcia@ucp.edu.co`
- Password: `admin123`
- Rol: 1 (Líder de Semillero)
- Semillero: "Semillero TechLab"

---

**Estado:** ⚠️ **PENDIENTE FRONTEND** - Backend completado y listo

**Prioridad:** 🔴 **CRÍTICA** - Afecta seguridad y UX
