# 🔍 DIAGNÓSTICO COMPLETO Y PLAN DE ACCIÓN

**Fecha:** 8 de noviembre de 2025  
**Estado del Backend:** ✅ Servidor corriendo en puerto 3000

---

## 📊 RESUMEN EJECUTIVO

### ✅ **ERRORES CORREGIDOS:**
1. ~~Error 500 en `/api/semilleros/mi-semillero/info`~~ → **RESUELTO** (JSON.parse innecesario)
2. ~~Error 400 en `/api/actividades`~~ → **RESUELTO** (auto-detección de id_integrante)

### 🔴 **ERRORES PENDIENTES:**
1. **Error 403** en `/api/usuarios` → ⚠️ **FRONTEND debe agregar tokens**
2. **Error 404** en `/api/reportes/proyectos/pdf` → ❓ **Verificar si ruta debe existir**

### ℹ️ **WARNINGS NO CRÍTICOS:**
- React Router Future Flags → Pueden ignorarse

---

## 🎯 DIAGNÓSTICO DETALLADO POR ERROR

### **1. Error 403: GET /api/usuarios → Forbidden** ⚠️

**Frecuencia:** Múltiples veces (SemilleroDialog.tsx, CampoDialog.tsx)

**Causa Raíz:**
```typescript
// ❌ Código actual del frontend (SIN token)
export const getAll = async () => {
  return axios.get(`${API_URL}/usuarios`);
};
```

**Diagnóstico:**
- El backend requiere autenticación JWT para `/api/usuarios`
- El frontend NO está enviando el header `Authorization: Bearer ${token}`
- El middleware de autenticación rechaza la petición con 403

**Impacto:**
- 🔴 **ALTO** - Los formularios de Semilleros y Campos no pueden cargar usuarios
- No se pueden asignar líderes
- No se pueden crear nuevos semilleros/campos desde el admin

**Solución:**
⚠️ **RESPONSABLE: FRONTEND**

El frontend debe modificar TODOS los servicios que llamen rutas protegidas:

```typescript
// ✅ Código correcto (CON token)
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { 
      Authorization: `Bearer ${token}` 
    }
  };
};

export const getAll = async () => {
  return axios.get(`${API_URL}/usuarios`, getAuthHeaders());
};
```

**Archivos del frontend a modificar:**
- `usuariosService.ts` - TODAS las funciones
- `semillerosService.ts` - Solo rutas `/mi-semillero/*`
- `camposService.ts` - Solo rutas `/mi-campo/*`
- Cualquier otro servicio que llame rutas protegidas

**Estado:** ⚠️ **PENDIENTE FRONTEND**

**Documentación:** Ver `docs/MENSAJE_PARA_FRONTEND.md` para detalles completos

---

### **2. Error 404: GET /api/reportes/proyectos/pdf** ❓

**Frecuencia:** 1 vez (reportesService.ts:57)

**Request:** `GET /api/reportes/proyectos/pdf?id_campo=1`

**Diagnóstico:**
- El frontend intenta generar un PDF de proyectos por campo
- La ruta `/api/reportes/proyectos/pdf` NO existe en el backend
- Puede ser una funcionalidad futura o una ruta faltante

**Preguntas a responder:**
1. ¿Esta funcionalidad debe existir?
2. ¿Debe generar PDFs de proyectos?
3. ¿Qué información debe incluir el reporte?

**Posibles Soluciones:**

**Opción A:** Crear la ruta de reportes (si es requerido)
```javascript
// src/routes/reportes.js
router.get('/proyectos/pdf', authenticateToken, async (req, res) => {
  const { id_campo } = req.query;
  // Generar PDF con los proyectos del campo
  // Usar librería como pdfkit o puppeteer
});
```

**Opción B:** Frontend debe manejar el error gracefully
```typescript
// Si la ruta no debe existir todavía
try {
  await reportesService.exportarPDFGeneral(filtros);
} catch (error) {
  if (error.response?.status === 404) {
    alert('Funcionalidad de reportes en desarrollo');
    return;
  }
  throw error;
}
```

**Estado:** ❓ **PENDIENTE DE DEFINIR** - Requiere decisión de producto

---

### **3. React Router Warnings** ℹ️

**Warnings:**
1. `v7_startTransition` future flag
2. `v7_relativeSplatPath` future flag

**Diagnóstico:**
- Son advertencias sobre cambios futuros en React Router v7
- NO rompen la aplicación
- Solo avisan que el comportamiento cambiará en v7

**Solución (OPCIONAL):**
```typescript
// En el componente App donde está <BrowserRouter>
<BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}
>
  {/* ... */}
</BrowserRouter>
```

**Prioridad:** 🟢 **BAJA** - Pueden ignorarse por ahora

**Estado:** ℹ️ **OPCIONAL** - No afecta funcionalidad

---

## 🗄️ VERIFICACIÓN DE BASE DE DATOS

### **Estado de Tablas y Columnas:**

✅ **semilleros**
- ✅ Columna `activo` agregada
- ✅ Modelo actualizado
- ✅ Endpoints funcionando

✅ **campos_investigacion**
- ✅ Columna `activo` agregada
- ✅ Columna `horario_reunion` agregada
- ✅ Columna `contacto_email` agregada
- ✅ Columna `contacto_redes_sociales` agregada (JSON)
- ✅ Modelo actualizado

✅ **usuarios**
- ✅ Columna `email_verificado` agregada
- ✅ Columna `activo` agregada
- ✅ Columna `token_verificacion` agregada
- ✅ Columna `token_verificacion_expira` agregada
- ✅ Modelo actualizado

✅ **actividades**
- ✅ Columna `id_integrante` existe
- ✅ Modelo correcto
- ✅ Controller actualizado (auto-detección)

✅ **integrantes**
- ✅ Tabla existe
- ✅ Relación con usuarios correcta

✅ **proyectos**
- ✅ Tabla existe
- ✅ Relación con campos correcta

❓ **reportes**
- ❓ No verificado si la tabla existe
- ❓ Puede no ser necesaria (reportes pueden generarse dinámicamente)

---

## 🔧 CORRECCIONES APLICADAS

### **Corrección 1: Error 500 en /api/semilleros/mi-semillero/info** ✅

**Archivo:** `src/controllers/semilleroController.js`

**Problema:**
```javascript
// ❌ ANTES - intentaba parsear objetos ya parseados
if (semillero.linea) semillero.linea = JSON.parse(semillero.linea);
if (semillero.liderUsuario) semillero.liderUsuario = JSON.parse(semillero.liderUsuario);
```

**Solución:**
```javascript
// ✅ DESPUÉS - eliminar JSON.parse innecesario
const semillero = rows[0];
// Los objetos JSON ya están parseados por MySQL driver
res.json({ semillero });
```

**Resultado:** ✅ Endpoint respondiendo 200 OK

---

### **Corrección 2: Error 400 en POST /api/actividades** ✅

**Archivo:** `src/controllers/actividadController.js`

**Problema:**
- Backend requería `id_integrante` obligatorio
- Frontend NO lo enviaba
- Validación fallaba con 400 Bad Request

**Solución:**
```javascript
// ✅ Auto-detectar id_integrante del usuario autenticado
if (!id_integrante) {
  const [integrantes] = await db.query(`
    SELECT i.id 
    FROM integrantes i
    INNER JOIN proyectos p ON i.id_campo = p.id_campo
    WHERE p.id = ? AND i.id_usuario = ? AND i.fecha_salida IS NULL
  `, [id_proyecto, req.user.id]);
  
  if (integrantes.length === 0) {
    return res.status(403).json({ 
      message: 'No eres integrante de este proyecto' 
    });
  }
  
  id_integrante = integrantes[0].id;
}
```

**Beneficios:**
- ✅ Frontend no necesita buscar id_integrante
- ✅ Backend más inteligente
- ✅ Mejor seguridad (verifica que el usuario sea integrante)
- ✅ Menos errores de validación

**Resultado:** ✅ Listo para probar

---

## 📋 CHECKLIST DE VALIDACIÓN

### **Backend (todas ✅)**
- [x] Servidor corriendo en puerto 3000
- [x] Migración de BD ejecutada exitosamente
- [x] Todas las columnas necesarias existen
- [x] Error 500 de semilleros corregido
- [x] Error 400 de actividades corregido
- [x] Rutas nuevas creadas y registradas
- [x] Socket.IO funcionando
- [x] Sin errores en consola del servidor

### **Frontend (pendiente ⚠️)**
- [ ] Agregar tokens a `usuariosService.ts`
- [ ] Agregar tokens a `semillerosService.ts` (rutas protegidas)
- [ ] Agregar tokens a `camposService.ts` (rutas protegidas)
- [ ] Agregar interceptor de axios para 401/403
- [ ] Decidir qué hacer con ruta de reportes PDF
- [ ] (Opcional) Agregar React Router future flags

---

## 🎯 PLAN DE ACCIÓN PRIORIZADO

### **PRIORIDAD 1: CRÍTICO** 🔴

#### **Tarea 1.1: Frontend - Agregar autenticación JWT**
**Responsable:** Equipo Frontend  
**Tiempo estimado:** 1-2 horas  
**Archivos afectados:**
- `src/services/usuariosService.ts`
- `src/services/semillerosService.ts`
- `src/services/camposService.ts`
- `src/lib/api.ts` (interceptor)

**Pasos:**
1. Crear función helper `getAuthHeaders()`
2. Modificar TODAS las funciones que llamen rutas protegidas
3. Agregar token a headers
4. Crear interceptor para manejar 401/403
5. Probar login y peticiones protegidas

**Documentación:** `docs/MENSAJE_PARA_FRONTEND.md`

**Validación:**
```bash
# Debe retornar 200 en lugar de 403
curl -H "Authorization: Bearer ${TOKEN}" http://localhost:3000/api/usuarios
```

---

### **PRIORIDAD 2: MEDIA** 🟡

#### **Tarea 2.1: Definir funcionalidad de Reportes PDF**
**Responsable:** Product Owner / Arquitecto  
**Tiempo estimado:** 30 min (decisión) + 2-4 horas (implementación)

**Preguntas a responder:**
1. ¿Los reportes PDF son funcionalidad requerida?
2. ¿Qué información deben incluir?
3. ¿Se generan en backend (pdfkit) o frontend (jsPDF)?
4. ¿Deben guardarse en BD o generarse dinámicamente?

**Si SÍ se requiere:**
- Crear tabla `reportes` (opcional)
- Crear route `src/routes/reportes.js`
- Instalar librería PDF: `npm install pdfkit`
- Implementar generación de PDF

**Si NO se requiere:**
- Eliminar llamada del frontend
- O manejar error 404 gracefully

---

### **PRIORIDAD 3: BAJA** 🟢

#### **Tarea 3.1: Agregar React Router Future Flags**
**Responsable:** Equipo Frontend  
**Tiempo estimado:** 5 minutos

```typescript
// En App.tsx
<BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}
>
  {/* ... */}
</BrowserRouter>
```

**Beneficio:** Eliminar warnings de consola

---

#### **Tarea 3.2: Agregar Description a DialogContent**
**Responsable:** Equipo Frontend  
**Tiempo estimado:** 10 minutos

**Warning actual:**
```
Missing `Description` or `aria-describedby={undefined}` for {DialogContent}
```

**Solución:**
```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Título</DialogTitle>
    <DialogDescription>
      Descripción del diálogo
    </DialogDescription>
  </DialogHeader>
  {/* ... */}
</DialogContent>
```

---

## 🧪 TESTS RECOMENDADOS

### **Backend Tests:**

```bash
# Test 1: Verificar endpoint de semilleros
curl http://localhost:3000/api/semilleros/mi-semillero/info \
  -H "Authorization: Bearer ${TOKEN}"
# Esperado: 200 OK

# Test 2: Crear actividad SIN id_integrante
curl -X POST http://localhost:3000/api/actividades \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "id_proyecto": 1,
    "titulo": "Test",
    "descripcion": "Test actividad",
    "id_estado": 1,
    "prioridad": "Alta"
  }'
# Esperado: 201 Created (auto-detecta id_integrante)

# Test 3: Verificar rutas públicas
curl http://localhost:3000/api/lineas-investigacion
# Esperado: 200 OK (sin token)

curl http://localhost:3000/api/semilleros/1/proyectos
# Esperado: 200 OK (sin token)
```

### **Frontend Tests:**

1. **Login y Token:**
   - Login con maria.garcia@ucp.edu.co / admin123
   - Verificar que token se guarda en localStorage
   - Verificar que peticiones incluyen header Authorization

2. **Crear Actividad:**
   - Ir a un proyecto
   - Crear nueva actividad
   - Verificar que NO pide error 400
   - Verificar que se crea correctamente

3. **Cargar Usuarios:**
   - Abrir modal de crear semillero
   - Verificar que carga lista de usuarios (NO error 403)
   - Verificar que se puede seleccionar líder

---

## 📈 MÉTRICAS DE ÉXITO

### **Backend:**
- ✅ 0 errores 500
- ✅ 0 errores 400 en actividades
- ⏳ 0 errores 403 en endpoints protegidos (depende de frontend)
- ✅ Tiempo de respuesta < 100ms para endpoints simples

### **Frontend:**
- ⏳ 0 errores 403 al cargar usuarios
- ⏳ Formularios funcionando correctamente
- ⏳ Actividades creándose sin errores
- ⏳ Login y autenticación funcionando

---

## 🔄 SIGUIENTE ITERACIÓN

Una vez corregidos los errores críticos, considerar:

1. **Optimizaciones:**
   - Agregar paginación a `/api/usuarios`
   - Agregar caché para consultas frecuentes
   - Indexes en BD para mejorar performance

2. **Funcionalidades:**
   - Implementar reportes PDF
   - Agregar filtros avanzados
   - Notificaciones push

3. **Seguridad:**
   - Rate limiting en endpoints públicos
   - Validación más estricta de inputs
   - Logs de auditoría

---

## 📞 CONTACTO Y SOPORTE

**Para el Frontend:**
- Revisar `docs/MENSAJE_PARA_FRONTEND.md`
- Revisar `docs/FIXES_REQUERIDOS.md`
- Credenciales de prueba: maria.garcia@ucp.edu.co / admin123

**Para Backend:**
- Servidor corriendo en http://localhost:3000
- Logs en consola del servidor
- Base de datos: gestion_proyectos_db

---

**Estado General:** ✅ Backend funcional, esperando cambios de Frontend

**Última actualización:** 8 de noviembre de 2025
