# 🔧 Lista de Correcciones Necesarias para Eliminar Errores del Frontend

## ❌ Errores Actuales

### 1. Error 500: `/api/semilleros/mi-semillero/info`
**Causa:** Falta columna `activo` en la tabla `semilleros`

**Solución:**
```bash
# Ejecutar este comando en MySQL:
mysql -u root -p gestion_proyectos_db < migrations/complete_schema_fix.sql
```

---

### 2. Error 404: `/api/usuarios`
**Causa:** La ruta existe pero requiere autenticación. Frontend no está enviando el token.

**Solución Frontend:**
```typescript
// En usuariosService.ts, línea 5
export const getAll = async () => {
  const token = localStorage.getItem('token'); // ← AGREGAR ESTO
  return axios.get(`${API_URL}/usuarios`, {
    headers: { Authorization: `Bearer ${token}` } // ← AGREGAR ESTO
  });
};
```

---

### 3. Error 404: `/api/lineas-investigacion`
**Causa:** Ruta no existe. Necesitamos crearla.

**Solución Backend (HACER):**
Crear archivo `src/routes/lineas.js` con:
```javascript
const express = require('express');
const router = express.Router();
const { models } = require('../models');

// GET /api/lineas-investigacion - Listar todas las líneas
router.get('/', async (req, res) => {
  try {
    const lineas = await models.LineaInvestigacion.findAll();
    res.json(lineas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
```

Luego agregar en `src/routes/index.js`:
```javascript
const lineasRoutes = require('./lineas');
router.use('/lineas-investigacion', lineasRoutes);
```

---

### 4. Error 404: `/api/semilleros/:id/proyectos`
**Causa:** Ruta no existe.

**Solución Backend (HACER):**
Agregar en `src/routes/semilleros.js`:
```javascript
// GET /api/semilleros/:id/proyectos
router.get('/:id/proyectos', async (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../config/db');
    
    const [proyectos] = await db.query(`
      SELECT p.*, c.nombre as campo_nombre
      FROM proyectos p
      INNER JOIN campos_investigacion c ON p.id_campo = c.id
      WHERE c.id_semillero = ?
    `, [id]);
    
    res.json(proyectos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});
```

---

### 5. Error 404: `/api/semilleros/:id/integrantes`
**Causa:** Ruta no existe.

**Solución Backend (HACER):**
Agregar en `src/routes/semilleros.js`:
```javascript
// GET /api/semilleros/:id/integrantes
router.get('/:id/integrantes', async (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../config/db');
    
    const [integrantes] = await db.query(`
      SELECT i.*, u.nombre as usuario_nombre, u.correo, c.nombre as campo_nombre
      FROM integrantes i
      INNER JOIN usuarios u ON i.id_usuario = u.id
      INNER JOIN campos_investigacion c ON i.id_campo = c.id
      WHERE c.id_semillero = ?
      AND i.fecha_salida IS NULL
    `, [id]);
    
    res.json(integrantes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});
```

---

### 6. Error 404: `/api/proyectos/:id/actividades`
**Causa:** Ruta ya existe pero con nombre diferente.

**Actual:** `GET /api/actividades/proyecto/:id_proyecto`  
**Frontend espera:** `GET /api/proyectos/:id/actividades`

**Solución Backend (HACER):**
Agregar en `src/routes/projects.js`:
```javascript
// GET /api/proyectos/:id/actividades
router.get('/:id/actividades', async (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../config/db');
    
    const [actividades] = await db.query(`
      SELECT a.*, u.nombre as responsable
      FROM actividades a
      LEFT JOIN integrantes i ON a.id_integrante = i.id
      LEFT JOIN usuarios u ON i.id_usuario = u.id
      WHERE a.id_proyecto = ?
      ORDER BY a.fecha_creacion DESC
    `, [id]);
    
    res.json(actividades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});
```

---

## 📋 Checklist de Tareas

### Backend (YO - Backend Developer)
- [ ] 1. Ejecutar migración SQL: `mysql -u root -p < migrations/complete_schema_fix.sql`
- [ ] 2. Crear ruta `/api/lineas-investigacion`
- [ ] 3. Agregar ruta `/api/semilleros/:id/proyectos`
- [ ] 4. Agregar ruta `/api/semilleros/:id/integrantes`
- [ ] 5. Agregar ruta `/api/proyectos/:id/actividades`
- [ ] 6. Reiniciar servidor: `npm start`

### Frontend (ELLOS - Frontend Team)
- [ ] 1. Agregar token a todas las peticiones protegidas
- [ ] 2. Verificar que `localStorage.getItem('token')` funcione
- [ ] 3. Agregar header `Authorization: Bearer ${token}` a todas las peticiones
- [ ] 4. Manejar errores 401 (token expirado) y redirigir a login
- [ ] 5. Manejar errores 403 (sin permisos) mostrando mensaje al usuario

---

## 🚀 Orden de Ejecución

1. **PRIMERO (Backend):** Ejecutar migración SQL
2. **SEGUNDO (Backend):** Agregar rutas faltantes
3. **TERCERO (Backend):** Reiniciar servidor
4. **CUARTO (Frontend):** Agregar tokens a los servicios
5. **QUINTO (Ambos):** Probar todas las rutas con Postman/Frontend

---

## ⚠️ Advertencias React Router

Los warnings de React Router son **solo advertencias** (no errores) y se pueden ignorar por ahora. Para quitarlos, el frontend debe agregar flags en BrowserRouter:

```jsx
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
  {/* ... */}
</BrowserRouter>
```

---

## 📞 Comunicación con Frontend

Envíales este mensaje:

> Hola equipo frontend 👋
> 
> He detectado que varias peticiones están fallando porque **no están enviando el token de autenticación**. 
> 
> Por favor, asegúrense de que TODAS las peticiones a endpoints protegidos incluyan el header:
> ```
> Authorization: Bearer ${token}
> ```
> 
> El token se obtiene del localStorage después del login:
> ```javascript
> const token = localStorage.getItem('token');
> ```
> 
> Además, estoy agregando las siguientes rutas que les hacen falta:
> - ✅ GET /api/lineas-investigacion
> - ✅ GET /api/semilleros/:id/proyectos
> - ✅ GET /api/semilleros/:id/integrantes
> - ✅ GET /api/proyectos/:id/actividades
> 
> Una vez termine, les aviso para que prueben. ¡Gracias! 🚀
