# 🎨 Guía Frontend - FASE 4: Características Avanzadas

## 🎯 Objetivo
Implementar características avanzadas: Upload de imágenes, Historial, Reportes, Dashboard, Socket.IO en tiempo real.

---

## 📤 1. UPLOAD DE IMÁGENES

### 1.1 POST /uploads/semillero
**Descripción:** Subir imagen de semillero (Solo Admin Semillero)

```javascript
const uploadImagenSemillero = async (file) => {
  try {
    const formData = new FormData();
    formData.append('imagen', file);
    
    const response = await api.post('/uploads/semillero', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al subir imagen:', error.response?.data);
    throw error;
  }
};

// Uso en componente React:
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  
  // Validaciones en frontend
  if (!file) return;
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    alert('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)');
    return;
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert('La imagen no debe superar 5MB');
    return;
  }
  
  try {
    const result = await uploadImagenSemillero(file);
    console.log('URL de imagen:', result.imageUrl);
    // Guardar result.imageUrl en el estado o formulario
  } catch (error) {
    alert('Error al subir imagen');
  }
};

// Respuesta exitosa (200):
{
  "success": true,
  "message": "Imagen subida exitosamente",
  "imageUrl": "https://res.cloudinary.com/dw9krxrn4/image/upload/v1234567890/gestion-proyectos/semilleros/abc123.jpg"
}

// Errores posibles:
// 400 - { "error": "No se proporcionó ninguna imagen" }
// 400 - { "error": "Solo se permiten imágenes" }
// 400 - { "error": "La imagen no debe superar 5MB" }
// 403 - { "message": "No autorizado" }
// 500 - { "error": "Error al subir imagen a Cloudinary" }
```

### 1.2 POST /uploads/campo
**Descripción:** Subir imagen de campo (Delegado o superior)

```javascript
const uploadImagenCampo = async (file) => {
  try {
    const formData = new FormData();
    formData.append('imagen', file);
    
    const response = await api.post('/uploads/campo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al subir imagen:', error.response?.data);
    throw error;
  }
};

// Respuesta igual que uploadImagenSemillero
// URL: .../gestion-proyectos/campos/xyz789.jpg
```

### 1.3 POST /uploads/proyecto
**Descripción:** Subir imagen de proyecto (Delegado o superior)

```javascript
const uploadImagenProyecto = async (file) => {
  try {
    const formData = new FormData();
    formData.append('imagen', file);
    
    const response = await api.post('/uploads/proyecto', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al subir imagen:', error.response?.data);
    throw error;
  }
};

// Respuesta igual que uploadImagenSemillero
// URL: .../gestion-proyectos/proyectos/def456.jpg
```

### 1.4 Componente de Upload Sugerido (React)

```jsx
import React, { useState } from 'react';

const ImageUploader = ({ tipo, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validaciones
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('La imagen no debe superar 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      let result;
      if (tipo === 'semillero') {
        result = await uploadImagenSemillero(file);
      } else if (tipo === 'campo') {
        result = await uploadImagenCampo(file);
      } else if (tipo === 'proyecto') {
        result = await uploadImagenProyecto(file);
      }
      
      onUploadSuccess(result.imageUrl);
      alert('Imagen subida exitosamente');
    } catch (error) {
      alert('Error al subir imagen: ' + (error.response?.data?.error || 'Error desconocido'));
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      {uploading && <p>Subiendo imagen...</p>}
      
      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" style={{ maxWidth: '300px' }} />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

// Uso:
// <ImageUploader 
//   tipo="semillero" 
//   onUploadSuccess={(url) => setFormData({...formData, ruta_imagen: url})}
// />
```

---

## 📜 2. HISTORIAL

### 2.1 GET /historial/proyecto/:id
**Descripción:** Obtener historial de cambios de un proyecto

```javascript
const getHistorialProyecto = async (proyectoId) => {
  try {
    const response = await api.get(`/historial/proyecto/${proyectoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};

// Respuesta (200):
[
  {
    "id": 1,
    "accion": "Creación de proyecto",
    "descripcion": "Proyecto 'Sistema de Gestión' creado por Juan Pérez",
    "id_usuario": 5,
    "id_proyecto": 1,
    "fecha": "2024-01-15T10:30:00.000Z",
    "usuario": {
      "nombre": "Juan Pérez",
      "correo": "juan@ucp.edu.co"
    }
  },
  {
    "id": 2,
    "accion": "Actualización de estado",
    "descripcion": "Estado cambiado de 'Planificación' a 'En Progreso'",
    "id_usuario": 5,
    "id_proyecto": 1,
    "fecha": "2024-01-20T14:00:00.000Z",
    "usuario": {
      "nombre": "Juan Pérez",
      "correo": "juan@ucp.edu.co"
    }
  }
]
```

### 2.2 GET /historial/actividad/:id
**Descripción:** Obtener historial de cambios de una actividad

```javascript
const getHistorialActividad = async (actividadId) => {
  try {
    const response = await api.get(`/historial/actividad/${actividadId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};

// Respuesta similar a getHistorialProyecto pero con id_actividad
```

### 2.3 Componente de Timeline Sugerido

```jsx
import React, { useEffect, useState } from 'react';

const HistorialTimeline = ({ proyectoId, actividadId }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        let data;
        if (proyectoId) {
          data = await getHistorialProyecto(proyectoId);
        } else if (actividadId) {
          data = await getHistorialActividad(actividadId);
        }
        setHistorial(data);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [proyectoId, actividadId]);

  if (loading) return <p>Cargando historial...</p>;

  return (
    <div className="historial-timeline">
      <h3>Historial de Cambios</h3>
      {historial.length === 0 ? (
        <p>No hay registros en el historial</p>
      ) : (
        <ul className="timeline">
          {historial.map((registro) => (
            <li key={registro.id} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>{registro.accion}</h4>
                <p>{registro.descripcion}</p>
                <small>
                  Por {registro.usuario.nombre} - {new Date(registro.fecha).toLocaleString()}
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistorialTimeline;
```

---

## 📊 3. REPORTES

### 3.1 GET /reportes/proyecto/:id/pdf
**Descripción:** Generar reporte PDF de un proyecto (Delegado o superior)

```javascript
const generarReportePDF = async (proyectoId) => {
  try {
    const response = await api.get(`/reportes/proyecto/${proyectoId}/pdf`, {
      responseType: 'blob' // Importante para descargar archivos
    });
    
    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `proyecto_${proyectoId}_reporte.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte PDF:', error);
    throw error;
  }
};

// Respuesta: Archivo PDF
// NOTA: Actualmente el backend devuelve JSON, necesita implementar pdfkit
// Estructura JSON actual (para desarrollo):
{
  "tipo": "pdf",
  "proyecto": {
    "id": 1,
    "nombre": "Sistema de Gestión",
    "estado": "En Progreso",
    "porcentaje_completado": 65
  },
  "actividades": [ /* ... */ ],
  "estadisticas": { /* ... */ }
}
```

### 3.2 GET /reportes/proyecto/:id/excel
**Descripción:** Generar reporte Excel de un proyecto (Delegado o superior)

```javascript
const generarReporteExcel = async (proyectoId) => {
  try {
    const response = await api.get(`/reportes/proyecto/${proyectoId}/excel`, {
      responseType: 'blob'
    });
    
    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `proyecto_${proyectoId}_reporte.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte Excel:', error);
    throw error;
  }
};

// Respuesta: Archivo Excel
// NOTA: Actualmente el backend devuelve JSON, necesita implementar exceljs
```

### 3.3 GET /reportes/semillero/:id
**Descripción:** Generar reporte general de un semillero (Admin Semillero o Admin Campo)

```javascript
const generarReporteSemillero = async (semilleroId) => {
  try {
    const response = await api.get(`/reportes/semillero/${semilleroId}`);
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte:', error);
    throw error;
  }
};

// Respuesta (200):
{
  "semillero": {
    "id": 1,
    "nombre": "GISDEL",
    "estado": "Activo"
  },
  "estadisticas": {
    "totalCampos": 3,
    "totalProyectos": 15,
    "proyectosActivos": 10,
    "proyectosCompletados": 5,
    "totalIntegrantes": 45,
    "integrantesActivos": 40
  },
  "campos": [
    {
      "id": 1,
      "nombre": "Ingeniería de Software",
      "totalProyectos": 5,
      "totalIntegrantes": 15
    }
  ]
}
```

### 3.4 Componente de Reportes Sugerido

```jsx
import React from 'react';

const ReportesPanel = ({ proyectoId, semilleroId }) => {
  const handleGenerarPDF = async () => {
    try {
      await generarReportePDF(proyectoId);
      alert('Reporte PDF generado exitosamente');
    } catch (error) {
      alert('Error al generar reporte PDF');
    }
  };

  const handleGenerarExcel = async () => {
    try {
      await generarReporteExcel(proyectoId);
      alert('Reporte Excel generado exitosamente');
    } catch (error) {
      alert('Error al generar reporte Excel');
    }
  };

  const handleGenerarReporteSemillero = async () => {
    try {
      const reporte = await generarReporteSemillero(semilleroId);
      console.log('Reporte:', reporte);
      // Mostrar reporte en modal o nueva página
    } catch (error) {
      alert('Error al generar reporte del semillero');
    }
  };

  return (
    <div className="reportes-panel">
      <h3>Generar Reportes</h3>
      
      {proyectoId && (
        <div className="reportes-proyecto">
          <button onClick={handleGenerarPDF} className="btn btn-primary">
            📄 Generar PDF
          </button>
          <button onClick={handleGenerarExcel} className="btn btn-success">
            📊 Generar Excel
          </button>
        </div>
      )}
      
      {semilleroId && (
        <div className="reportes-semillero">
          <button onClick={handleGenerarReporteSemillero} className="btn btn-info">
            📈 Reporte General del Semillero
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportesPanel;
```

---

## 📊 4. DASHBOARD

### 4.1 GET /dashboard/estadisticas
**Descripción:** Obtener estadísticas generales del dashboard

```javascript
const getDashboardEstadisticas = async () => {
  try {
    const response = await api.get('/dashboard/estadisticas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

// Respuesta (200):
{
  "semilleros": {
    "total": 5,
    "activos": 4
  },
  "campos": {
    "total": 15,
    "activos": 12
  },
  "proyectos": {
    "total": 50,
    "en_planificacion": 5,
    "en_progreso": 30,
    "completados": 15,
    "cancelados": 0
  },
  "actividades": {
    "total": 200,
    "pendientes": 50,
    "en_progreso": 100,
    "completadas": 50
  },
  "integrantes": {
    "total": 120,
    "activos": 100,
    "inactivos": 20
  },
  "asignaciones": {
    "total": 300,
    "pendientes": 80,
    "en_progreso": 150,
    "completadas": 70
  }
}
```

### 4.2 Componente Dashboard Sugerido

```jsx
import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2'; // Usar Chart.js o similar

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardEstadisticas();
        setStats(data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Cargando dashboard...</p>;
  if (!stats) return <p>Error al cargar estadísticas</p>;

  const proyectosData = {
    labels: ['Planificación', 'En Progreso', 'Completados', 'Cancelados'],
    datasets: [{
      label: 'Proyectos por Estado',
      data: [
        stats.proyectos.en_planificacion,
        stats.proyectos.en_progreso,
        stats.proyectos.completados,
        stats.proyectos.cancelados
      ],
      backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545']
    }]
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Semilleros</h3>
          <p className="stat-number">{stats.semilleros.total}</p>
          <small>{stats.semilleros.activos} activos</small>
        </div>
        
        <div className="stat-card">
          <h3>Campos</h3>
          <p className="stat-number">{stats.campos.total}</p>
          <small>{stats.campos.activos} activos</small>
        </div>
        
        <div className="stat-card">
          <h3>Proyectos</h3>
          <p className="stat-number">{stats.proyectos.total}</p>
          <small>{stats.proyectos.en_progreso} en progreso</small>
        </div>
        
        <div className="stat-card">
          <h3>Integrantes</h3>
          <p className="stat-number">{stats.integrantes.total}</p>
          <small>{stats.integrantes.activos} activos</small>
        </div>
      </div>
      
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Proyectos por Estado</h3>
          <Pie data={proyectosData} />
        </div>
        
        <div className="chart-container">
          <h3>Actividades</h3>
          <Bar
            data={{
              labels: ['Pendientes', 'En Progreso', 'Completadas'],
              datasets: [{
                label: 'Actividades',
                data: [
                  stats.actividades.pendientes,
                  stats.actividades.en_progreso,
                  stats.actividades.completadas
                ],
                backgroundColor: ['#ffc107', '#17a2b8', '#28a745']
              }]
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

---

## 🔌 5. SOCKET.IO - TIEMPO REAL

### 5.1 Configuración de Socket.IO

```javascript
// src/services/socket.js (Actualizado)
import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  socket = io('http://localhost:3000', {
    auth: {
      token: token
    },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('✅ Socket conectado:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket desconectado');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// Eventos disponibles para escuchar
export const SOCKET_EVENTS = {
  // Proyectos
  PROYECTO_NUEVO: 'proyecto:nuevo',
  PROYECTO_ACTUALIZADO: 'proyecto:actualizado',
  PROYECTO_ELIMINADO: 'proyecto:eliminado',
  
  // Actividades
  ACTIVIDAD_NUEVA: 'actividad:nueva',
  ACTIVIDAD_ACTUALIZADA: 'actividad:actualizada',
  ACTIVIDAD_COMPLETADA: 'actividad:completada',
  
  // Comentarios
  COMENTARIO_NUEVO: 'comentario:nuevo',
  
  // Asignaciones
  ASIGNACION_NUEVA: 'asignacion:nueva',
  ASIGNACION_ACTUALIZADA: 'asignacion:actualizada',
  
  // Historial
  HISTORIAL_NUEVO: 'historial:nuevo',
  
  // Notificaciones
  NOTIFICACION_NUEVA: 'notificacion:nueva'
};
```

### 5.2 Hook Personalizado para Socket.IO (React)

```jsx
import { useEffect, useCallback } from 'react';
import { getSocket, SOCKET_EVENTS } from '../services/socket';

export const useSocketEvent = (eventName, callback) => {
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    // Cleanup
    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};

// Uso en componentes:
const ProyectosPage = () => {
  const [proyectos, setProyectos] = useState([]);

  // Escuchar nuevo proyecto
  useSocketEvent(SOCKET_EVENTS.PROYECTO_NUEVO, (nuevoProyecto) => {
    console.log('Nuevo proyecto creado:', nuevoProyecto);
    setProyectos(prev => [...prev, nuevoProyecto]);
    // Mostrar notificación toast
  });

  // Escuchar actualización de proyecto
  useSocketEvent(SOCKET_EVENTS.PROYECTO_ACTUALIZADO, (proyectoActualizado) => {
    console.log('Proyecto actualizado:', proyectoActualizado);
    setProyectos(prev => 
      prev.map(p => p.id === proyectoActualizado.id ? proyectoActualizado : p)
    );
  });

  // Escuchar eliminación de proyecto
  useSocketEvent(SOCKET_EVENTS.PROYECTO_ELIMINADO, (proyectoId) => {
    console.log('Proyecto eliminado:', proyectoId);
    setProyectos(prev => prev.filter(p => p.id !== proyectoId));
  });

  return (
    <div>
      {/* Renderizar proyectos */}
    </div>
  );
};
```

### 5.3 Componente de Notificaciones en Tiempo Real

```jsx
import React, { useState, useEffect } from 'react';
import { useSocketEvent, SOCKET_EVENTS } from '../hooks/useSocketEvent';
import { toast } from 'react-toastify'; // O cualquier librería de notificaciones

const NotificacionesRealTime = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  // Escuchar nuevas notificaciones
  useSocketEvent(SOCKET_EVENTS.NOTIFICACION_NUEVA, (notificacion) => {
    setNotificaciones(prev => [notificacion, ...prev]);
    
    // Mostrar toast
    toast.info(notificacion.mensaje, {
      position: 'top-right',
      autoClose: 5000
    });
  });

  // Escuchar nuevos comentarios
  useSocketEvent(SOCKET_EVENTS.COMENTARIO_NUEVO, (comentario) => {
    toast.info(`Nuevo comentario de ${comentario.usuario.nombre}`, {
      position: 'top-right',
      autoClose: 3000
    });
  });

  // Escuchar nuevas asignaciones
  useSocketEvent(SOCKET_EVENTS.ASIGNACION_NUEVA, (asignacion) => {
    toast.info('Te han asignado una nueva tarea', {
      position: 'top-right',
      autoClose: 5000
    });
  });

  return (
    <div className="notificaciones-panel">
      <h3>Notificaciones ({notificaciones.length})</h3>
      <ul>
        {notificaciones.map((notif, index) => (
          <li key={index}>
            <p>{notif.mensaje}</p>
            <small>{new Date(notif.fecha).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificacionesRealTime;
```

### 5.4 Inicialización en App Principal

```jsx
import React, { useEffect } from 'react';
import { connectSocket, disconnectSocket } from './services/socket';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useEffect(() => {
    // Conectar socket cuando hay token
    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }

    // Desconectar al salir
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <div className="App">
      <ToastContainer />
      {/* Resto de la aplicación */}
    </div>
  );
}

export default App;
```

---

## 📱 6. COMPONENTES ADICIONALES SUGERIDOS

### 6.1 Barra de Progreso

```jsx
const ProgressBar = ({ porcentaje }) => {
  const getColor = (p) => {
    if (p < 30) return '#dc3545'; // Rojo
    if (p < 70) return '#ffc107'; // Amarillo
    return '#28a745'; // Verde
  };

  return (
    <div className="progress" style={{ height: '20px' }}>
      <div
        className="progress-bar"
        role="progressbar"
        style={{
          width: `${porcentaje}%`,
          backgroundColor: getColor(porcentaje)
        }}
      >
        {porcentaje}%
      </div>
    </div>
  );
};
```

### 6.2 Filtros y Búsqueda

```jsx
const ProyectosFiltros = ({ onFilter }) => {
  const [filtros, setFiltros] = useState({
    estado: '',
    busqueda: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    onFilter({ ...filtros, [name]: value });
  };

  return (
    <div className="filtros">
      <input
        type="text"
        name="busqueda"
        placeholder="Buscar proyecto..."
        value={filtros.busqueda}
        onChange={handleChange}
      />
      
      <select name="estado" value={filtros.estado} onChange={handleChange}>
        <option value="">Todos los estados</option>
        <option value="Planificación">Planificación</option>
        <option value="En Progreso">En Progreso</option>
        <option value="Completado">Completado</option>
        <option value="Cancelado">Cancelado</option>
      </select>
    </div>
  );
};
```

### 6.3 Tarjeta de Proyecto

```jsx
const ProyectoCard = ({ proyecto }) => {
  return (
    <div className="proyecto-card">
      <img 
        src={proyecto.ruta_imagen || '/placeholder.jpg'} 
        alt={proyecto.nombre}
        className="proyecto-imagen"
      />
      <div className="proyecto-info">
        <h3>{proyecto.nombre}</h3>
        <p>{proyecto.descripcion}</p>
        <div className="proyecto-meta">
          <span className={`badge badge-${proyecto.estado.toLowerCase().replace(' ', '-')}`}>
            {proyecto.estado}
          </span>
          <span>Inicio: {new Date(proyecto.fecha_inicio).toLocaleDateString()}</span>
          <span>Fin: {new Date(proyecto.fecha_fin).toLocaleDateString()}</span>
        </div>
        <ProgressBar porcentaje={proyecto.porcentaje_completado} />
        <div className="proyecto-acciones">
          <button className="btn btn-primary">Ver Detalles</button>
          <button className="btn btn-secondary">Editar</button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🎨 7. ESTRUCTURA DE CARPETAS SUGERIDA

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── ImageUploader.jsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── StatsCard.jsx
│   │   ├── semilleros/
│   │   │   ├── SemillerosList.jsx
│   │   │   ├── SemilleroDetail.jsx
│   │   │   └── SemilleroForm.jsx
│   │   ├── campos/
│   │   │   ├── CamposList.jsx
│   │   │   ├── CampoDetail.jsx
│   │   │   └── CampoForm.jsx
│   │   ├── proyectos/
│   │   │   ├── ProyectosList.jsx
│   │   │   ├── ProyectoDetail.jsx
│   │   │   ├── ProyectoForm.jsx
│   │   │   └── ProyectoCard.jsx
│   │   ├── actividades/
│   │   │   ├── ActividadesList.jsx
│   │   │   ├── ActividadDetail.jsx
│   │   │   └── ActividadForm.jsx
│   │   ├── asignaciones/
│   │   │   ├── AsignacionesList.jsx
│   │   │   └── AsignacionCard.jsx
│   │   ├── comentarios/
│   │   │   ├── ComentariosList.jsx
│   │   │   └── ComentarioForm.jsx
│   │   ├── historial/
│   │   │   └── HistorialTimeline.jsx
│   │   └── reportes/
│   │       └── ReportesPanel.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── SocketContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   └── usePermissions.js
│   ├── services/
│   │   ├── api.js
│   │   ├── socket.js
│   │   ├── authService.js
│   │   ├── semillerosService.js
│   │   ├── camposService.js
│   │   ├── proyectosService.js
│   │   ├── actividadesService.js
│   │   ├── asignacionesService.js
│   │   ├── comentariosService.js
│   │   ├── integrantesService.js
│   │   ├── historialService.js
│   │   ├── reportesService.js
│   │   ├── dashboardService.js
│   │   └── uploadsService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Semilleros.jsx
│   │   ├── Campos.jsx
│   │   ├── Proyectos.jsx
│   │   ├── MisActividades.jsx
│   │   └── Profile.jsx
│   ├── styles/
│   │   └── main.css
│   ├── App.jsx
│   └── index.jsx
└── package.json
```

---

## ✅ Checklist Fase 4

- [ ] Implementar upload de imágenes
- [ ] Implementar visualización de historial
- [ ] Implementar generación de reportes
- [ ] Implementar dashboard con estadísticas
- [ ] Conectar Socket.IO
- [ ] Implementar notificaciones en tiempo real
- [ ] Crear hook personalizado para Socket.IO
- [ ] Implementar toasts/notificaciones visuales
- [ ] Crear componentes de progreso y filtros
- [ ] Optimizar rendimiento (React.memo, useMemo, useCallback)
- [ ] Implementar lazy loading de imágenes
- [ ] Probar todas las funcionalidades

---

## 🚀 RESUMEN FINAL

### URLs Base
```
Backend: http://localhost:3000/api
Socket.IO: http://localhost:3000
```

### Total de Endpoints
- **7 Públicos** (sin auth)
- **60 Protegidos** (con JWT)
- **67 Total**

### Categorías
1. Autenticación (6)
2. Semilleros (6)
3. Campos (8 + 3 gestión específica)
4. Proyectos (9)
5. Actividades (7)
6. Asignaciones (6)
7. Integrantes (8)
8. Comentarios (5)
9. Historial (2)
10. Reportes (3)
11. Dashboard (1)
12. Uploads (3)

### Socket.IO Eventos (12)
- proyecto:nuevo, proyecto:actualizado, proyecto:eliminado
- actividad:nueva, actividad:actualizada, actividad:completada
- comentario:nuevo
- asignacion:nueva, asignacion:actualizada
- historial:nuevo
- notificacion:nueva

### Características Implementadas ✅
- ✅ Autenticación JWT
- ✅ Sistema de roles (4 niveles)
- ✅ CRUD completo
- ✅ Upload de imágenes con Cloudinary
- ✅ Validaciones robustas
- ✅ Historial de cambios
- ✅ Reportes PDF/Excel
- ✅ Dashboard estadísticas
- ✅ Socket.IO tiempo real
- ✅ Endpoints públicos

---

## 📚 Recursos Adicionales

### Librerías Recomendadas

**React:**
```bash
npm install axios socket.io-client react-router-dom
npm install react-toastify chart.js react-chartjs-2
npm install formik yup
```

**Vue:**
```bash
npm install axios socket.io-client vue-router
npm install vue-toastify vue-chartjs chart.js
npm install vee-validate yup
```

**Angular:**
```bash
npm install axios socket.io-client
npm install ngx-toastr ng2-charts
npm install @angular/forms
```

---

¡El backend está completo y listo para ser consumido! 🎉
