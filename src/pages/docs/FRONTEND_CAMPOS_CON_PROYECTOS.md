# 📚 Documentación API - Endpoint de Campos con Proyectos

## 📋 Información General

Esta documentación explica cómo consumir el endpoint de **Campos de Investigación** que ahora incluye los **proyectos** e **integrantes** asociados dentro del mismo objeto.

**Base URL:** `http://localhost:3000/api/campos`

---

## 🎯 Cambio Importante

### ⚠️ Estructura Anterior (OBSOLETA)
```json
{
  "campo": { ... },
  "proyectos": [ ... ],  // ❌ Propiedad separada
  "integrantes": [ ... ]  // ❌ Propiedad separada
}
```

### ✅ Nueva Estructura (ACTUAL)
```json
{
  "campo": {
    "id": 1,
    "nombre": "...",
    "proyectos": [ ... ],    // ✅ Dentro del objeto campo
    "integrantes": [ ... ]   // ✅ Dentro del objeto campo
  }
}
```

---

## 📌 Endpoints Disponibles

### 1. Listar Todos los Campos
### 2. Obtener Campo por ID (con proyectos e integrantes)

---

## 🔹 1. LISTAR TODOS LOS CAMPOS

Obtiene una lista de todos los campos de investigación disponibles.

### **Endpoint**
```
GET /api/campos
```

### **Autenticación**
No requiere autenticación (público).

### **Respuesta Exitosa (200)**
```json
{
  "campos": [
    {
      "id": 1,
      "nombre": "Desarrollo Web Full Stack",
      "descripcion": "Campo enfocado en el desarrollo de aplicaciones web modernas",
      "ruta_imagen": "https://res.cloudinary.com/.../campo1.png",
      "lider": 21,
      "id_semillero": 1,
      "horario_reunion": "Viernes 3:00 PM - 5:00 PM",
      "contacto_email": "web.dev@ucp.edu.co"
    },
    {
      "id": 2,
      "nombre": "Machine Learning Applications",
      "descripcion": "Investigación en machine learning",
      "ruta_imagen": "/uploads/campos/ml-apps.jpg",
      "lider": 3,
      "id_semillero": 2
    }
  ]
}
```

### **Ejemplo de Uso (React)**
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function ListaCampos() {
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/campos');
        setCampos(response.data.campos);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar campos');
      } finally {
        setLoading(false);
      }
    };

    fetchCampos();
  }, []);

  if (loading) return <div className="loading">Cargando campos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="campos-grid">
      {campos.map(campo => (
        <div key={campo.id} className="campo-card">
          {campo.ruta_imagen && (
            <img src={campo.ruta_imagen} alt={campo.nombre} />
          )}
          <h3>{campo.nombre}</h3>
          <p>{campo.descripcion}</p>
          <a href={`/campos/${campo.id}`} className="btn-ver-mas">
            Ver más →
          </a>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔹 2. OBTENER CAMPO POR ID (CON PROYECTOS E INTEGRANTES)

Obtiene la información completa de un campo específico, **incluyendo sus proyectos e integrantes asociados**.

### **Endpoint**
```
GET /api/campos/:id
```

### **Parámetros de URL**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | number | ID del campo de investigación |

### **Ejemplo de URL**
```
GET /api/campos/1
```

### **Respuesta Exitosa (200)**
```json
{
  "campo": {
    "id": 1,
    "nombre": "Desarrollo Web Full Stack",
    "lider": 21,
    "descripcion": "Campo enfocado en el desarrollo de aplicaciones web modernas usando React y Node.js.",
    "ruta_imagen": "https://res.cloudinary.com/dw9krxrn4/image/upload/v1762499218/semilleros-ucp/campos/qxschcqxj2fduyrntmht.png",
    "horario_reunion": "Viernes 3:00 PM - 5:00 PM",
    "contacto_email": "santiago.zapata@ucp.edu.co",
    "contacto_redes_sociales": null,
    "id_semillero": 1,
    
    "semillero": {
      "id": 1,
      "nombre": "Semillero TechLab",
      "lider": 2,
      "descripcion": "Semillero enfocado en el desarrollo de software moderno",
      "contacto": "techlab@ucp.edu.co",
      "lineas_investigacion_id": 1,
      "activo": 1
    },
    
    "liderUsuario": {
      "id": 21,
      "nombre": "Carlos Rodríguez",
      "correo": "carlos.rodriguez@ucp.edu.co"
    },
    
    "proyectos": [
      {
        "id": 1,
        "titulo": "Sistema de Gestión Universitaria",
        "descripcion": "Sistema web para gestión de estudiantes, profesores y cursos. Backend Node.js, frontend React.",
        "imagen": "/uploads/proyectos/sistema-universitario.jpg",
        "estado": 1,
        "porcentaje_avance": 65,
        "url": "https://github.com/ucp-techlab/sistema-universitario"
      }
    ],
    
    "integrantes": [
      {
        "id": 5,
        "nombre": "Juan Pérez",
        "correo": "juan.perez@ucp.edu.co",
        "rol": "Desarrollador Frontend",
        "activo": 1
      }
    ]
  }
}
```

### **Respuestas de Error**

**404 - Campo No Encontrado**
```json
{
  "message": "Campo no encontrado"
}
```

**500 - Error del Servidor**
```json
{
  "message": "Error del servidor"
}
```

---

## 💻 Ejemplo Completo de Implementación (React)

### **Componente: DetalleCampo.jsx**

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './DetalleCampo.css';

function DetalleCampo() {
  const { id } = useParams();
  const [campo, setCampo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/campos/${id}`);
        setCampo(response.data.campo);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el campo');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCampo();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando información del campo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={() => window.history.back()}>Volver</button>
      </div>
    );
  }

  if (!campo) {
    return (
      <div className="not-found">
        <h2>Campo no encontrado</h2>
        <button onClick={() => window.history.back()}>Volver</button>
      </div>
    );
  }

  return (
    <div className="detalle-campo">
      {/* HEADER DEL CAMPO */}
      <header className="campo-header">
        {campo.ruta_imagen && (
          <div className="campo-imagen-container">
            <img 
              src={campo.ruta_imagen} 
              alt={campo.nombre}
              className="campo-imagen"
            />
          </div>
        )}
        
        <div className="campo-info-principal">
          <h1>{campo.nombre}</h1>
          
          {campo.semillero && (
            <span className="semillero-badge">
              📚 {campo.semillero.nombre}
            </span>
          )}
          
          <p className="campo-descripcion">{campo.descripcion}</p>
          
          {/* INFORMACIÓN DEL LÍDER */}
          {campo.liderUsuario && (
            <div className="lider-info">
              <strong>👤 Líder:</strong> 
              <span>{campo.liderUsuario.nombre}</span>
              <a href={`mailto:${campo.liderUsuario.correo}`}>
                {campo.liderUsuario.correo}
              </a>
            </div>
          )}
          
          {/* HORARIO Y CONTACTO */}
          <div className="campo-detalles">
            {campo.horario_reunion && (
              <div className="detalle-item">
                <strong>📅 Horario de Reunión:</strong>
                <span>{campo.horario_reunion}</span>
              </div>
            )}
            
            {campo.contacto_email && (
              <div className="detalle-item">
                <strong>📧 Contacto:</strong>
                <a href={`mailto:${campo.contacto_email}`}>
                  {campo.contacto_email}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SECCIÓN DE PROYECTOS */}
      <section className="proyectos-section">
        <h2>🚀 Proyectos ({campo.proyectos?.length || 0})</h2>
        
        {campo.proyectos && campo.proyectos.length > 0 ? (
          <div className="proyectos-grid">
            {campo.proyectos.map(proyecto => (
              <ProyectoCard key={proyecto.id} proyecto={proyecto} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>📭 No hay proyectos registrados en este campo aún.</p>
          </div>
        )}
      </section>

      {/* SECCIÓN DE INTEGRANTES */}
      <section className="integrantes-section">
        <h2>👥 Integrantes ({campo.integrantes?.length || 0})</h2>
        
        {campo.integrantes && campo.integrantes.length > 0 ? (
          <div className="integrantes-grid">
            {campo.integrantes.map(integrante => (
              <IntegranteCard key={integrante.id} integrante={integrante} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>👤 No hay integrantes registrados aún.</p>
          </div>
        )}
      </section>
    </div>
  );
}

// Componente para cada tarjeta de proyecto
function ProyectoCard({ proyecto }) {
  return (
    <div className="proyecto-card">
      {proyecto.imagen && (
        <img 
          src={proyecto.imagen} 
          alt={proyecto.titulo}
          className="proyecto-imagen"
        />
      )}
      
      <div className="proyecto-content">
        <h3>{proyecto.titulo}</h3>
        <p className="proyecto-descripcion">{proyecto.descripcion}</p>
        
        <div className="proyecto-meta">
          <span className={`estado-badge ${proyecto.estado === 1 ? 'activo' : 'inactivo'}`}>
            {proyecto.estado === 1 ? '🟢 Activo' : '🔴 Inactivo'}
          </span>
          
          <div className="progreso-container">
            <div className="progreso-label">
              <span>Avance:</span>
              <strong>{proyecto.porcentaje_avance}%</strong>
            </div>
            <div className="progreso-bar">
              <div 
                className="progreso-fill" 
                style={{ width: `${proyecto.porcentaje_avance}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {proyecto.url && (
          <a 
            href={proyecto.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-ver-proyecto"
          >
            Ver Repositorio →
          </a>
        )}
      </div>
    </div>
  );
}

// Componente para cada tarjeta de integrante
function IntegranteCard({ integrante }) {
  return (
    <div className="integrante-card">
      <div className="integrante-avatar">
        {integrante.nombre.charAt(0)}
      </div>
      <div className="integrante-info">
        <h4>{integrante.nombre}</h4>
        {integrante.rol && <p className="integrante-rol">{integrante.rol}</p>}
        <a href={`mailto:${integrante.correo}`} className="integrante-correo">
          {integrante.correo}
        </a>
      </div>
    </div>
  );
}

export default DetalleCampo;
```

---

## 🎨 Estilos CSS Sugeridos

### **DetalleCampo.css**

```css
/* ========== CONTENEDOR PRINCIPAL ========== */
.detalle-campo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* ========== HEADER DEL CAMPO ========== */
.campo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem;
  border-radius: 12px;
  margin-bottom: 3rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.campo-imagen-container {
  margin-bottom: 2rem;
}

.campo-imagen {
  width: 100%;
  max-width: 400px;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.campo-info-principal h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.semillero-badge {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.campo-descripcion {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 1.5rem 0;
}

.lider-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
}

.lider-info a {
  color: white;
  text-decoration: underline;
}

.campo-detalles {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.detalle-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detalle-item a {
  color: white;
  text-decoration: underline;
}

/* ========== SECCIÓN DE PROYECTOS ========== */
.proyectos-section,
.integrantes-section {
  margin-bottom: 3rem;
}

.proyectos-section h2,
.integrantes-section h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.proyectos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.proyecto-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.proyecto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.proyecto-imagen {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.proyecto-content {
  padding: 1.5rem;
}

.proyecto-content h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.proyecto-descripcion {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.proyecto-meta {
  margin: 1rem 0;
}

.estado-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.estado-badge.activo {
  background: #d4edda;
  color: #155724;
}

.estado-badge.inactivo {
  background: #f8d7da;
  color: #721c24;
}

.progreso-container {
  margin-top: 1rem;
}

.progreso-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.progreso-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progreso-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.5s ease;
}

.btn-ver-proyecto {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: transform 0.3s;
}

.btn-ver-proyecto:hover {
  transform: translateX(5px);
}

/* ========== SECCIÓN DE INTEGRANTES ========== */
.integrantes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.integrante-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s;
}

.integrante-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.integrante-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.integrante-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.integrante-rol {
  font-size: 0.85rem;
  color: #666;
  margin: 0.25rem 0;
}

.integrante-correo {
  font-size: 0.85rem;
  color: #667eea;
  text-decoration: none;
}

.integrante-correo:hover {
  text-decoration: underline;
}

/* ========== ESTADOS VACÍOS ========== */
.empty-state {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

/* ========== LOADING Y ERRORES ========== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 3rem;
  background: #f8d7da;
  border-radius: 8px;
  color: #721c24;
}

.error-container button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #721c24;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .detalle-campo {
    padding: 1rem;
  }

  .campo-header {
    padding: 2rem 1.5rem;
  }

  .campo-info-principal h1 {
    font-size: 1.8rem;
  }

  .proyectos-grid,
  .integrantes-grid {
    grid-template-columns: 1fr;
  }

  .lider-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

---

## 📦 Estructura de Datos: Campo Completo

### **Propiedades del Objeto `campo`**

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID único del campo |
| `nombre` | string | Nombre del campo de investigación |
| `descripcion` | string | Descripción detallada |
| `ruta_imagen` | string \| null | URL de la imagen del campo |
| `lider` | number | ID del usuario líder |
| `id_semillero` | number | ID del semillero al que pertenece |
| `horario_reunion` | string \| null | Horario de reuniones |
| `contacto_email` | string \| null | Email de contacto |
| `contacto_redes_sociales` | object \| null | Redes sociales en formato JSON |
| `semillero` | object | Información del semillero |
| `liderUsuario` | object | Información del líder |
| `proyectos` | array | **Array de proyectos del campo** |
| `integrantes` | array | **Array de integrantes del campo** |

### **Propiedades de cada `proyecto` en el array**

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID único del proyecto |
| `titulo` | string | Título del proyecto |
| `descripcion` | string | Descripción del proyecto |
| `imagen` | string \| null | URL de la imagen del proyecto |
| `estado` | number | Estado del proyecto (1=Activo, 0=Inactivo) |
| `porcentaje_avance` | number | Porcentaje de avance (0-100) |
| `url` | string \| null | URL del repositorio o sitio web |

---

## ⚠️ Validaciones y Buenas Prácticas

### **1. Validar Existencia de Arrays**

Siempre valida que los arrays existan antes de usarlos:

```javascript
// ✅ CORRECTO
{campo.proyectos && campo.proyectos.length > 0 ? (
  <ProyectosLista proyectos={campo.proyectos} />
) : (
  <MensajeVacio />
)}

// ❌ INCORRECTO (puede causar error si proyectos es undefined)
{campo.proyectos.length > 0 && <ProyectosLista />}
```

### **2. Usar Optional Chaining**

```javascript
// ✅ CORRECTO
const cantidadProyectos = campo.proyectos?.length || 0;
const nombreLider = campo.liderUsuario?.nombre || 'Sin líder';

// ❌ INCORRECTO (puede causar error)
const cantidadProyectos = campo.proyectos.length;
```

### **3. Manejo de Estados**

```javascript
const [campo, setCampo] = useState(null);  // null inicialmente
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Verificar estados antes de renderizar
if (loading) return <Loading />;
if (error) return <Error mensaje={error} />;
if (!campo) return <NotFound />;

// Solo aquí sabemos que campo existe
return <CampoDetalle campo={campo} />;
```

### **4. TypeScript (Opcional pero Recomendado)**

```typescript
interface Proyecto {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string | null;
  estado: number;
  porcentaje_avance: number;
  url: string | null;
}

interface Integrante {
  id: number;
  nombre: string;
  correo: string;
  rol?: string;
  activo: number;
}

interface Campo {
  id: number;
  nombre: string;
  descripcion: string;
  ruta_imagen: string | null;
  lider: number;
  id_semillero: number;
  horario_reunion?: string | null;
  contacto_email?: string | null;
  contacto_redes_sociales?: any;
  semillero?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  liderUsuario?: {
    id: number;
    nombre: string;
    correo: string;
  };
  proyectos: Proyecto[];  // ✅ Siempre es un array
  integrantes: Integrante[];  // ✅ Siempre es un array
}
```

---

## 🐛 Manejo de Errores

### **Error 404 - Campo No Encontrado**

```jsx
if (error && error.includes('no encontrado')) {
  return (
    <div className="not-found">
      <h2>🔍 Campo No Encontrado</h2>
      <p>El campo que buscas no existe o ha sido eliminado.</p>
      <Link to="/campos">Ver todos los campos</Link>
    </div>
  );
}
```

### **Error de Conexión**

```jsx
if (error && error.includes('red')) {
  return (
    <div className="connection-error">
      <h2>🌐 Error de Conexión</h2>
      <p>No se pudo conectar con el servidor.</p>
      <button onClick={() => window.location.reload()}>
        Reintentar
      </button>
    </div>
  );
}
```

---

## 🧪 Testing

### **Test Unitario (Jest + React Testing Library)**

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import DetalleCampo from './DetalleCampo';

jest.mock('axios');

describe('DetalleCampo Component', () => {
  const mockCampo = {
    campo: {
      id: 1,
      nombre: 'Desarrollo Web Full Stack',
      descripcion: 'Campo de desarrollo web',
      proyectos: [
        {
          id: 1,
          titulo: 'Proyecto Test',
          descripcion: 'Descripción test',
          imagen: null,
          estado: 1,
          porcentaje_avance: 75,
          url: 'https://github.com/test'
        }
      ],
      integrantes: []
    }
  };

  test('debe mostrar proyectos cuando existen', async () => {
    axios.get.mockResolvedValue({ data: mockCampo });

    render(
      <BrowserRouter>
        <DetalleCampo />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Proyecto Test')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  test('debe mostrar mensaje cuando no hay proyectos', async () => {
    const campoSinProyectos = {
      campo: { ...mockCampo.campo, proyectos: [] }
    };
    
    axios.get.mockResolvedValue({ data: campoSinProyectos });

    render(
      <BrowserRouter>
        <DetalleCampo />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No hay proyectos registrados/i)).toBeInTheDocument();
    });
  });
});
```

---

## ✅ Checklist de Implementación

- [ ] Actualizar el código para usar `response.data.campo` en lugar de destructurar
- [ ] Acceder a `campo.proyectos` en lugar de `proyectos` separado
- [ ] Acceder a `campo.integrantes` en lugar de `integrantes` separado
- [ ] Agregar validación para arrays vacíos (`proyectos?.length || 0`)
- [ ] Usar optional chaining (`campo.proyectos?.map(...)`)
- [ ] Implementar estados de loading, error y vacío
- [ ] Mostrar mensaje cuando `proyectos` array está vacío
- [ ] Mostrar mensaje cuando `integrantes` array está vacío
- [ ] Agregar estilos responsive
- [ ] Probar con diferentes campos (con y sin proyectos)
- [ ] Agregar tests unitarios

---

## 📞 Soporte

Si tienes dudas sobre la implementación:
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Revisa la consola del navegador para errores de CORS
- Asegúrate de que el campo tenga proyectos en la base de datos
- Verifica la estructura de la respuesta con DevTools

---

## 🎉 Resumen

### **Lo que cambió:**
- ❌ Antes: `proyectos` e `integrantes` eran propiedades separadas
- ✅ Ahora: `proyectos` e `integrantes` están **dentro de `campo`**

### **Cómo acceder:**
```javascript
// Obtener el campo
const { campo } = response.data;

// Acceder a proyectos
const proyectos = campo.proyectos;  // ✅ Array garantizado

// Acceder a integrantes
const integrantes = campo.integrantes;  // ✅ Array garantizado
```

### **Garantías del Backend:**
✅ `proyectos` siempre es un array (nunca `null` o `undefined`)  
✅ `integrantes` siempre es un array (nunca `null` o `undefined`)  
✅ Cada proyecto tiene todos los campos especificados  
✅ Estado del proyecto es numérico (1=activo, 0=inactivo)

---

**Última actualización:** 7 de noviembre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Listo para Implementar
