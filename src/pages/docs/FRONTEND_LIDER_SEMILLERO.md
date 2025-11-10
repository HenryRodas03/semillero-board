# 📚 Documentación API - Sistema Completo para Líder de Semillero

## 📋 Información General

Esta documentación describe todos los endpoints disponibles para el **Líder de Semillero** (rol 1). El líder puede gestionar su propio semillero, sus campos de investigación, y realizar operaciones administrativas.

**Base URL:** `http://localhost:3000/api`

---

## 🎯 Roles y Permisos

### Jerarquía de Roles
```
1. Admin Semillero (Líder de Semillero) - Rol ID: 1
   ├── Puede gestionar su propio semillero
   ├── Puede crear, editar y cerrar campos de investigación
   └── Puede abrir/cerrar su semillero

2. Admin Campo (Líder de Campo) - Rol ID: 2
   └── Puede gestionar solo su campo

3. Delegado - Rol ID: 3
4. Colaborador - Rol ID: 4
```

### ⚠️ Autenticación Requerida
Todos los endpoints requieren **token JWT** en el header:
```
Authorization: Bearer <token>
```

---

## 📌 Índice de Endpoints

### 🏢 Gestión de Mi Semillero
1. [GET /api/semilleros/mi-semillero/info](#1-obtener-mi-semillero)
2. [PUT /api/semilleros/mi-semillero/actualizar](#2-actualizar-mi-semillero)
3. [DELETE /api/semilleros/mi-semillero/imagen](#3-eliminar-imagen-del-semillero)
4. [PATCH /api/semilleros/mi-semillero/estado](#4-abrircerrar-mi-semillero)

### 📚 Gestión de Campos de Investigación
5. [GET /api/semilleros/mi-semillero/campos](#5-obtener-campos-de-mi-semillero)
6. [POST /api/campos](#6-crear-nuevo-campo)
7. [PATCH /api/campos/:id/estado](#7-abrircerrar-campo)

---

## 🏢 GESTIÓN DE MI SEMILLERO

### 1. Obtener Mi Semillero

Obtiene la información completa del semillero que lidera el usuario autenticado.

#### **Endpoint**
```
GET /api/semilleros/mi-semillero/info
```

#### **Headers**
```
Authorization: Bearer <token>
```

#### **Respuesta Exitosa (200)**
```json
{
  "semillero": {
    "id": 1,
    "nombre": "Semillero TechLab",
    "lider": 2,
    "ruta_imagen": "https://res.cloudinary.com/dw9krxrn4/image/upload/.../semillero.jpg",
    "descripcion": "Semillero enfocado en el desarrollo de software moderno",
    "contacto": "techlab@ucp.edu.co",
    "creado_en": "2024-01-15T15:00:00.000Z",
    "lineas_investigacion_id": 1,
    "activo": 1,
    "linea": {
      "id": 1,
      "nombre": "Desarrollo de Software"
    },
    "liderUsuario": {
      "id": 2,
      "nombre": "María García",
      "correo": "maria.garcia@ucp.edu.co"
    }
  }
}
```

#### **Respuestas de Error**

**404 - No Tiene Semillero Asignado**
```json
{
  "message": "No tienes un semillero asignado. Contacta al administrador."
}
```

**401 - No Autenticado**
```json
{
  "message": "Usuario no autenticado"
}
```

**403 - Sin Permisos**
```json
{
  "message": "No tienes permisos para acceder a este recurso"
}
```

#### **Ejemplo de Uso (React)**
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function MiSemillero() {
  const [semillero, setSemillero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMiSemillero = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:3000/api/semilleros/mi-semillero/info',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setSemillero(response.data.semillero);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar semillero');
      } finally {
        setLoading(false);
      }
    };

    fetchMiSemillero();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!semillero) return <div>No tienes semillero asignado</div>;

  return (
    <div className="mi-semillero">
      <div className="semillero-header">
        {semillero.ruta_imagen && (
          <img src={semillero.ruta_imagen} alt={semillero.nombre} />
        )}
        <h1>{semillero.nombre}</h1>
        <span className={`estado-badge ${semillero.activo ? 'activo' : 'cerrado'}`}>
          {semillero.activo ? '🟢 Abierto' : '🔴 Cerrado'}
        </span>
      </div>
      
      <div className="semillero-info">
        <p><strong>Descripción:</strong> {semillero.descripcion}</p>
        <p><strong>Contacto:</strong> {semillero.contacto}</p>
        <p><strong>Línea de Investigación:</strong> {semillero.linea.nombre}</p>
        <p><strong>Creado:</strong> {new Date(semillero.creado_en).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
```

---

### 2. Actualizar Mi Semillero

Permite al líder actualizar la información de su semillero, incluyendo la imagen.

#### **Endpoint**
```
PUT /api/semilleros/mi-semillero/actualizar
```

#### **Headers**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### **Campos del Body (FormData)**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | No | Nombre del semillero |
| descripcion | string | No | Descripción del semillero |
| contacto | string (email) | No | Email de contacto |
| imagen | File | No | Archivo de imagen (JPG/PNG/WebP, max 5MB) |

#### **Ejemplo de Petición**
```javascript
const formData = new FormData();
formData.append('nombre', 'Semillero TechLab Actualizado');
formData.append('descripcion', 'Nueva descripción del semillero');
formData.append('contacto', 'nuevo.email@ucp.edu.co');

// Agregar imagen si el usuario seleccionó una
if (selectedFile) {
  formData.append('imagen', selectedFile);
}

const token = localStorage.getItem('token');
const response = await axios.put(
  'http://localhost:3000/api/semilleros/mi-semillero/actualizar',
  formData,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }
);
```

#### **Respuesta Exitosa (200)**
```json
{
  "message": "Semillero actualizado exitosamente",
  "semillero": {
    "id": 1,
    "nombre": "Semillero TechLab Actualizado",
    "descripcion": "Nueva descripción del semillero",
    "contacto": "nuevo.email@ucp.edu.co",
    "ruta_imagen": "https://res.cloudinary.com/.../nueva-imagen.jpg",
    "activo": 1
  }
}
```

#### **Respuestas de Error**

**400 - Email Inválido**
```json
{
  "message": "El email de contacto no es válido"
}
```

**400 - Sin Campos para Actualizar**
```json
{
  "message": "No se proporcionaron campos para actualizar"
}
```

**404 - Sin Semillero**
```json
{
  "message": "No tienes un semillero asignado"
}
```

**500 - Error al Subir Imagen**
```json
{
  "message": "Error al subir la imagen"
}
```

#### **Componente React Completo**
```jsx
import { useState } from 'react';
import axios from 'axios';

function EditarSemillero({ semillero, onUpdate }) {
  const [formData, setFormData] = useState({
    nombre: semillero.nombre,
    descripcion: semillero.descripcion,
    contacto: semillero.contacto || ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(semillero.ruta_imagen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }

      // Validar tipo
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Solo se permiten imágenes JPG, PNG o WebP');
        return;
      }

      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('descripcion', formData.descripcion);
      data.append('contacto', formData.contacto);

      if (selectedFile) {
        data.append('imagen', selectedFile);
      }

      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:3000/api/semilleros/mi-semillero/actualizar',
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess(true);
      onUpdate(response.data.semillero);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar semillero');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="editar-semillero-form">
      <h2>✏️ Editar Mi Semillero</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">✅ Semillero actualizado exitosamente</div>}

      <div className="form-group">
        <label htmlFor="nombre">Nombre del Semillero</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="form-control"
          rows="5"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="contacto">Email de Contacto</label>
        <input
          type="email"
          id="contacto"
          name="contacto"
          value={formData.contacto}
          onChange={handleChange}
          className="form-control"
          placeholder="contacto@ucp.edu.co"
        />
      </div>

      <div className="form-group">
        <label htmlFor="imagen">Imagen del Semillero</label>
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}
        <input
          type="file"
          id="imagen"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="form-control-file"
        />
        <small className="form-text">
          Formatos: JPG, PNG, WebP. Tamaño máximo: 5MB
        </small>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Actualizando...' : '💾 Guardar Cambios'}
      </button>
    </form>
  );
}
```

---

### 3. Eliminar Imagen del Semillero

Elimina la imagen del semillero (tanto de Cloudinary como de la base de datos).

#### **Endpoint**
```
DELETE /api/semilleros/mi-semillero/imagen
```

#### **Headers**
```
Authorization: Bearer <token>
```

#### **Respuesta Exitosa (200)**
```json
{
  "message": "Imagen eliminada exitosamente"
}
```

#### **Respuestas de Error**

**404 - Sin Imagen**
```json
{
  "message": "El semillero no tiene imagen"
}
```

**404 - Sin Semillero**
```json
{
  "message": "No tienes un semillero asignado"
}
```

#### **Ejemplo de Uso**
```jsx
async function eliminarImagen() {
  if (!confirm('¿Estás seguro de eliminar la imagen del semillero?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await axios.delete(
      'http://localhost:3000/api/semilleros/mi-semillero/imagen',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    alert('✅ Imagen eliminada exitosamente');
    // Recargar datos del semillero
    fetchMiSemillero();
  } catch (err) {
    alert(`❌ ${err.response?.data?.message || 'Error al eliminar imagen'}`);
  }
}
```

---

### 4. Abrir/Cerrar Mi Semillero

Permite al líder activar (abrir) o desactivar (cerrar) su semillero.

#### **Endpoint**
```
PATCH /api/semilleros/mi-semillero/estado
```

#### **Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Body**
```json
{
  "activo": 1  // 1 = abierto, 0 = cerrado
}
```

#### **Respuesta Exitosa (200)**
```json
{
  "message": "Semillero abierto exitosamente",
  "activo": 1
}
```

O si se cierra:
```json
{
  "message": "Semillero cerrado exitosamente",
  "activo": 0
}
```

#### **Respuestas de Error**

**400 - Valor Inválido**
```json
{
  "message": "El campo 'activo' debe ser 0 (cerrado) o 1 (abierto)"
}
```

**404 - Sin Semillero**
```json
{
  "message": "No tienes un semillero asignado"
}
```

#### **Ejemplo de Uso**
```jsx
function ToggleSemilleroEstado({ semillero, onToggle }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const nuevoEstado = semillero.activo === 1 ? 0 : 1;
    const accion = nuevoEstado === 1 ? 'abrir' : 'cerrar';

    if (!confirm(`¿Estás seguro de ${accion} el semillero?`)) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:3000/api/semilleros/mi-semillero/estado',
        { activo: nuevoEstado },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert(`✅ ${response.data.message}`);
      onToggle(nuevoEstado);
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Error al cambiar estado'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`btn ${semillero.activo ? 'btn-warning' : 'btn-success'}`}
      disabled={loading}
    >
      {loading ? 'Procesando...' : semillero.activo ? '🔒 Cerrar Semillero' : '🔓 Abrir Semillero'}
    </button>
  );
}
```

---

## 📚 GESTIÓN DE CAMPOS DE INVESTIGACIÓN

### 5. Obtener Campos de Mi Semillero

Obtiene todos los campos de investigación que pertenecen al semillero del líder.

#### **Endpoint**
```
GET /api/semilleros/mi-semillero/campos
```

#### **Headers**
```
Authorization: Bearer <token>
```

#### **Respuesta Exitosa (200)**
```json
{
  "campos": [
    {
      "id": 1,
      "nombre": "Desarrollo Web Full Stack",
      "lider": 21,
      "descripcion": "Campo enfocado en desarrollo web moderno",
      "ruta_imagen": "https://res.cloudinary.com/.../campo.jpg",
      "id_semillero": 1,
      "activo": 1,
      "liderUsuario": {
        "id": 21,
        "nombre": "Carlos Rodríguez",
        "correo": "carlos.rodriguez@ucp.edu.co"
      }
    },
    {
      "id": 2,
      "nombre": "Machine Learning",
      "lider": 22,
      "descripcion": "Investigación en inteligencia artificial",
      "ruta_imagen": null,
      "id_semillero": 1,
      "activo": 0,
      "liderUsuario": {
        "id": 22,
        "nombre": "Ana Martínez",
        "correo": "ana.martinez@ucp.edu.co"
      }
    }
  ],
  "total": 2
}
```

#### **Respuestas de Error**

**404 - Sin Semillero**
```json
{
  "message": "No tienes un semillero asignado"
}
```

#### **Ejemplo de Uso (React)**
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function MisCampos() {
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:3000/api/semilleros/mi-semillero/campos',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setCampos(response.data.campos);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar campos');
      } finally {
        setLoading(false);
      }
    };

    fetchCampos();
  }, []);

  if (loading) return <div>Cargando campos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="mis-campos">
      <h2>📚 Campos de Investigación ({campos.length})</h2>
      
      {campos.length === 0 ? (
        <div className="empty-state">
          <p>No tienes campos de investigación aún.</p>
          <button className="btn btn-primary">
            ➕ Crear Primer Campo
          </button>
        </div>
      ) : (
        <div className="campos-grid">
          {campos.map(campo => (
            <div key={campo.id} className="campo-card">
              {campo.ruta_imagen && (
                <img src={campo.ruta_imagen} alt={campo.nombre} />
              )}
              <div className="campo-content">
                <h3>{campo.nombre}</h3>
                <p className="campo-descripcion">{campo.descripcion}</p>
                
                <div className="campo-meta">
                  <span className={`estado-badge ${campo.activo ? 'activo' : 'cerrado'}`}>
                    {campo.activo ? '🟢 Abierto' : '🔴 Cerrado'}
                  </span>
                  <p className="campo-lider">
                    👤 {campo.liderUsuario.nombre}
                  </p>
                </div>

                <div className="campo-actions">
                  <button className="btn btn-sm btn-primary">
                    Ver Detalles
                  </button>
                  <button className="btn btn-sm btn-warning">
                    {campo.activo ? '🔒 Cerrar' : '🔓 Abrir'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 6. Crear Nuevo Campo

Permite al líder de semillero crear un nuevo campo de investigación.

#### **Endpoint**
```
POST /api/campos
```

#### **Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Body**
```json
{
  "nombre": "Desarrollo Móvil",
  "lider": 23,
  "descripcion": "Campo enfocado en desarrollo de aplicaciones móviles nativas y multiplataforma",
  "ruta_imagen": "https://res.cloudinary.com/.../campo-movil.jpg",
  "id_semillero": 1,
  "horario_reunion": "Martes 2:00 PM - 4:00 PM",
  "contacto_email": "movil@ucp.edu.co",
  "contacto_redes_sociales": {
    "facebook": "https://facebook.com/...",
    "instagram": "https://instagram.com/...",
    "linkedin": "https://linkedin.com/..."
  }
}
```

#### **Campos del Body**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | ✅ Sí | Nombre del campo |
| lider | number | ✅ Sí | ID del usuario líder del campo |
| descripcion | string | ✅ Sí | Descripción del campo |
| id_semillero | number | ✅ Sí | ID del semillero (debe ser el del líder) |
| ruta_imagen | string | No | URL de la imagen del campo |
| horario_reunion | string | No | Horario de reuniones |
| contacto_email | string (email) | No | Email de contacto |
| contacto_redes_sociales | object | No | URLs de redes sociales |

#### **Respuesta Exitosa (201)**
```json
{
  "message": "Campo de investigación creado",
  "campo": {
    "id": 3,
    "nombre": "Desarrollo Móvil",
    "lider": 23,
    "descripcion": "Campo enfocado en desarrollo de aplicaciones móviles",
    "ruta_imagen": "https://res.cloudinary.com/.../campo-movil.jpg",
    "id_semillero": 1,
    "activo": 1,
    "horario_reunion": "Martes 2:00 PM - 4:00 PM",
    "contacto_email": "movil@ucp.edu.co"
  }
}
```

#### **Respuestas de Error**

**400 - Faltan Campos**
```json
{
  "message": "Faltan campos requeridos"
}
```

**400 - Email Inválido**
```json
{
  "message": "Email de contacto no válido"
}
```

**400 - Redes Sociales Inválidas**
```json
{
  "message": "Redes sociales no válidas",
  "errors": ["URL de Facebook inválida"]
}
```

#### **Ejemplo de Uso (React)**
```jsx
import { useState } from 'react';
import axios from 'axios';

function CrearCampo({ idSemillero, onCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    lider: '',
    descripcion: '',
    horario_reunion: '',
    contacto_email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/campos',
        {
          ...formData,
          lider: parseInt(formData.lider),
          id_semillero: idSemillero
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('✅ Campo creado exitosamente');
      onCreated(response.data.campo);
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        lider: '',
        descripcion: '',
        horario_reunion: '',
        contacto_email: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear campo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="crear-campo-form">
      <h2>➕ Crear Nuevo Campo de Investigación</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="nombre">Nombre del Campo *</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="lider">ID del Líder del Campo *</label>
        <input
          type="number"
          id="lider"
          name="lider"
          value={formData.lider}
          onChange={handleChange}
          className="form-control"
          required
        />
        <small className="form-text">
          El ID del usuario que liderará este campo
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción *</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="form-control"
          rows="5"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="horario_reunion">Horario de Reunión</label>
        <input
          type="text"
          id="horario_reunion"
          name="horario_reunion"
          value={formData.horario_reunion}
          onChange={handleChange}
          className="form-control"
          placeholder="Ej: Viernes 3:00 PM - 5:00 PM"
        />
      </div>

      <div className="form-group">
        <label htmlFor="contacto_email">Email de Contacto</label>
        <input
          type="email"
          id="contacto_email"
          name="contacto_email"
          value={formData.contacto_email}
          onChange={handleChange}
          className="form-control"
          placeholder="contacto@ucp.edu.co"
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Creando...' : '✅ Crear Campo'}
      </button>
    </form>
  );
}
```

---

### 7. Abrir/Cerrar Campo

Permite al líder de semillero activar (abrir) o desactivar (cerrar) un campo de investigación **de su semillero**.

#### **Endpoint**
```
PATCH /api/campos/:id/estado
```

#### **Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### **Parámetros de URL**
- `id` (number): ID del campo a modificar

#### **Body**
```json
{
  "activo": 1  // 1 = abierto, 0 = cerrado
}
```

#### **Respuesta Exitosa (200)**
```json
{
  "message": "Campo abierto exitosamente",
  "campo": {
    "id": 1,
    "nombre": "Desarrollo Web Full Stack",
    "activo": 1
  }
}
```

#### **Respuestas de Error**

**400 - Valor Inválido**
```json
{
  "message": "El campo 'activo' debe ser 0 (cerrado) o 1 (abierto)"
}
```

**403 - Sin Permisos**
```json
{
  "message": "No tienes permisos para modificar este campo. Solo puedes modificar campos de tu semillero."
}
```

**404 - Campo No Encontrado**
```json
{
  "message": "Campo no encontrado"
}
```

#### **Ejemplo de Uso**
```jsx
async function toggleCampoEstado(campoId, estadoActual) {
  const nuevoEstado = estadoActual === 1 ? 0 : 1;
  const accion = nuevoEstado === 1 ? 'abrir' : 'cerrar';

  if (!confirm(`¿Estás seguro de ${accion} este campo?`)) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `http://localhost:3000/api/campos/${campoId}/estado`,
      { activo: nuevoEstado },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    alert(`✅ ${response.data.message}`);
    // Recargar lista de campos
    fetchMisCampos();
  } catch (err) {
    alert(`❌ ${err.response?.data?.message || 'Error al cambiar estado'}`);
  }
}
```

---

## 🎨 Estilos CSS Sugeridos

```css
/* ========== DASHBOARD LÍDER SEMILLERO ========== */
.dashboard-lider {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* ========== MI SEMILLERO ========== */
.mi-semillero {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.semillero-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.semillero-header img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.semillero-header h1 {
  flex: 1;
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.estado-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.estado-badge.activo {
  background: #d4edda;
  color: #155724;
}

.estado-badge.cerrado {
  background: #f8d7da;
  color: #721c24;
}

.semillero-info p {
  margin: 1rem 0;
  line-height: 1.6;
  color: #555;
}

.semillero-info strong {
  color: #333;
  font-weight: 600;
}

/* ========== FORMULARIOS ========== */
.editar-semillero-form,
.crear-campo-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control-file {
  padding: 0.5rem;
}

.form-text {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.image-preview {
  margin: 1rem 0;
}

.image-preview img {
  max-width: 300px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* ========== ALERTAS ========== */
.alert {
  padding: 1rem 1.5rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* ========== BOTONES ========== */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: #333;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* ========== GRID DE CAMPOS ========== */
.campos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.campo-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.campo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.campo-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.campo-content {
  padding: 1.5rem;
}

.campo-content h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.3rem;
}

.campo-descripcion {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.campo-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.campo-lider {
  color: #555;
  font-size: 0.9rem;
  margin: 0;
}

.campo-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* ========== EMPTY STATE ========== */
.empty-state {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .dashboard-lider {
    padding: 1rem;
  }

  .semillero-header {
    flex-direction: column;
    text-align: center;
  }

  .campos-grid {
    grid-template-columns: 1fr;
  }

  .campo-actions {
    flex-direction: column;
  }
}
```

---

## 📦 Estructura de Datos

### Semillero
```typescript
interface Semillero {
  id: number;
  nombre: string;
  lider: number;
  ruta_imagen: string | null;
  descripcion: string;
  contacto: string | null;
  creado_en: string; // ISO 8601
  lineas_investigacion_id: number;
  activo: 0 | 1; // 0 = cerrado, 1 = abierto
  linea: {
    id: number;
    nombre: string;
  };
  liderUsuario: {
    id: number;
    nombre: string;
    correo: string;
  };
}
```

### Campo de Investigación
```typescript
interface Campo {
  id: number;
  nombre: string;
  lider: number;
  descripcion: string;
  ruta_imagen: string | null;
  id_semillero: number;
  activo: 0 | 1; // 0 = cerrado, 1 = abierto
  horario_reunion?: string | null;
  contacto_email?: string | null;
  contacto_redes_sociales?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  } | null;
  liderUsuario?: {
    id: number;
    nombre: string;
    correo: string;
  };
}
```

---

## ⚠️ Validaciones

### Email
- Formato válido de email
- Ejemplo válido: `usuario@ucp.edu.co`

### Redes Sociales
```javascript
{
  "facebook": "https://facebook.com/...",    // Opcional
  "instagram": "https://instagram.com/...",  // Opcional
  "linkedin": "https://linkedin.com/...",    // Opcional
  "youtube": "https://youtube.com/..."       // Opcional
}
```

### Imágenes
- Formatos: JPG, PNG, WebP
- Tamaño máximo: 5MB
- Se suben a Cloudinary automáticamente

---

## 🔐 Seguridad

### Validaciones del Backend
1. ✅ Token JWT válido en todas las peticiones
2. ✅ Verificación de rol (debe ser Admin Semillero)
3. ✅ El líder solo puede modificar **su propio semillero**
4. ✅ El líder solo puede cerrar/abrir campos **de su semillero**
5. ✅ Sanitización de textos para prevenir XSS
6. ✅ Validación de emails
7. ✅ Validación de URLs de redes sociales

### Buenas Prácticas Frontend
```javascript
// ✅ CORRECTO: Siempre verificar token antes de hacer peticiones
const token = localStorage.getItem('token');
if (!token) {
  // Redirigir al login
  navigate('/login');
  return;
}

// ✅ CORRECTO: Manejar errores de autenticación
try {
  const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
} catch (err) {
  if (err.response?.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem('token');
    navigate('/login');
  } else if (err.response?.status === 403) {
    // Sin permisos
    alert('No tienes permisos para esta acción');
  }
}
```

---

## 🧪 Testing

### Credenciales de Prueba
```javascript
// Líder de Semillero (Admin Semillero)
{
  correo: "maria.garcia@ucp.edu.co",
  contraseña: "admin123",
  id_rol: 1,
  id_semillero_liderado: 1
}
```

### Endpoints a Probar
```bash
# 1. Login
POST http://localhost:3000/api/auth/login
Body: { "correo": "maria.garcia@ucp.edu.co", "contrasena": "admin123" }

# 2. Obtener mi semillero
GET http://localhost:3000/api/semilleros/mi-semillero/info
Header: Authorization: Bearer <token>

# 3. Obtener mis campos
GET http://localhost:3000/api/semilleros/mi-semillero/campos
Header: Authorization: Bearer <token>

# 4. Actualizar mi semillero
PUT http://localhost:3000/api/semilleros/mi-semillero/actualizar
Header: Authorization: Bearer <token>
Body: { "descripcion": "Nueva descripción" }

# 5. Cerrar un campo
PATCH http://localhost:3000/api/campos/1/estado
Header: Authorization: Bearer <token>
Body: { "activo": 0 }
```

---

## 📝 Notas Importantes

### ⚠️ Migración de Base de Datos Requerida
Antes de usar el endpoint de cerrar/abrir campos, debes ejecutar la migración SQL:

```sql
-- Ejecutar este script en MySQL
ALTER TABLE `campos_investigacion` 
ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1 
COMMENT '1 = Abierto, 0 = Cerrado' 
AFTER `id_semillero`;
```

**Ubicación del script:** `/migrations/add_activo_campos.sql`

### 🔄 Flujo de Trabajo Recomendado

1. **Login** → Obtener token JWT
2. **Ver Mi Semillero** → GET `/mi-semillero/info`
3. **Ver Mis Campos** → GET `/mi-semillero/campos`
4. **Gestionar Semillero** → PUT `/mi-semillero/actualizar`
5. **Gestionar Campos** → PATCH `/campos/:id/estado`

### 📊 Dashboard Completo del Líder

```jsx
function DashboardLiderSemillero() {
  return (
    <div className="dashboard-lider">
      {/* Header con info del semillero */}
      <MiSemillero />
      
      {/* Botones de acción rápida */}
      <div className="quick-actions">
        <button onClick={() => setShowEditSemillero(true)}>
          ✏️ Editar Semillero
        </button>
        <button onClick={() => setShowCrearCampo(true)}>
          ➕ Crear Campo
        </button>
      </div>

      {/* Lista de campos */}
      <MisCampos />

      {/* Modales */}
      {showEditSemillero && <EditarSemillero onClose={...} />}
      {showCrearCampo && <CrearCampo onClose={...} />}
    </div>
  );
}
```

---

## ✅ Checklist de Implementación

- [ ] Ejecutar migración SQL para agregar campo `activo` a campos
- [ ] Implementar componente `MiSemillero`
- [ ] Implementar componente `EditarSemillero`
- [ ] Implementar componente `MisCampos`
- [ ] Implementar componente `CrearCampo`
- [ ] Implementar función `toggleSemilleroEstado`
- [ ] Implementar función `toggleCampoEstado`
- [ ] Agregar manejo de errores 401/403
- [ ] Validar imágenes antes de subir
- [ ] Probar con usuario de prueba
- [ ] Agregar indicadores de loading
- [ ] Implementar confirmaciones para acciones críticas

---

## 📞 Soporte

Si tienes dudas sobre la implementación:
- Verifica que ejecutaste la migración SQL
- Asegúrate de tener un token válido de Admin Semillero
- Revisa los logs del servidor para errores
- Verifica que el usuario tenga un semillero asignado

---

**Última actualización:** 8 de noviembre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Listo para Implementar
