# 📚 Documentación API - Gestión de Mi Campo (Admin Campo)

## 📋 Información General

Esta documentación detalla los endpoints disponibles para que el **Admin Campo** pueda gestionar su campo de investigación asignado.

**Base URL:** `http://localhost:3000/api/campos`

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante JWT token.

```javascript
headers: {
  'Authorization': 'Bearer <tu_token_jwt>'
}
```

**Rol requerido:** Admin Campo (id_rol = 2)

---

## 📌 Endpoints Disponibles

### 1. Obtener Mi Campo
### 2. Actualizar Mi Campo
### 3. Eliminar Imagen del Campo

---

## 🔹 1. OBTENER MI CAMPO

Obtiene la información completa del campo de investigación asignado al líder.

### **Endpoint**
```
GET /api/campos/mi-campo/info
```

### **Headers**
```json
{
  "Authorization": "Bearer <token_jwt>"
}
```

### **Respuesta Exitosa (200)**
```json
{
  "id": 1,
  "nombre": "Desarrollo Web Full Stack",
  "descripcion": "Campo enfocado en el desarrollo de aplicaciones web modernas usando React y Node.js",
  "ruta_imagen": "https://res.cloudinary.com/dw9krxrn4/image/upload/v1234567890/semilleros-ucp/campos/abc123.jpg",
  "lider": 21,
  "id_semillero": 1,
  "horario_reunion": "Viernes 3:00 PM - 5:00 PM",
  "contacto_email": "web.dev@ucp.edu.co",
  "contacto_redes_sociales": {
    "facebook": "https://facebook.com/ucpwebdev",
    "instagram": "@ucpwebdev",
    "twitter": "@ucpwebdev"
  },
  "semillero_nombre": "Semillero TechLab",
  "lider_nombre": "Carlos Rodríguez",
  "lider_correo": "carlos.rodriguez@ucp.edu.co"
}
```

### **Respuestas de Error**

**404 - Sin Campo Asignado**
```json
{
  "mensaje": "No tienes un campo asignado. Contacta al administrador."
}
```

**401 - No Autenticado**
```json
{
  "mensaje": "Token no proporcionado"
}
```

**403 - Sin Permisos**
```json
{
  "mensaje": "No tienes permisos para acceder a este recurso"
}
```

### **Ejemplo de Uso (React)**
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function MiCampoInfo() {
  const [campo, setCampo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMiCampo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:3000/api/campos/mi-campo/info',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setCampo(response.data);
      } catch (err) {
        setError(err.response?.data?.mensaje || 'Error al cargar el campo');
      } finally {
        setLoading(false);
      }
    };

    fetchMiCampo();
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!campo) return <div>No tienes un campo asignado</div>;

  return (
    <div className="campo-info">
      <div className="campo-header">
        {campo.ruta_imagen && (
          <img 
            src={campo.ruta_imagen} 
            alt={campo.nombre}
            className="campo-imagen"
          />
        )}
        <h1>{campo.nombre}</h1>
        <span className="semillero-tag">{campo.semillero_nombre}</span>
      </div>
      
      <div className="campo-detalles">
        <p>{campo.descripcion}</p>
        
        {campo.horario_reunion && (
          <div className="info-item">
            <strong>📅 Horario de Reunión:</strong>
            <span>{campo.horario_reunion}</span>
          </div>
        )}
        
        {campo.contacto_email && (
          <div className="info-item">
            <strong>📧 Email de Contacto:</strong>
            <a href={`mailto:${campo.contacto_email}`}>{campo.contacto_email}</a>
          </div>
        )}
        
        {campo.contacto_redes_sociales && (
          <div className="redes-sociales">
            <strong>🌐 Redes Sociales:</strong>
            {campo.contacto_redes_sociales.facebook && (
              <a href={campo.contacto_redes_sociales.facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            )}
            {campo.contacto_redes_sociales.instagram && (
              <span>Instagram: {campo.contacto_redes_sociales.instagram}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔹 2. ACTUALIZAR MI CAMPO

Actualiza la información del campo de investigación asignado al líder. Puede actualizar nombre, descripción, horarios, contacto e imagen.

### **Endpoint**
```
PUT /api/campos/mi-campo/actualizar
```

### **Headers**
```json
{
  "Authorization": "Bearer <token_jwt>",
  "Content-Type": "multipart/form-data"
}
```

### **Body (FormData)**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | No | Nombre del campo |
| descripcion | string | No | Descripción del campo |
| horario_reunion | string | No | Horario de reuniones |
| contacto_email | string | No | Email de contacto del campo |
| contacto_redes_sociales | JSON string | No | Redes sociales del campo |
| imagen | File | No | Nueva imagen del campo (JPG, PNG, WebP - máx 5MB) |

### **Ejemplo de contacto_redes_sociales**
```json
{
  "facebook": "https://facebook.com/ucpwebdev",
  "instagram": "@ucpwebdev",
  "twitter": "@ucpwebdev",
  "linkedin": "https://linkedin.com/company/ucpwebdev",
  "youtube": "https://youtube.com/c/ucpwebdev"
}
```

### **Respuesta Exitosa (200)**
```json
{
  "mensaje": "Campo actualizado exitosamente",
  "campo": {
    "id": 1,
    "nombre": "Desarrollo Web Full Stack",
    "descripcion": "Campo enfocado en el desarrollo de aplicaciones web modernas",
    "ruta_imagen": "https://res.cloudinary.com/dw9krxrn4/image/upload/v1234567890/semilleros-ucp/campos/nueva-imagen.jpg",
    "lider": 21,
    "id_semillero": 1,
    "horario_reunion": "Viernes 3:00 PM - 5:00 PM",
    "contacto_email": "web.dev@ucp.edu.co",
    "contacto_redes_sociales": {
      "facebook": "https://facebook.com/ucpwebdev",
      "instagram": "@ucpwebdev"
    },
    "semillero_nombre": "Semillero TechLab",
    "lider_nombre": "Carlos Rodríguez"
  }
}
```

### **Respuestas de Error**

**400 - Sin Cambios**
```json
{
  "mensaje": "No hay cambios para actualizar"
}
```

**400 - Email Inválido**
```json
{
  "mensaje": "Email de contacto no válido"
}
```

**400 - Redes Sociales Inválidas**
```json
{
  "mensaje": "Redes sociales no válidas",
  "errores": [
    "La URL de Facebook debe ser válida",
    "El usuario de Instagram debe comenzar con @"
  ]
}
```

**403 - Sin Campo Asignado**
```json
{
  "mensaje": "No tienes un campo asignado para editar"
}
```

**500 - Error al Subir Imagen**
```json
{
  "mensaje": "Error al subir imagen a Cloudinary",
  "error": "Detalles del error"
}
```

### **Ejemplo de Uso (React)**
```jsx
import { useState } from 'react';
import axios from 'axios';

function EditarMiCampo({ campoActual, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: campoActual.nombre || '',
    descripcion: campoActual.descripcion || '',
    horario_reunion: campoActual.horario_reunion || '',
    contacto_email: campoActual.contacto_email || '',
    facebook: campoActual.contacto_redes_sociales?.facebook || '',
    instagram: campoActual.contacto_redes_sociales?.instagram || '',
    twitter: campoActual.contacto_redes_sociales?.twitter || ''
  });
  
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no puede superar los 5MB');
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Solo se permiten imágenes JPG, PNG o WebP');
        return;
      }

      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();

      // Agregar campos de texto
      if (formData.nombre.trim()) data.append('nombre', formData.nombre.trim());
      if (formData.descripcion.trim()) data.append('descripcion', formData.descripcion.trim());
      if (formData.horario_reunion.trim()) data.append('horario_reunion', formData.horario_reunion.trim());
      if (formData.contacto_email.trim()) data.append('contacto_email', formData.contacto_email.trim());

      // Agregar redes sociales si hay al menos una
      const redesSociales = {};
      if (formData.facebook.trim()) redesSociales.facebook = formData.facebook.trim();
      if (formData.instagram.trim()) redesSociales.instagram = formData.instagram.trim();
      if (formData.twitter.trim()) redesSociales.twitter = formData.twitter.trim();
      
      if (Object.keys(redesSociales).length > 0) {
        data.append('contacto_redes_sociales', JSON.stringify(redesSociales));
      }

      // Agregar imagen si fue seleccionada
      if (imagenFile) {
        data.append('imagen', imagenFile);
      }

      const response = await axios.put(
        'http://localhost:3000/api/campos/mi-campo/actualizar',
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert(response.data.mensaje);
      onSuccess(response.data.campo);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar el campo');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-editar-campo">
      <h2>✏️ Editar Mi Campo</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="nombre">Nombre del Campo *</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Desarrollo Web Full Stack"
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción *</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={5}
          placeholder="Describe el enfoque y objetivos del campo de investigación..."
          maxLength={1000}
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
          placeholder="Ej: Viernes 3:00 PM - 5:00 PM"
          maxLength={100}
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
          placeholder="campo.contacto@ucp.edu.co"
        />
      </div>

      <fieldset className="redes-sociales-group">
        <legend>🌐 Redes Sociales</legend>
        
        <div className="form-group">
          <label htmlFor="facebook">Facebook</label>
          <input
            type="url"
            id="facebook"
            name="facebook"
            value={formData.facebook}
            onChange={handleChange}
            placeholder="https://facebook.com/tu-pagina"
          />
        </div>

        <div className="form-group">
          <label htmlFor="instagram">Instagram</label>
          <input
            type="text"
            id="instagram"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            placeholder="@tu_usuario"
          />
        </div>

        <div className="form-group">
          <label htmlFor="twitter">Twitter</label>
          <input
            type="text"
            id="twitter"
            name="twitter"
            value={formData.twitter}
            onChange={handleChange}
            placeholder="@tu_usuario"
          />
        </div>
      </fieldset>

      <div className="form-group">
        <label htmlFor="imagen">Imagen del Campo</label>
        <input
          type="file"
          id="imagen"
          name="imagen"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
        />
        <small>JPG, PNG o WebP - Máximo 5MB</small>
        
        {(imagenPreview || campoActual.ruta_imagen) && (
          <div className="imagen-preview">
            <img 
              src={imagenPreview || campoActual.ruta_imagen} 
              alt="Vista previa" 
            />
          </div>
        )}
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Guardando...' : '💾 Guardar Cambios'}
        </button>
        <button 
          type="button" 
          onClick={() => window.history.back()}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
```

### **Estilos CSS Sugeridos**
```css
.form-editar-campo {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-editar-campo h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #7c3aed;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

.redes-sociales-group {
  border: 1px solid #e0e0e0;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.redes-sociales-group legend {
  padding: 0 0.5rem;
  font-weight: 600;
  color: #555;
}

.imagen-preview {
  margin-top: 1rem;
  text-align: center;
}

.imagen-preview img {
  max-width: 300px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}
```

---

## 🔹 3. ELIMINAR IMAGEN DEL CAMPO

Elimina la imagen del campo de investigación (tanto de Cloudinary como de la base de datos).

### **Endpoint**
```
DELETE /api/campos/mi-campo/imagen
```

### **Headers**
```json
{
  "Authorization": "Bearer <token_jwt>"
}
```

### **Respuesta Exitosa (200)**
```json
{
  "mensaje": "Imagen eliminada exitosamente"
}
```

### **Respuestas de Error**

**400 - Sin Imagen**
```json
{
  "mensaje": "El campo no tiene imagen para eliminar"
}
```

**403 - Sin Campo Asignado**
```json
{
  "mensaje": "No tienes un campo asignado"
}
```

### **Ejemplo de Uso (React)**
```jsx
import axios from 'axios';

function EliminarImagenCampo({ onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleEliminarImagen = async () => {
    if (!window.confirm('¿Estás seguro de eliminar la imagen del campo?')) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        'http://localhost:3000/api/campos/mi-campo/imagen',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert(response.data.mensaje);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al eliminar imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleEliminarImagen}
      disabled={loading}
      className="btn btn-danger"
    >
      {loading ? 'Eliminando...' : '🗑️ Eliminar Imagen'}
    </button>
  );
}
```

---

## 🎯 Flujo Completo de Gestión

### **Dashboard del Admin Campo**
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function DashboardAdminCampo() {
  const [campo, setCampo] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMiCampo();
  }, []);

  const cargarMiCampo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:3000/api/campos/mi-campo/info',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCampo(response.data);
    } catch (err) {
      console.error('Error al cargar campo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizacionExitosa = (campoActualizado) => {
    setCampo(campoActualizado);
    setModoEdicion(false);
    alert('Campo actualizado exitosamente');
  };

  const handleEliminarImagenExitosa = () => {
    setCampo({ ...campo, ruta_imagen: null });
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (!campo) return <div className="error">No tienes un campo asignado</div>;

  return (
    <div className="dashboard-admin-campo">
      <div className="dashboard-header">
        <h1>🎓 Mi Campo de Investigación</h1>
        <button 
          onClick={() => setModoEdicion(!modoEdicion)}
          className="btn btn-primary"
        >
          {modoEdicion ? 'Ver Información' : '✏️ Editar Campo'}
        </button>
      </div>

      {modoEdicion ? (
        <EditarMiCampo 
          campoActual={campo}
          onSuccess={handleActualizacionExitosa}
        />
      ) : (
        <>
          <MiCampoInfo campo={campo} />
          
          {campo.ruta_imagen && (
            <div className="acciones-imagen">
              <EliminarImagenCampo 
                onSuccess={handleEliminarImagenExitosa}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

## ⚠️ Validaciones y Restricciones

### **Validación de Imágenes**
- **Formatos permitidos:** JPG, PNG, WebP
- **Tamaño máximo:** 5 MB
- **Optimización automática:** 800x600px, calidad auto

### **Validación de Email**
- Debe ser un email válido
- Se valida con regex en el servidor

### **Validación de Redes Sociales**
- Facebook: URL completa válida
- Instagram: debe comenzar con @
- Twitter: debe comenzar con @
- LinkedIn: URL completa válida
- YouTube: URL completa válida

### **Validación de Permisos**
- Solo el líder asignado puede editar el campo
- Se verifica mediante JWT token (id_campo)
- Si no tiene campo asignado, recibe error 403 o 404

---

## 🔒 Seguridad

1. **Autenticación JWT** obligatoria
2. **Validación de rol** Admin Campo
3. **Verificación de propiedad** (líder del campo)
4. **Sanitización de inputs** en el servidor
5. **Eliminación segura** de imágenes en Cloudinary

---

## 📝 Notas Importantes

1. **Actualización parcial**: No es necesario enviar todos los campos, solo los que se desean actualizar
2. **Imagen previa**: Si se sube una nueva imagen, la anterior se elimina automáticamente de Cloudinary
3. **Redes sociales**: Se envían como JSON string en FormData
4. **Campos opcionales**: Todos los campos son opcionales en la actualización
5. **Campo único**: Un Admin Campo solo puede gestionar UN campo (el asignado como líder)

---

## 🐛 Manejo de Errores

### **Error 400 - Datos Inválidos**
```javascript
if (error.response?.status === 400) {
  // Mostrar mensaje específico
  alert(error.response.data.mensaje);
  
  // Si hay errores de validación
  if (error.response.data.errores) {
    error.response.data.errores.forEach(err => {
      console.error(err);
    });
  }
}
```

### **Error 403 - Sin Permisos**
```javascript
if (error.response?.status === 403) {
  alert('No tienes permisos para realizar esta acción');
  // Redirigir al usuario
  window.location.href = '/dashboard';
}
```

### **Error 404 - Sin Campo Asignado**
```javascript
if (error.response?.status === 404) {
  alert('No tienes un campo asignado. Contacta al administrador.');
  window.location.href = '/dashboard';
}
```

### **Error 500 - Error del Servidor**
```javascript
if (error.response?.status === 500) {
  alert('Error del servidor. Por favor, intenta más tarde.');
  console.error('Error 500:', error.response.data);
}
```

---

## ✅ Checklist de Implementación

- [ ] Implementar componente para ver información del campo
- [ ] Implementar formulario de edición con todos los campos
- [ ] Agregar validación de imágenes en el frontend
- [ ] Implementar preview de imágenes antes de subir
- [ ] Agregar loading states en todas las operaciones
- [ ] Implementar manejo de errores con mensajes claros
- [ ] Agregar confirmación antes de eliminar imagen
- [ ] Probar con diferentes tamaños de imagen
- [ ] Validar que solo el líder puede acceder
- [ ] Probar actualización parcial (solo algunos campos)

---

## 📞 Soporte

Para cualquier duda o problema:
- **Backend:** Revisar logs del servidor
- **Cloudinary:** Verificar configuración en `.env`
- **Base de datos:** Verificar que el usuario esté asignado como líder

---

**Última actualización:** Noviembre 2025
**Versión:** 1.0.0
