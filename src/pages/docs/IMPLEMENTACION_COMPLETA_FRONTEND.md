# 🚀 IMPLEMENTACIÓN COMPLETA FRONTEND - Todas las Correcciones

## 📋 Índice de Implementaciones

1. **[CRÍTICO]** Restricción de Semilleros por Rol (Líder vs Admin)
2. **[NUEVO]** Crear Líder desde Formulario de Campo
3. **[FIX]** Cargar Líneas de Investigación
4. **[FIX]** Tokens JWT en Todas las Peticiones

---

# 1️⃣ RESTRICCIÓN DE SEMILLEROS POR ROL (CRÍTICO)

## 🚨 Problema Actual
María García (líder de semillero, rol=1) ve **TODOS los semilleros** cuando solo debería ver el suyo.

**Screenshot mencionado:**
- ✅ Muestra: "3 Semilleros Registrados"
- ❌ Debería mostrar: "Mi Semillero" (solo 1)

---

## ✅ Solución: Implementar Vista Condicional por Rol

### **A) Modificar Service de Semilleros**

**Archivo:** `src/services/semillerosService.ts` (o `.js`)

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Función existente (para admins globales)
export const getAllSemilleros = async () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/semilleros`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// ✨ NUEVA: Obtener SOLO mi semillero (para líderes)
export const getMiSemillero = async () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/semilleros/mi-semillero/info`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// ✨ NUEVA: Obtener campos de mi semillero
export const getMisCampos = async () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/semilleros/mi-semillero/campos`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// ✨ NUEVA: Actualizar mi semillero
export const updateMiSemillero = async (data: any) => {
  const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/semilleros/mi-semillero/actualizar`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// ✨ NUEVA: Cambiar estado de mi semillero
export const toggleMiSemilleroEstado = async () => {
  const token = localStorage.getItem('token');
  return axios.patch(`${API_URL}/semilleros/mi-semillero/estado`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

---

### **B) Modificar Dashboard/Página de Semilleros**

**Archivo:** `src/pages/Semilleros/SemillerosPage.tsx` (o donde esté la vista)

```tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Asume que tienes contexto de auth
import * as semillerosService from '../../services/semillerosService';

function SemillerosPage() {
  const { user } = useAuth(); // Obtener usuario autenticado
  const [semilleros, setSemilleros] = useState([]);
  const [miSemillero, setMiSemillero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [user]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      if (user.rol === 1) {
        // 🔴 LÍDER DE SEMILLERO: Solo su semillero
        const response = await semillerosService.getMiSemillero();
        setMiSemillero(response.data.semillero);
      } else {
        // 🟢 ADMIN GLOBAL: Todos los semilleros
        const response = await semillerosService.getAllSemilleros();
        setSemilleros(response.data.semilleros || response.data);
      }
    } catch (error) {
      console.error('Error al cargar semilleros:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="semilleros-container">
      {/* 🔴 VISTA PARA LÍDER DE SEMILLERO (rol=1) */}
      {user.rol === 1 && (
        <div className="vista-lider">
          <div className="header">
            <h1>Mi Semillero</h1>
            {/* ❌ NO mostrar botón "Nuevo Semillero" */}
          </div>

          {miSemillero ? (
            <div className="card-semillero">
              <div className="card-header">
                <h2>{miSemillero.nombre}</h2>
                <span className={`badge ${miSemillero.activo ? 'activo' : 'inactivo'}`}>
                  {miSemillero.activo ? 'Activo' : 'Cerrado'}
                </span>
              </div>
              
              <div className="card-body">
                <p><strong>Descripción:</strong> {miSemillero.descripcion}</p>
                <p><strong>Fecha Creación:</strong> {new Date(miSemillero.fecha_creacion).toLocaleDateString()}</p>
                
                {miSemillero.linea && (
                  <p><strong>Línea:</strong> {miSemillero.linea.nombre}</p>
                )}
                
                {miSemillero.liderUsuario && (
                  <p><strong>Líder:</strong> {miSemillero.liderUsuario.nombre}</p>
                )}
              </div>

              <div className="card-actions">
                <button 
                  onClick={() => navigate('/mi-semillero/editar')}
                  className="btn btn-primary"
                >
                  ✏️ Editar Mi Semillero
                </button>
                
                <button 
                  onClick={() => navigate('/mi-semillero/campos')}
                  className="btn btn-secondary"
                >
                  📂 Ver Campos de Investigación
                </button>

                <button 
                  onClick={toggleEstado}
                  className={`btn ${miSemillero.activo ? 'btn-warning' : 'btn-success'}`}
                >
                  {miSemillero.activo ? '🔒 Cerrar Semillero' : '✅ Activar Semillero'}
                </button>
              </div>
            </div>
          ) : (
            <div className="no-semillero">
              <p>No tienes un semillero asignado.</p>
            </div>
          )}
        </div>
      )}

      {/* 🟢 VISTA PARA ADMIN GLOBAL (rol ≠ 1) */}
      {user.rol !== 1 && (
        <div className="vista-admin">
          <div className="header">
            <h1>Gestión de Semilleros</h1>
            <button 
              onClick={() => navigate('/semilleros/nuevo')}
              className="btn btn-success"
            >
              ➕ Nuevo Semillero
            </button>
          </div>

          <div className="semilleros-stats">
            <div className="stat-card">
              <h3>{semilleros.length}</h3>
              <p>Semilleros Registrados</p>
            </div>
            <div className="stat-card">
              <h3>{semilleros.filter(s => s.activo).length}</h3>
              <p>Activos</p>
            </div>
          </div>

          <div className="tabla-semilleros">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Líder</th>
                  <th>Línea</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {semilleros.map(semillero => (
                  <tr key={semillero.id}>
                    <td>{semillero.nombre}</td>
                    <td>{semillero.lider_nombre || 'N/A'}</td>
                    <td>{semillero.linea_nombre || 'N/A'}</td>
                    <td>
                      <span className={`badge ${semillero.activo ? 'activo' : 'inactivo'}`}>
                        {semillero.activo ? 'Activo' : 'Cerrado'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => navigate(`/semilleros/${semillero.id}`)}>
                        Ver
                      </button>
                      <button onClick={() => navigate(`/semilleros/${semillero.id}/editar`)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SemillerosPage;
```

---

### **C) Modificar Navegación/Menú**

**Archivo:** `src/components/Sidebar.tsx` o `Navbar.tsx`

```tsx
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { user } = useAuth();

  return (
    <nav className="sidebar">
      {/* ... otros elementos ... */}

      {/* Menú condicional según rol */}
      {user.rol === 1 ? (
        // 🔴 LÍDER: Solo "Mi Semillero"
        <NavLink to="/mi-semillero" className="nav-item">
          🏛️ Mi Semillero
        </NavLink>
      ) : (
        // 🟢 ADMIN: "Gestionar Semilleros"
        <NavLink to="/semilleros" className="nav-item">
          🏛️ Gestionar Semilleros
        </NavLink>
      )}

      {/* ... otros elementos ... */}
    </nav>
  );
}
```

---

### **D) Modificar Rutas de la Aplicación**

**Archivo:** `src/routes/AppRoutes.tsx` (o similar)

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Ruta para LÍDERES */}
      {user.rol === 1 && (
        <>
          <Route path="/mi-semillero" element={<MiSemilleroPage />} />
          <Route path="/mi-semillero/editar" element={<EditarMiSemilleroPage />} />
          <Route path="/mi-semillero/campos" element={<MisCamposPage />} />
          
          {/* Redirigir si intenta acceder a /semilleros */}
          <Route path="/semilleros" element={<Navigate to="/mi-semillero" />} />
          <Route path="/semilleros/*" element={<Navigate to="/mi-semillero" />} />
        </>
      )}

      {/* Rutas para ADMINS */}
      {user.rol !== 1 && (
        <>
          <Route path="/semilleros" element={<SemillerosPage />} />
          <Route path="/semilleros/nuevo" element={<NuevoSemilleroPage />} />
          <Route path="/semilleros/:id" element={<DetalleSemilleroPage />} />
          <Route path="/semilleros/:id/editar" element={<EditarSemilleroPage />} />
        </>
      )}

      {/* ... otras rutas ... */}
    </Routes>
  );
}
```

---

# 2️⃣ CREAR LÍDER DESDE FORMULARIO DE CAMPO

## 📄 Implementación Completa

**Archivo:** `src/pages/Campos/NuevoCampoPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as usuariosService from '../../services/usuariosService';
import * as camposService from '../../services/camposService';
import * as lineasService from '../../services/lineasService';

function NuevoCampoPage() {
  const navigate = useNavigate();
  
  // Estados
  const [formData, setFormData] = useState({
    nombre: '',
    lider: '',
    descripcion: '',
    id_linea: '',
    horario_reunion: '',
    contacto_email: '',
  });
  
  const [lideres, setLideres] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [mostrarFormNuevoLider, setMostrarFormNuevoLider] = useState(false);
  const [nuevoLider, setNuevoLider] = useState({ nombre: '', correo: '' });
  const [loading, setLoading] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    cargarLideresYLineas();
  }, []);

  const cargarLideresYLineas = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar líderes disponibles
      const lideresRes = await fetch('http://localhost:3000/api/usuarios/posibles-lideres-campo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const lideresData = await lideresRes.json();
      setLideres(lideresData.usuarios || []);

      // Cargar líneas de investigación
      const lineasRes = await fetch('http://localhost:3000/api/lineas-investigacion');
      const lineasData = await lineasRes.json();
      setLineas(Array.isArray(lineasData) ? lineasData : []);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar formulario');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/campos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ Campo creado exitosamente');
        navigate('/campos');
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear campo');
    } finally {
      setLoading(false);
    }
  };

  const crearNuevoLider = async (e) => {
    e.preventDefault();
    
    if (!nuevoLider.nombre || !nuevoLider.correo) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/usuarios/quick-create-lider', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoLider)
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar contraseña temporal
        alert(
          `✅ Líder creado exitosamente!\n\n` +
          `Nombre: ${data.user.nombre}\n` +
          `Correo: ${data.user.correo}\n` +
          `Contraseña temporal: ${data.user.tempPassword}\n\n` +
          `⚠️ IMPORTANTE: Anote esta contraseña y proporciónela al nuevo líder.`
        );

        // Recargar lista de líderes
        await cargarLideresYLineas();

        // Seleccionar automáticamente el nuevo líder
        setFormData({ ...formData, lider: data.user.id });
        
        // Cerrar modal
        setMostrarFormNuevoLider(false);
        setNuevoLider({ nombre: '', correo: '' });
        
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error al crear líder:', error);
      alert('Error al crear líder');
    }
  };

  return (
    <div className="nuevo-campo-page">
      <h1>Crear Campo de Investigación</h1>

      <form onSubmit={handleSubmit} className="form-campo">
        {/* Nombre del Campo */}
        <div className="form-group">
          <label>Nombre del Campo *</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Inteligencia Artificial Aplicada"
            required
          />
        </div>

        {/* Líder del Campo */}
        <div className="form-group">
          <label>Líder del Campo *</label>
          <select
            value={formData.lider}
            onChange={(e) => setFormData({ ...formData, lider: e.target.value })}
            required
          >
            <option value="">Seleccione un líder</option>
            
            {lideres.filter(l => l.disponible).length > 0 && (
              <optgroup label="✅ Disponibles (sin campo asignado)">
                {lideres
                  .filter(l => l.disponible)
                  .map(lider => (
                    <option key={lider.id} value={lider.id}>
                      {lider.nombre} - {lider.correo}
                    </option>
                  ))
                }
              </optgroup>
            )}
            
            {lideres.filter(l => !l.disponible).length > 0 && (
              <optgroup label="⚠️ Ya tienen campo asignado">
                {lideres
                  .filter(l => !l.disponible)
                  .map(lider => (
                    <option key={lider.id} value={lider.id}>
                      {lider.nombre} - {lider.correo}
                    </option>
                  ))
                }
              </optgroup>
            )}
          </select>

          <button
            type="button"
            onClick={() => setMostrarFormNuevoLider(true)}
            className="btn btn-secondary btn-agregar-lider"
          >
            ➕ Crear Nuevo Líder
          </button>
        </div>

        {/* Línea de Investigación */}
        <div className="form-group">
          <label>Línea de Investigación *</label>
          <select
            value={formData.id_linea}
            onChange={(e) => setFormData({ ...formData, id_linea: e.target.value })}
            required
          >
            <option value="">Seleccione una línea</option>
            {lineas.map(linea => (
              <option key={linea.id} value={linea.id}>
                {linea.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label>Descripción *</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Describe el campo de investigación..."
            rows={4}
            required
          />
        </div>

        {/* Horario de Reunión (opcional) */}
        <div className="form-group">
          <label>Horario de Reunión</label>
          <input
            type="text"
            value={formData.horario_reunion}
            onChange={(e) => setFormData({ ...formData, horario_reunion: e.target.value })}
            placeholder="Ej: Lunes 2:00 PM - 4:00 PM"
          />
        </div>

        {/* Email de Contacto (opcional) */}
        <div className="form-group">
          <label>Email de Contacto</label>
          <input
            type="email"
            value={formData.contacto_email}
            onChange={(e) => setFormData({ ...formData, contacto_email: e.target.value })}
            placeholder="contacto@campo.com"
          />
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creando...' : '✅ Crear Campo'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/campos')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Modal para Crear Nuevo Líder */}
      {mostrarFormNuevoLider && (
        <div className="modal-overlay" onClick={() => setMostrarFormNuevoLider(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo Líder de Campo</h2>
              <button 
                className="btn-close"
                onClick={() => setMostrarFormNuevoLider(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={crearNuevoLider} className="form-nuevo-lider">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={nuevoLider.nombre}
                  onChange={(e) => setNuevoLider({ ...nuevoLider, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez García"
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  value={nuevoLider.correo}
                  onChange={(e) => setNuevoLider({ ...nuevoLider, correo: e.target.value })}
                  placeholder="juan.perez@ucp.edu.co"
                  required
                />
              </div>

              <div className="alert alert-info">
                ℹ️ Se generará una contraseña temporal automáticamente que deberás proporcionar al nuevo líder.
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  ✅ Crear Líder
                </button>
                <button 
                  type="button"
                  onClick={() => setMostrarFormNuevoLider(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NuevoCampoPage;
```

---

# 3️⃣ CSS PARA LOS MODALES Y FORMULARIOS

**Archivo:** `src/styles/Modal.css` (o en tu archivo CSS principal)

```css
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

/* Modal Content */
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #333;
}

/* Form Nuevo Líder */
.form-nuevo-lider .form-group {
  margin-bottom: 1.5rem;
}

.form-nuevo-lider label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-nuevo-lider input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-nuevo-lider input:focus {
  outline: none;
  border-color: #4CAF50;
}

/* Alert */
.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.alert-info {
  background-color: #e3f2fd;
  border-left: 4px solid #2196F3;
  color: #1565C0;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Botón Agregar Líder */
.btn-agregar-lider {
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Estilos para Select con Optgroups */
select optgroup {
  font-weight: bold;
  font-style: normal;
}

select option {
  padding: 0.5rem;
}

/* Badge para estado */
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge.activo {
  background-color: #4CAF50;
  color: white;
}

.badge.inactivo {
  background-color: #f44336;
  color: white;
}
```

---

# 4️⃣ ASEGURAR TOKENS JWT EN TODAS LAS PETICIONES

**Archivo:** `src/utils/axiosConfig.ts` (crear si no existe)

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Configurar interceptor para agregar token automáticamente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401 (token expirado)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { API_URL };
export default axios;
```

**Luego importar esto en `main.tsx` o `App.tsx`:**

```typescript
import './utils/axiosConfig'; // Inicializar interceptores
```

---

# 📋 CHECKLIST DE IMPLEMENTACIÓN

## ✅ Paso 1: Backend (YA LISTO)
- [x] Script SQL de líneas de investigación
- [x] Endpoints de líderes disponibles
- [x] Endpoint quick-create-lider
- [x] Fix Error 403 en /api/usuarios

## ⏳ Paso 2: Frontend (IMPLEMENTAR)

### A) Semilleros por Rol
- [ ] Modificar `semillerosService.ts` (agregar métodos nuevos)
- [ ] Modificar `SemillerosPage.tsx` (vista condicional)
- [ ] Modificar `Sidebar.tsx` (menú condicional)
- [ ] Modificar `AppRoutes.tsx` (rutas condicionales)
- [ ] Probar con usuario rol=1 (líder)

### B) Formulario de Campos
- [ ] Modificar `NuevoCampoPage.tsx` (agregar modal y lógica)
- [ ] Crear/actualizar `Modal.css`
- [ ] Probar crear campo con líder existente
- [ ] Probar crear campo con nuevo líder
- [ ] Verificar que aparezcan líneas de investigación

### C) Tokens JWT
- [ ] Crear `axiosConfig.ts` con interceptores
- [ ] Importar en `main.tsx` o `App.tsx`
- [ ] Verificar que todas las peticiones incluyen token

## ⏳ Paso 3: Ejecutar SQL
```bash
mysql -u root -p gestion_proyectos_db < migrations/insert_lineas_investigacion.sql
```

## ⏳ Paso 4: Pruebas Finales
- [ ] Login como líder → Ver solo su semillero
- [ ] Login como admin → Ver todos los semilleros
- [ ] Crear campo con líder nuevo
- [ ] Verificar select de líneas tiene opciones

---

# 🎯 RESULTADO ESPERADO

## ANTES (Incorrecto):
- ❌ Líder ve 3 semilleros
- ❌ Botón "Nuevo Semillero" visible para líder
- ❌ No se puede crear líder desde formulario
- ❌ Líneas de investigación vacías

## DESPUÉS (Correcto):
- ✅ Líder ve solo "Mi Semillero" (1)
- ✅ NO hay botón "Nuevo Semillero" para líder
- ✅ Puede crear líder desde formulario con contraseña temporal
- ✅ 12 líneas de investigación disponibles

---

# 📞 SOPORTE

Si encuentras errores:

1. **Error 403:** Verificar que el token JWT esté en headers
2. **Select vacío:** Ejecutar script SQL de líneas
3. **No carga líderes:** Verificar endpoint `/api/usuarios/posibles-lideres-campo`
4. **Modal no aparece:** Verificar CSS del modal

---

**Archivos a Modificar:**
1. `src/services/semillerosService.ts`
2. `src/pages/Semilleros/SemillerosPage.tsx`
3. `src/pages/Campos/NuevoCampoPage.tsx`
4. `src/components/Sidebar.tsx`
5. `src/routes/AppRoutes.tsx`
6. `src/utils/axiosConfig.ts` (crear)
7. `src/styles/Modal.css` (crear o actualizar)

**Tiempo Estimado:** 1-2 horas de implementación + pruebas
