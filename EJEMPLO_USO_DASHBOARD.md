# 📊 Guía de Uso del Dashboard Service

## ✅ Servicio Implementado

El servicio `dashboardService.ts` ya está configurado para hacer peticiones al endpoint de proyectos.

### 🎯 Endpoint Principal Implementado:
```typescript
GET http://localhost:3000/api/projects
```

---

## 📦 Métodos Disponibles

### 1. **getProyectos()** - Obtener todos los proyectos
```typescript
import { dashboardService } from '@/services/dashboardService';

const proyectos = await dashboardService.getProyectos();
// Retorna: Proyecto[]
```

### 2. **getEstadisticas()** - Estadísticas generales
```typescript
const stats = await dashboardService.getEstadisticas();
// Retorna: DashboardStats
```

### 3. **getProyectosRecientes()** - Últimos proyectos
```typescript
const recientes = await dashboardService.getProyectosRecientes(5);
// Retorna: Proyecto[] (los últimos 5)
```

### 4. **getActividadesRecientes()** - Últimas actividades
```typescript
const actividades = await dashboardService.getActividadesRecientes(10);
// Retorna: any[] (las últimas 10)
```

### 5. **getResumenActividades()** - Resumen por estado
```typescript
const resumen = await dashboardService.getResumenActividades();
// Retorna: { pendientes: number, enProgreso: number, completadas: number }
```

### 6. **getProyectosConProgreso()** - Proyectos con % progreso
```typescript
const proyectosProgreso = await dashboardService.getProyectosConProgreso();
// Retorna: Proyecto[] (con campo progreso)
```

---

## 🧩 Ejemplo Completo de Uso en Dashboard.tsx

```tsx
import { useEffect, useState } from 'react';
import { dashboardService, Proyecto, DashboardStats } from '@/services/dashboardService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Obtener todos los proyectos (GET /api/projects)
      const proyectosData = await dashboardService.getProyectos();
      setProyectos(proyectosData);
      
      // Obtener estadísticas (opcional)
      const statsData = await dashboardService.getEstadisticas();
      setStats(statsData);
      
      console.log('📊 Proyectos cargados:', proyectosData);
      
    } catch (error: any) {
      console.error('❌ Error al cargar datos del dashboard:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Total Proyectos</h3>
          <p className="text-2xl font-bold">{proyectos.length}</p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Actividades Pendientes</h3>
          <p className="text-2xl font-bold">{stats.actividadesPendientes || 0}</p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm text-gray-500">En Progreso</h3>
          <p className="text-2xl font-bold">{stats.actividadesEnProgreso || 0}</p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm text-gray-500">Completadas</h3>
          <p className="text-2xl font-bold">{stats.actividadesCompletadas || 0}</p>
        </div>
      </div>

      {/* Lista de Proyectos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Proyectos</h2>
        <div className="space-y-2">
          {proyectos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay proyectos disponibles
            </p>
          ) : (
            proyectos.map((proyecto) => (
              <div
                key={proyecto.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <h3 className="font-semibold">{proyecto.nombre}</h3>
                <p className="text-sm text-gray-600">{proyecto.descripcion}</p>
                {proyecto.progreso !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${proyecto.progreso}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {proyecto.progreso}% completado
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 Cómo Probar

### 1. **Verificar que el backend esté corriendo**
```bash
# Prueba el endpoint directamente
curl http://localhost:3000/api/projects
```

### 2. **Usar el servicio en tu componente**
```tsx
import { dashboardService } from '@/services/dashboardService';

// En tu componente
useEffect(() => {
  const fetchData = async () => {
    const proyectos = await dashboardService.getProyectos();
    console.log('Proyectos:', proyectos);
  };
  fetchData();
}, []);
```

### 3. **Verificar en la consola del navegador**
Deberías ver:
```
📊 Obteniendo proyectos del dashboard...
🔑 Token agregado a GET /api/projects
✅ Proyectos obtenidos: 5
```

---

## 🔍 Debugging

### Si no funciona, verifica:

1. **¿El backend está corriendo?**
   ```bash
   curl http://localhost:3000/api/projects
   ```

2. **¿Tienes un token válido?**
   ```javascript
   // En la consola del navegador
   console.log(localStorage.getItem('token'))
   ```

3. **¿La URL del API es correcta?**
   Verifica tu archivo `.env`:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Revisa la consola del navegador (F12)**
   - Busca mensajes con 📊 ✅ ❌
   - Revisa el Network tab → filtro "projects"

5. **Verifica que tengas permisos**
   - El endpoint `/api/projects` debe estar accesible para tu rol

---

## 📋 Interfaces TypeScript

### Proyecto
```typescript
interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  estado?: string;
  id_campo?: number;
  fecha_creacion?: string;
  fecha_fin?: string;
  progreso?: number;
}
```

### DashboardStats
```typescript
interface DashboardStats {
  totalProyectos?: number;
  totalActividades?: number;
  totalIntegrantes?: number;
  actividadesPendientes?: number;
  actividadesEnProgreso?: number;
  actividadesCompletadas?: number;
  proyectosActivos?: number;
}
```

---

## 🚀 Próximos Pasos

1. **Implementa el servicio en tu Dashboard.tsx**
2. **Agrega gráficos con Chart.js o Recharts**
3. **Crea widgets para diferentes métricas**
4. **Agrega filtros por fecha, campo, estado, etc.**

---

## ✅ Resumen

- ✅ Servicio `dashboardService.ts` creado
- ✅ Método `getProyectos()` implementado
- ✅ Endpoint `GET /api/projects` configurado
- ✅ Normalización de respuestas automática
- ✅ Logs para debugging
- ✅ Manejo de errores
- ✅ TypeScript con interfaces completas

**¡Listo para usar!** 🎉
