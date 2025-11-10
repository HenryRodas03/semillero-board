# 🎨 LANDING PAGE - Guía de Implementación Frontend

**Universidad Católica de Pereira - Gestión de Semilleros de Investigación**

---

## 🎯 Objetivo

Crear una **Landing Page pública** que muestre información de los semilleros de investigación, campos de investigación y proyectos de la Universidad Católica de Pereira. Esta página NO requiere autenticación y es el punto de entrada para visitantes externos y la comunidad universitaria.

---

## 📋 Requisitos Previos

### ✅ Backend
- **URL Base:** `http://localhost:5000/api`
- **Estado:** Debe estar corriendo (`npm start` en BackendGestorProyectos)
- **Base de datos:** Poblada con datos de prueba

### ✅ Verificar que el backend funciona:
```bash
# Prueba rápida en el navegador o Postman:
GET http://localhost:5000/api/semilleros/activos
```

Si devuelve JSON con semilleros, ¡estás listo! 🚀

---

## 🏗️ Estructura de la Landing Page

### Secciones a implementar (en orden):

```
┌─────────────────────────────────────┐
│  1. NAVBAR                          │
│  - Logo UCP                         │
│  - Botón "Iniciar Sesión"          │
└─────────────────────────────────────┘
│  2. HERO SECTION                    │
│  - Título llamativo                 │
│  - Descripción breve                │
│  - Imagen/Ilustración               │
└─────────────────────────────────────┘
│  3. SEMILLEROS ACTIVOS              │
│  - Tarjetas con:                    │
│    • Imagen                         │
│    • Nombre                         │
│    • Descripción corta              │
│    • Línea de investigación         │
│    • Ver más →                      │
└─────────────────────────────────────┘
│  4. CAMPOS DE INVESTIGACIÓN         │
│  - Grid de tarjetas con:            │
│    • Imagen                         │
│    • Nombre                         │
│    • Semillero al que pertenece     │
│    • Líder                          │
│    • Ver proyectos →                │
└─────────────────────────────────────┘
│  5. PROYECTOS DESTACADOS            │
│  - Carrusel/Grid con:               │
│    • Filtros por estado             │
│    • Imagen del proyecto            │
│    • Título                         │
│    • Estado (En progreso/Finalizado)│
│    • Porcentaje de avance           │
│    • Ver detalle →                  │
└─────────────────────────────────────┘
│  6. FOOTER                          │
│  - Información de contacto UCP      │
│  - Links redes sociales             │
│  - Copyright                        │
└─────────────────────────────────────┘
```

---

## 📡 ENDPOINTS A CONSUMIR

### 1️⃣ Semilleros Activos

```javascript
// GET http://localhost:5000/api/semilleros/activos
const obtenerSemilleros = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/semilleros/activos');
    const data = await response.json();
    return data.semilleros; // Array de semilleros
  } catch (error) {
    console.error('Error al obtener semilleros:', error);
  }
};
```

**Respuesta esperada:**
```json
{
  "semilleros": [
    {
      "id": 1,
      "nombre": "Semillero TechLab",
      "descripcion": "Semillero enfocado en el desarrollo de software moderno...",
      "ruta_imagen": "/uploads/semilleros/techlab.jpg",
      "contacto": "techlab@ucp.edu.co",
      "activo": 1,
      "creado_en": "2024-01-15T10:00:00.000Z",
      "lider": {
        "id": 2,
        "nombre": "María González"
      },
      "linea_investigacion": "Desarrollo de Software"
    },
    {
      "id": 2,
      "nombre": "Semillero AI Research",
      "descripcion": "Investigación en inteligencia artificial...",
      "ruta_imagen": "/uploads/semilleros/ai-research.jpg",
      "contacto": "ai.research@ucp.edu.co",
      "activo": 1,
      "lider": {
        "id": 3,
        "nombre": "Carlos Mendoza"
      },
      "linea_investigacion": "Inteligencia Artificial"
    }
  ]
}
```

---

### 2️⃣ Campos de Investigación

```javascript
// GET http://localhost:5000/api/campos
const obtenerCampos = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/campos');
    const data = await response.json();
    return data.campos; // Array de campos
  } catch (error) {
    console.error('Error al obtener campos:', error);
  }
};
```

**Respuesta esperada:**
```json
{
  "campos": [
    {
      "id": 1,
      "nombre": "Desarrollo Web Full Stack",
      "descripcion": "Campo enfocado en el desarrollo de aplicaciones web modernas...",
      "ruta_imagen": "/uploads/campos/web-fullstack.jpg",
      "lider": {
        "id": 2,
        "nombre": "María González",
        "correo": "maria.gonzalez@ucp.edu.co"
      },
      "semillero": {
        "id": 1,
        "nombre": "Semillero TechLab"
      }
    }
  ]
}
```

---

### 3️⃣ Proyectos (con filtros opcionales)

```javascript
// GET http://localhost:5000/api/projects
// Con filtros: ?estado=1 (1=En progreso, 2=En pausa, 3=Finalizado)
const obtenerProyectos = async (estado = null) => {
  try {
    const url = estado 
      ? `http://localhost:5000/api/projects?estado=${estado}`
      : 'http://localhost:5000/api/projects';
    
    const response = await fetch(url);
    const data = await response.json();
    return data.projects; // Array de proyectos
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
  }
};
```

**Respuesta esperada:**
```json
{
  "projects": [
    {
      "id": 1,
      "titulo": "Sistema de Gestión Universitaria",
      "descripcion": "Desarrollo de un sistema web integral...",
      "ruta_foto": "/uploads/proyectos/sistema-universitario.jpg",
      "url": "https://github.com/ucp-techlab/sistema-universitario",
      "porcentaje_avance": 65.00,
      "fecha_creacion": "2024-11-06T15:00:00.000Z",
      "estado": {
        "id": 1,
        "estado": "En progreso"
      },
      "campo": {
        "id": 1,
        "nombre": "Desarrollo Web Full Stack"
      }
    }
  ]
}
```

---

## 🎨 Componentes a Crear

### 1. `Navbar.jsx`
```jsx
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/logo-ucp.png" alt="UCP Logo" />
        <span>Semilleros de Investigación</span>
      </div>
      <div className="nav-links">
        <a href="#semilleros">Semilleros</a>
        <a href="#campos">Campos</a>
        <a href="#proyectos">Proyectos</a>
        <Link to="/login" className="btn-login">Iniciar Sesión</Link>
      </div>
    </nav>
  );
};
```

---

### 2. `HeroSection.jsx`
```jsx
export const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Semilleros de Investigación</h1>
        <h2>Universidad Católica de Pereira</h2>
        <p>
          Descubre los proyectos innovadores que están transformando 
          el futuro de la investigación en nuestra universidad
        </p>
        <a href="#semilleros" className="btn-primary">
          Explorar Semilleros
        </a>
      </div>
      <div className="hero-image">
        <img src="/hero-illustration.svg" alt="Investigación" />
      </div>
    </section>
  );
};
```

---

### 3. `SemillerosSection.jsx`
```jsx
import { useState, useEffect } from 'react';

export const SemillerosSection = () => {
  const [semilleros, setSemilleros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSemilleros = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/semilleros/activos');
        const data = await response.json();
        setSemilleros(data.semilleros);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSemilleros();
  }, []);

  if (loading) return <div className="loading">Cargando semilleros...</div>;

  return (
    <section id="semilleros" className="semilleros-section">
      <h2>Nuestros Semilleros de Investigación</h2>
      <div className="semilleros-grid">
        {semilleros.map((semillero) => (
          <div key={semillero.id} className="semillero-card">
            <img 
              src={`http://localhost:5000${semillero.ruta_imagen}`} 
              alt={semillero.nombre}
              onError={(e) => e.target.src = '/placeholder-semillero.jpg'}
            />
            <div className="card-content">
              <h3>{semillero.nombre}</h3>
              <p className="linea">{semillero.linea_investigacion}</p>
              <p className="descripcion">{semillero.descripcion.substring(0, 120)}...</p>
              <div className="card-footer">
                <span className="lider">Líder: {semillero.lider.nombre}</span>
                <a href={`/semillero/${semillero.id}`} className="btn-ver-mas">
                  Ver más →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
```

---

### 4. `CamposSection.jsx`
```jsx
import { useState, useEffect } from 'react';

export const CamposSection = () => {
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/campos');
        const data = await response.json();
        setCampos(data.campos);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampos();
  }, []);

  if (loading) return <div className="loading">Cargando campos...</div>;

  return (
    <section id="campos" className="campos-section">
      <h2>Campos de Investigación</h2>
      <div className="campos-grid">
        {campos.map((campo) => (
          <div key={campo.id} className="campo-card">
            <img 
              src={`http://localhost:5000${campo.ruta_imagen}`} 
              alt={campo.nombre}
              onError={(e) => e.target.src = '/placeholder-campo.jpg'}
            />
            <div className="card-content">
              <span className="semillero-badge">{campo.semillero.nombre}</span>
              <h3>{campo.nombre}</h3>
              <p>{campo.descripcion.substring(0, 100)}...</p>
              <p className="lider">
                <strong>Líder:</strong> {campo.lider.nombre}
              </p>
              <a href={`/campo/${campo.id}`} className="btn-secondary">
                Ver proyectos →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
```

---

### 5. `ProyectosSection.jsx`
```jsx
import { useState, useEffect } from 'react';

export const ProyectosSection = () => {
  const [proyectos, setProyectos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const url = filtroEstado
          ? `http://localhost:5000/api/projects?estado=${filtroEstado}`
          : 'http://localhost:5000/api/projects';
        
        const response = await fetch(url);
        const data = await response.json();
        setProyectos(data.projects);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProyectos();
  }, [filtroEstado]);

  const getEstadoColor = (estadoId) => {
    const colores = {
      1: '#28a745', // En progreso - verde
      2: '#ffc107', // En pausa - amarillo
      3: '#6c757d'  // Finalizado - gris
    };
    return colores[estadoId] || '#000';
  };

  if (loading) return <div className="loading">Cargando proyectos...</div>;

  return (
    <section id="proyectos" className="proyectos-section">
      <h2>Proyectos Destacados</h2>
      
      {/* Filtros */}
      <div className="filtros">
        <button 
          className={filtroEstado === null ? 'active' : ''}
          onClick={() => setFiltroEstado(null)}
        >
          Todos
        </button>
        <button 
          className={filtroEstado === 1 ? 'active' : ''}
          onClick={() => setFiltroEstado(1)}
        >
          En Progreso
        </button>
        <button 
          className={filtroEstado === 3 ? 'active' : ''}
          onClick={() => setFiltroEstado(3)}
        >
          Finalizados
        </button>
      </div>

      {/* Grid de proyectos */}
      <div className="proyectos-grid">
        {proyectos.map((proyecto) => (
          <div key={proyecto.id} className="proyecto-card">
            <img 
              src={`http://localhost:5000${proyecto.ruta_foto}`} 
              alt={proyecto.titulo}
              onError={(e) => e.target.src = '/placeholder-proyecto.jpg'}
            />
            <div className="card-content">
              <span 
                className="estado-badge"
                style={{ backgroundColor: getEstadoColor(proyecto.estado.id) }}
              >
                {proyecto.estado.estado}
              </span>
              <h3>{proyecto.titulo}</h3>
              <p className="campo">{proyecto.campo.nombre}</p>
              <p className="descripcion">{proyecto.descripcion.substring(0, 120)}...</p>
              
              {/* Barra de progreso */}
              <div className="progreso">
                <div className="progreso-label">
                  Avance: {proyecto.porcentaje_avance}%
                </div>
                <div className="progreso-bar">
                  <div 
                    className="progreso-fill"
                    style={{ width: `${proyecto.porcentaje_avance}%` }}
                  />
                </div>
              </div>

              <div className="card-footer">
                {proyecto.url && (
                  <a 
                    href={proyecto.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-github"
                  >
                    <i className="fab fa-github"></i> GitHub
                  </a>
                )}
                <a href={`/proyecto/${proyecto.id}`} className="btn-ver-mas">
                  Ver detalle →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
```

---

### 6. `Footer.jsx`
```jsx
export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Universidad Católica de Pereira</h3>
          <p>Semilleros de Investigación</p>
          <p>Carrera 21 #49-95, Pereira, Risaralda</p>
        </div>
        
        <div className="footer-section">
          <h3>Contacto</h3>
          <p>📧 investigacion@ucp.edu.co</p>
          <p>📞 (606) 312 4000 ext. 456</p>
        </div>

        <div className="footer-section">
          <h3>Síguenos</h3>
          <div className="social-links">
            <a href="https://facebook.com/ucpereira" target="_blank">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://twitter.com/ucpereira" target="_blank">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com/ucpereira" target="_blank">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Universidad Católica de Pereira. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};
```

---

## 🎨 Estilos Base (CSS)

### `LandingPage.css`

```css
/* Variables de color */
:root {
  --primary-color: #003366;      /* Azul UCP */
  --secondary-color: #FFD700;    /* Dorado UCP */
  --text-color: #333;
  --bg-light: #f8f9fa;
  --success: #28a745;
  --warning: #ffc107;
  --muted: #6c757d;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar .logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-color);
}

.navbar .logo img {
  height: 50px;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: var(--primary-color);
}

.btn-login {
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 5px;
}

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  padding: 5rem 5%;
  background: linear-gradient(135deg, #003366 0%, #0066cc 100%);
  color: white;
  align-items: center;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.hero h2 {
  font-size: 1.8rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 2rem;
}

.btn-primary {
  display: inline-block;
  background: var(--secondary-color);
  color: var(--primary-color);
  padding: 1rem 2rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.3s;
}

.btn-primary:hover {
  transform: scale(1.05);
}

.hero-image img {
  width: 100%;
  max-width: 500px;
}

/* Secciones comunes */
section {
  padding: 5rem 5%;
}

section h2 {
  text-align: center;
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 3rem;
}

/* Grid de tarjetas */
.semilleros-grid,
.campos-grid,
.proyectos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

/* Tarjetas */
.semillero-card,
.campo-card,
.proyecto-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.semillero-card:hover,
.campo-card:hover,
.proyecto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.semillero-card img,
.campo-card img,
.proyecto-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.card-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.linea,
.semillero-badge {
  display: inline-block;
  background: var(--primary-color);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.estado-badge {
  display: inline-block;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

/* Barra de progreso */
.progreso {
  margin: 1rem 0;
}

.progreso-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.progreso-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progreso-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s;
}

/* Card Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.btn-ver-mas,
.btn-secondary {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s;
}

.btn-ver-mas:hover,
.btn-secondary:hover {
  color: var(--secondary-color);
}

/* Filtros */
.filtros {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.filtros button {
  padding: 0.5rem 1.5rem;
  border: 2px solid var(--primary-color);
  background: white;
  color: var(--primary-color);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.filtros button:hover,
.filtros button.active {
  background: var(--primary-color);
  color: white;
}

/* Loading */
.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
}

/* Footer */
.footer {
  background: var(--primary-color);
  color: white;
  padding: 3rem 5% 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3 {
  margin-bottom: 1rem;
  color: var(--secondary-color);
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  color: var(--primary-color);
  border-radius: 50%;
  transition: transform 0.3s;
}

.social-links a:hover {
  transform: scale(1.1);
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .semilleros-grid,
  .campos-grid,
  .proyectos-grid {
    grid-template-columns: 1fr;
  }
  
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
}
```

---

## 📁 Estructura de Archivos Sugerida

```
src/
├── components/
│   ├── landing/
│   │   ├── Navbar.jsx
│   │   ├── HeroSection.jsx
│   │   ├── SemillerosSection.jsx
│   │   ├── CamposSection.jsx
│   │   ├── ProyectosSection.jsx
│   │   └── Footer.jsx
│   └── common/
│       ├── Loading.jsx
│       └── ErrorBoundary.jsx
├── pages/
│   └── LandingPage.jsx
├── services/
│   └── api.js
├── styles/
│   ├── LandingPage.css
│   └── variables.css
├── App.jsx
└── main.jsx
```

---

## 🚀 Archivo Principal: `LandingPage.jsx`

```jsx
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { SemillerosSection } from '../components/landing/SemillerosSection';
import { CamposSection } from '../components/landing/CamposSection';
import { ProyectosSection } from '../components/landing/ProyectosSection';
import { Footer } from '../components/landing/Footer';
import '../styles/LandingPage.css';

export const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection />
      <SemillerosSection />
      <CamposSection />
      <ProyectosSection />
      <Footer />
    </div>
  );
};
```

---

## 🛠️ Service Layer: `api.js`

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Semilleros
  getSemillerosActivos: async () => {
    const response = await fetch(`${API_BASE_URL}/semilleros/activos`);
    return response.json();
  },

  getSemilleroById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/semilleros/${id}`);
    return response.json();
  },

  // Campos
  getCampos: async () => {
    const response = await fetch(`${API_BASE_URL}/campos`);
    return response.json();
  },

  getCampoById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/campos/${id}`);
    return response.json();
  },

  // Proyectos
  getProyectos: async (estado = null) => {
    const url = estado 
      ? `${API_BASE_URL}/projects?estado=${estado}`
      : `${API_BASE_URL}/projects`;
    const response = await fetch(url);
    return response.json();
  },

  getProyectoById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    return response.json();
  },
};
```

---

## ✅ Checklist de Implementación

### Fase 1: Setup (Día 1)
- [ ] Crear estructura de carpetas
- [ ] Instalar dependencias: `react-router-dom`, `axios` (opcional)
- [ ] Configurar variables de entorno (.env con API_BASE_URL)
- [ ] Verificar que backend esté corriendo

### Fase 2: Componentes Base (Día 1-2)
- [ ] Navbar con logo y botón login
- [ ] Hero Section con diseño atractivo
- [ ] Footer con información de contacto

### Fase 3: Consumo de APIs (Día 2-3)
- [ ] SemillerosSection con fetch y mapeo
- [ ] CamposSection con fetch y mapeo
- [ ] ProyectosSection con fetch, filtros y mapeo

### Fase 4: Estilos (Día 3-4)
- [ ] Diseño responsive (mobile-first)
- [ ] Tarjetas con hover effects
- [ ] Colores institucionales UCP
- [ ] Imágenes placeholder para casos de error

### Fase 5: Mejoras (Día 4-5)
- [ ] Loading states
- [ ] Error handling
- [ ] Animaciones suaves
- [ ] SEO básico (meta tags)
- [ ] Lazy loading de imágenes

---

## 🎯 Resultado Esperado

Al finalizar, deberías tener:

✅ Landing page completamente funcional
✅ Consumiendo 3 endpoints del backend
✅ Diseño responsive y atractivo
✅ Navegación fluida entre secciones
✅ Imágenes y datos reales del backend
✅ Botón "Iniciar Sesión" listo para siguiente fase

---

## 📞 Soporte

**Si encuentras problemas:**

1. **Backend no responde:** Verifica que esté corriendo con `npm start`
2. **CORS errors:** El backend ya tiene CORS configurado para localhost
3. **Imágenes no cargan:** Usa las rutas completas: `http://localhost:5000/uploads/...`
4. **Datos vacíos:** Verifica que la BD esté poblada con los scripts de seed

---

## 🚀 Siguiente Fase

Una vez terminada la Landing:
1. **Módulo de Login** → Autenticación por roles
2. **Dashboard por Rol** → Vistas personalizadas
3. **CRUD Administrativo** → Según permisos de cada rol

---

**¡Manos a la obra! 🎨💻**
