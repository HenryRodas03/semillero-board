# 📸 SISTEMA DE PUBLICACIONES - Guía para Frontend

**Universidad Católica de Pereira - Módulo de Publicaciones para Líderes de Campo**

---

## 🎯 Objetivo

Permitir que los **Líderes de Campo** (Admin Campo) puedan crear publicaciones de eventos, logros y noticias con hasta 3 imágenes. Estas publicaciones se mostrarán públicamente en la landing page.

---

## 🔐 AUTENTICACIÓN Y PERMISOS

### **Roles con Acceso:**
- ✅ **Admin Campo** (id_rol: 2) - Puede publicar en SU campo
- ✅ **Admin Semillero** (id_rol: 1) - Puede publicar en cualquier campo (opcional)

### **Validación en Backend:**
El backend valida que:
1. El usuario esté autenticado (token JWT válido)
2. El usuario sea el líder del campo al que quiere publicar
3. Solo el autor puede editar/eliminar sus propias publicaciones

---

## 📡 BASE URL

```
http://localhost:5000/api
```

Para producción, cambiar a:
```
https://tu-dominio.com/api
```

---

## 🌍 ENDPOINTS PÚBLICOS (No requieren autenticación)

### 1️⃣ Listar todas las publicaciones

```http
GET /api/publicaciones
```

**Descripción:** Obtiene todas las publicaciones activas, ordenadas por fecha más reciente.

**Headers:** Ninguno (público)

**Response 200 OK:**
```json
{
  "total": 6,
  "publicaciones": [
    {
      "id": 1,
      "id_campo": 1,
      "titulo": "Taller de React JS 2024",
      "descripcion": "Se llevó a cabo el taller de React JS con la participación de 50 estudiantes...",
      "tipo": "Evento",
      "imagen_1": "https://res.cloudinary.com/dw9krxrn4/image/upload/v1762492205/semilleros-ucp/publicaciones/abc123.jpg",
      "imagen_2": "https://res.cloudinary.com/dw9krxrn4/image/upload/v1762492205/semilleros-ucp/publicaciones/def456.jpg",
      "imagen_3": null,
      "fecha_publicacion": "2024-11-07T15:30:00.000Z",
      "campo_nombre": "Desarrollo Web Full Stack",
      "campo_imagen": "/uploads/campos/web-fullstack.jpg",
      "autor_nombre": "María González",
      "autor_correo": "maria.gonzalez@ucp.edu.co"
    }
  ]
}
```

**Uso en Frontend:**
```javascript
const obtenerPublicaciones = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/publicaciones');
    const data = await response.json();
    return data.publicaciones;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### 2️⃣ Listar publicaciones de un campo específico

```http
GET /api/publicaciones/campo/:id
```

**Parámetros URL:**
- `id` (number) - ID del campo de investigación

**Ejemplo:**
```http
GET /api/publicaciones/campo/1
```

**Response 200 OK:**
```json
{
  "campo_id": 1,
  "total": 2,
  "publicaciones": [
    {
      "id": 1,
      "titulo": "Taller de React JS 2024",
      "descripcion": "...",
      "tipo": "Evento",
      "imagen_1": "https://...",
      "imagen_2": null,
      "imagen_3": null,
      "fecha_publicacion": "2024-11-07T15:30:00.000Z",
      "campo_nombre": "Desarrollo Web Full Stack",
      "autor_nombre": "María González"
    }
  ]
}
```

**Uso en Frontend:**
```javascript
const obtenerPublicacionesPorCampo = async (idCampo) => {
  try {
    const response = await fetch(`http://localhost:5000/api/publicaciones/campo/${idCampo}`);
    const data = await response.json();
    return data.publicaciones;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### 3️⃣ Obtener detalle de una publicación

```http
GET /api/publicaciones/:id
```

**Parámetros URL:**
- `id` (number) - ID de la publicación

**Ejemplo:**
```http
GET /api/publicaciones/1
```

**Response 200 OK:**
```json
{
  "id": 1,
  "id_campo": 1,
  "id_usuario": 2,
  "titulo": "Taller de React JS 2024",
  "descripcion": "Descripción completa del evento...",
  "tipo": "Evento",
  "imagen_1": "https://...",
  "imagen_2": "https://...",
  "imagen_3": null,
  "fecha_publicacion": "2024-11-07T15:30:00.000Z",
  "fecha_actualizacion": null,
  "activo": 1,
  "campo_nombre": "Desarrollo Web Full Stack",
  "campo_descripcion": "Campo enfocado en...",
  "campo_imagen": "/uploads/campos/web-fullstack.jpg",
  "autor_nombre": "María González",
  "autor_correo": "maria.gonzalez@ucp.edu.co"
}
```

**Response 404 Not Found:**
```json
{
  "mensaje": "Publicación no encontrada"
}
```

---

## 🔐 ENDPOINTS PROTEGIDOS (Requieren Autenticación)

### ⚠️ **IMPORTANTE: Headers Requeridos**

Todos los endpoints protegidos requieren:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

Donde `token` es el JWT obtenido del endpoint `/api/auth/login`.

---

### 4️⃣ Obtener mis publicaciones

```http
GET /api/publicaciones/mis-publicaciones
```

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Descripción:** Obtiene todas las publicaciones creadas por el usuario autenticado (activas e inactivas).

**Response 200 OK:**
```json
{
  "total": 3,
  "publicaciones": [
    {
      "id": 1,
      "id_campo": 1,
      "id_usuario": 2,
      "titulo": "Taller de React JS 2024",
      "descripcion": "...",
      "tipo": "Evento",
      "imagen_1": "https://...",
      "imagen_2": null,
      "imagen_3": null,
      "fecha_publicacion": "2024-11-07T15:30:00.000Z",
      "fecha_actualizacion": null,
      "activo": 1,
      "campo_nombre": "Desarrollo Web Full Stack"
    }
  ]
}
```

**Uso en Frontend:**
```javascript
const obtenerMisPublicaciones = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('http://localhost:5000/api/publicaciones/mis-publicaciones', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Error al obtener publicaciones');
    
    const data = await response.json();
    return data.publicaciones;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### 5️⃣ Crear nueva publicación (CON o SIN imágenes)

```http
POST /api/publicaciones
```

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
Content-Type: multipart/form-data  (automático con FormData)
```

**Body (multipart/form-data):**
- `id_campo` (number, required) - ID del campo al que pertenece
- `titulo` (string, required) - Título de la publicación (máx 200 caracteres)
- `descripcion` (text, required) - Descripción detallada
- `tipo` (enum, optional) - "Evento", "Logro", "Noticia", "Otro" (default: "Evento")
- `imagen_1` (file, optional) - Primera imagen (JPG, PNG, WebP, máx 5MB)
- `imagen_2` (file, optional) - Segunda imagen (JPG, PNG, WebP, máx 5MB)
- `imagen_3` (file, optional) - Tercera imagen (JPG, PNG, WebP, máx 5MB)

**Validaciones:**
- ✅ Usuario debe ser líder del campo especificado
- ✅ Título máximo 200 caracteres
- ✅ Imágenes: JPG, PNG, WebP (máx 5MB cada una)
- ✅ Mínimo 1 imagen, máximo 3

**Response 201 Created:**
```json
{
  "mensaje": "Publicación creada exitosamente",
  "publicacion": {
    "id": 7,
    "id_campo": 1,
    "id_usuario": 2,
    "titulo": "Nueva Publicación",
    "descripcion": "Descripción...",
    "tipo": "Evento",
    "imagen_1": "https://res.cloudinary.com/dw9krxrn4/image/upload/v.../semilleros-ucp/publicaciones/abc123.jpg",
    "imagen_2": "https://res.cloudinary.com/dw9krxrn4/image/upload/v.../semilleros-ucp/publicaciones/def456.jpg",
    "imagen_3": null,
    "fecha_publicacion": "2024-11-07T20:15:00.000Z",
    "campo_nombre": "Desarrollo Web Full Stack",
    "autor_nombre": "María González"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "mensaje": "Faltan campos requeridos: id_campo, titulo, descripcion"
}
```

**Response 403 Forbidden:**
```json
{
  "mensaje": "Solo el líder del campo puede crear publicaciones"
}
```

**Response 404 Not Found:**
```json
{
  "mensaje": "Campo de investigación no encontrado"
}
```

---

### 📝 **Ejemplo Completo en React:**

```jsx
import { useState } from 'react';

const FormularioPublicacion = ({ idCampo }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'Evento'
  });
  
  const [imagenes, setImagenes] = useState({
    imagen_1: null,
    imagen_2: null,
    imagen_3: null
  });
  
  const [previews, setPreviews] = useState({
    imagen_1: null,
    imagen_2: null,
    imagen_3: null
  });
  
  const [loading, setLoading] = useState(false);

  // Manejar cambio de campos de texto
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Manejar selección de imágenes
  const handleImagenChange = (e, nombreCampo) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB.');
        return;
      }

      // Validar tipo
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Solo se permiten imágenes JPG, PNG o WebP.');
        return;
      }

      // Guardar archivo
      setImagenes(prev => ({
        ...prev,
        [nombreCampo]: file
      }));

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({
          ...prev,
          [nombreCampo]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remover imagen
  const removerImagen = (nombreCampo) => {
    setImagenes(prev => ({
      ...prev,
      [nombreCampo]: null
    }));
    setPreviews(prev => ({
      ...prev,
      [nombreCampo]: null
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Crear FormData
      const formDataToSend = new FormData();
      formDataToSend.append('id_campo', idCampo);
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('tipo', formData.tipo);

      // Agregar imágenes si existen
      if (imagenes.imagen_1) {
        formDataToSend.append('imagen_1', imagenes.imagen_1);
      }
      if (imagenes.imagen_2) {
        formDataToSend.append('imagen_2', imagenes.imagen_2);
      }
      if (imagenes.imagen_3) {
        formDataToSend.append('imagen_3', imagenes.imagen_3);
      }

      // Obtener token
      const token = localStorage.getItem('token');

      // Enviar petición
      const response = await fetch('http://localhost:5000/api/publicaciones', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NO incluir 'Content-Type': FormData lo maneja automáticamente
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        alert('Publicación creada exitosamente');
        // Resetear formulario
        setFormData({ titulo: '', descripcion: '', tipo: 'Evento' });
        setImagenes({ imagen_1: null, imagen_2: null, imagen_3: null });
        setPreviews({ imagen_1: null, imagen_2: null, imagen_3: null });
      } else {
        alert(data.mensaje || 'Error al crear publicación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear publicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Título */}
      <div>
        <label>Título:</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          maxLength={200}
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label>Descripción:</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={5}
          required
        />
      </div>

      {/* Tipo */}
      <div>
        <label>Tipo:</label>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
        >
          <option value="Evento">Evento</option>
          <option value="Logro">Logro</option>
          <option value="Noticia">Noticia</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      {/* Imagen 1 */}
      <div>
        <label>Imagen 1:</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleImagenChange(e, 'imagen_1')}
        />
        {previews.imagen_1 && (
          <div>
            <img src={previews.imagen_1} alt="Preview 1" style={{ width: '200px' }} />
            <button type="button" onClick={() => removerImagen('imagen_1')}>✕</button>
          </div>
        )}
      </div>

      {/* Imagen 2 */}
      <div>
        <label>Imagen 2 (opcional):</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleImagenChange(e, 'imagen_2')}
        />
        {previews.imagen_2 && (
          <div>
            <img src={previews.imagen_2} alt="Preview 2" style={{ width: '200px' }} />
            <button type="button" onClick={() => removerImagen('imagen_2')}>✕</button>
          </div>
        )}
      </div>

      {/* Imagen 3 */}
      <div>
        <label>Imagen 3 (opcional):</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleImagenChange(e, 'imagen_3')}
        />
        {previews.imagen_3 && (
          <div>
            <img src={previews.imagen_3} alt="Preview 3" style={{ width: '200px' }} />
            <button type="button" onClick={() => removerImagen('imagen_3')}>✕</button>
          </div>
        )}
      </div>

      {/* Botón submit */}
      <button type="submit" disabled={loading}>
        {loading ? 'Publicando...' : 'Crear Publicación'}
      </button>
    </form>
  );
};

export default FormularioPublicacion;
```

---

### 6️⃣ Actualizar publicación existente

```http
PUT /api/publicaciones/:id
```

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
Content-Type: multipart/form-data
```

**Parámetros URL:**
- `id` (number) - ID de la publicación a actualizar

**Body (multipart/form-data):**
- `titulo` (string, optional) - Nuevo título
- `descripcion` (text, optional) - Nueva descripción
- `tipo` (enum, optional) - Nuevo tipo
- `imagen_1` (file, optional) - Reemplazar imagen 1
- `imagen_2` (file, optional) - Reemplazar imagen 2
- `imagen_3` (file, optional) - Reemplazar imagen 3

**Validaciones:**
- ✅ Solo el autor puede actualizar
- ⚠️ Si envías nueva imagen, la anterior se elimina de Cloudinary automáticamente

**Response 200 OK:**
```json
{
  "mensaje": "Publicación actualizada exitosamente",
  "publicacion": {
    "id": 1,
    "titulo": "Título actualizado",
    "descripcion": "Descripción actualizada",
    "imagen_1": "https://...",
    "imagen_2": "https://... (nueva URL)",
    "imagen_3": null
  }
}
```

**Response 403 Forbidden:**
```json
{
  "mensaje": "Solo el autor puede editar esta publicación"
}
```

**Response 404 Not Found:**
```json
{
  "mensaje": "Publicación no encontrada"
}
```

---

### 7️⃣ Eliminar imagen específica de una publicación

```http
DELETE /api/publicaciones/:id/imagen
```

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
Content-Type: application/json
```

**Parámetros URL:**
- `id` (number) - ID de la publicación

**Body (JSON):**
```json
{
  "imagen": "imagen_2"
}
```

**Valores permitidos:** `"imagen_1"`, `"imagen_2"`, `"imagen_3"`

**Descripción:** Elimina una imagen específica de Cloudinary y pone NULL en la BD.

**Response 200 OK:**
```json
{
  "mensaje": "Imagen imagen_2 eliminada exitosamente"
}
```

**Response 400 Bad Request:**
```json
{
  "mensaje": "Imagen inválida. Debe ser: imagen_1, imagen_2 o imagen_3"
}
```

**Uso en Frontend:**
```javascript
const eliminarImagen = async (idPublicacion, nombreImagen) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`http://localhost:5000/api/publicaciones/${idPublicacion}/imagen`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imagen: nombreImagen })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.mensaje);
    } else {
      alert(data.mensaje);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### 8️⃣ Eliminar publicación (Soft Delete)

```http
DELETE /api/publicaciones/:id
```

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Parámetros URL:**
- `id` (number) - ID de la publicación a eliminar

**Descripción:** Marca la publicación como inactiva (`activo = 0`). NO elimina las imágenes de Cloudinary.

**Validaciones:**
- ✅ Solo el autor puede eliminar

**Response 200 OK:**
```json
{
  "mensaje": "Publicación eliminada exitosamente"
}
```

**Response 403 Forbidden:**
```json
{
  "mensaje": "Solo el autor puede eliminar esta publicación"
}
```

**Uso en Frontend:**
```javascript
const eliminarPublicacion = async (idPublicacion) => {
  const token = localStorage.getItem('token');
  
  const confirmar = window.confirm('¿Estás seguro de eliminar esta publicación?');
  if (!confirmar) return;
  
  try {
    const response = await fetch(`http://localhost:5000/api/publicaciones/${idPublicacion}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Publicación eliminada');
      // Recargar lista de publicaciones
    } else {
      alert(data.mensaje);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### 9️⃣ Activar/Desactivar publicación

```http
PATCH /api/publicaciones/:id/estado
```

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
Content-Type: application/json
```

**Parámetros URL:**
- `id` (number) - ID de la publicación

**Body (JSON):**
```json
{
  "activo": 1
}
```

**Valores:**
- `1` = Activar publicación
- `0` = Desactivar publicación
- Omitir = Toggle automático (si está activa, la desactiva y viceversa)

**Response 200 OK:**
```json
{
  "mensaje": "Publicación activada exitosamente",
  "activo": 1
}
```

**Uso en Frontend:**
```javascript
const toggleEstadoPublicacion = async (idPublicacion, nuevoEstado) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`http://localhost:5000/api/publicaciones/${idPublicacion}/estado`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ activo: nuevoEstado })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.mensaje);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🎨 COMPONENTE DE VISUALIZACIÓN - Landing Page

### **Galería de Publicaciones (Público)**

```jsx
import { useState, useEffect } from 'react';

const PublicacionesRecientes = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState(null);

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const fetchPublicaciones = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/publicaciones');
      const data = await response.json();
      setPublicaciones(data.publicaciones);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const publicacionesFiltradas = filtroTipo
    ? publicaciones.filter(p => p.tipo === filtroTipo)
    : publicaciones;

  if (loading) return <div>Cargando publicaciones...</div>;

  return (
    <section className="publicaciones-section">
      <h2>Publicaciones Recientes</h2>

      {/* Filtros */}
      <div className="filtros">
        <button onClick={() => setFiltroTipo(null)}>Todas</button>
        <button onClick={() => setFiltroTipo('Evento')}>Eventos</button>
        <button onClick={() => setFiltroTipo('Logro')}>Logros</button>
        <button onClick={() => setFiltroTipo('Noticia')}>Noticias</button>
      </div>

      {/* Grid de publicaciones */}
      <div className="publicaciones-grid">
        {publicacionesFiltradas.map((pub) => (
          <div key={pub.id} className="publicacion-card">
            {/* Galería de imágenes (Carrusel o Grid) */}
            <div className="imagenes-galeria">
              {pub.imagen_1 && (
                <img 
                  src={pub.imagen_1} 
                  alt={pub.titulo}
                  onError={(e) => e.target.src = '/placeholder.jpg'}
                />
              )}
              {pub.imagen_2 && (
                <img src={pub.imagen_2} alt={`${pub.titulo} - 2`} />
              )}
              {pub.imagen_3 && (
                <img src={pub.imagen_3} alt={`${pub.titulo} - 3`} />
              )}
            </div>

            {/* Contenido */}
            <div className="card-content">
              <span className="tipo-badge">{pub.tipo}</span>
              <h3>{pub.titulo}</h3>
              <p className="campo">{pub.campo_nombre}</p>
              <p className="descripcion">
                {pub.descripcion.substring(0, 150)}...
              </p>
              <div className="card-footer">
                <span className="autor">Por: {pub.autor_nombre}</span>
                <span className="fecha">
                  {new Date(pub.fecha_publicacion).toLocaleDateString('es-CO')}
                </span>
              </div>
              <a href={`/publicacion/${pub.id}`} className="btn-ver-mas">
                Ver más →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PublicacionesRecientes;
```

---

## 🔐 CONTROL DE ACCESO EN FRONTEND

### **Verificar si el usuario es Admin Campo:**

```javascript
// Después del login
const user = JSON.parse(localStorage.getItem('user'));

// Verificar rol
const esAdminCampo = user?.id_rol === 2;
const esAdminSemillero = user?.id_rol === 1;

// Mostrar panel de publicaciones solo si es Admin Campo o superior
if (esAdminCampo || esAdminSemillero) {
  // Mostrar botón "Crear Publicación"
  return <FormularioPublicacion idCampo={user.id_campo} />;
}
```

### **Obtener campo del usuario:**

El líder de un campo debe conocer su `id_campo`. Puedes:

**Opción 1:** Guardar en el objeto `user` al hacer login:
```javascript
// En el backend (authController.js), agregar:
const [campo] = await db.query(
  'SELECT id FROM campos_investigacion WHERE lider = ?',
  [usuario.id]
);

res.json({
  token,
  user: {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    id_rol: usuario.id_rol,
    id_campo: campo.length > 0 ? campo[0].id : null  // ← Agregar esto
  }
});
```

**Opción 2:** Hacer un endpoint para obtener el campo del usuario:
```javascript
GET /api/campos/mi-campo
```

---

## 🎨 ESTILOS CSS SUGERIDOS

```css
/* Sección de publicaciones */
.publicaciones-section {
  padding: 4rem 5%;
  background: #f8f9fa;
}

.publicaciones-section h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #003366;
  margin-bottom: 2rem;
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
  border: 2px solid #003366;
  background: white;
  color: #003366;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.filtros button:hover,
.filtros button.active {
  background: #003366;
  color: white;
}

/* Grid de publicaciones */
.publicaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

/* Tarjeta de publicación */
.publicacion-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.publicacion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

/* Galería de imágenes */
.imagenes-galeria {
  position: relative;
  height: 250px;
  display: grid;
  gap: 2px;
}

/* Si hay 1 imagen */
.imagenes-galeria img:only-child {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Si hay 2 imágenes */
.imagenes-galeria img:first-child:nth-last-child(2),
.imagenes-galeria img:first-child:nth-last-child(2) ~ img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.imagenes-galeria:has(img:nth-child(2)) {
  grid-template-columns: 1fr 1fr;
}

/* Si hay 3 imágenes */
.imagenes-galeria:has(img:nth-child(3)) {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.imagenes-galeria img:first-child:nth-last-child(3) {
  grid-row: 1 / 3;
}

/* Contenido de la tarjeta */
.card-content {
  padding: 1.5rem;
}

.tipo-badge {
  display: inline-block;
  background: #003366;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.publicacion-card h3 {
  font-size: 1.5rem;
  color: #003366;
  margin: 0.5rem 0;
}

.publicacion-card .campo {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.publicacion-card .descripcion {
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  font-size: 0.85rem;
  color: #666;
}

.btn-ver-mas {
  display: inline-block;
  margin-top: 1rem;
  color: #003366;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s;
}

.btn-ver-mas:hover {
  color: #FFD700;
}
```

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

### **Error 401: Unauthorized**
```json
{ "mensaje": "No autorizado" }
```
**Solución:** Verifica que el token JWT esté en el header `Authorization: Bearer <token>`.

---

### **Error 403: Forbidden**
```json
{ "mensaje": "Solo el líder del campo puede crear publicaciones" }
```
**Solución:** El usuario no es el líder del campo especificado. Verifica que `id_campo` corresponda al campo del usuario autenticado.

---

### **Error 400: Bad Request (Multer)**
```json
{ "mensaje": "Solo se permiten imágenes (jpeg, jpg, png, gif, webp)" }
```
**Solución:** El archivo no es una imagen válida. Verifica el tipo de archivo.

---

### **Error 413: Payload Too Large**
```
Error: request entity too large
```
**Solución:** La imagen supera 5MB. Comprime la imagen antes de subirla.

---

### **Error: No se muestran las imágenes**
**Posibles causas:**
1. URL de Cloudinary es `null` → No se subió correctamente
2. CORS bloqueado → Ya está configurado en el backend
3. URL incorrecta → Verifica en la BD que las URLs sean válidas

---

## 🧪 TESTING

### **Checklist de Pruebas:**

- [ ] Login como Admin Campo funciona
- [ ] Se obtiene el `id_campo` del usuario
- [ ] Formulario de publicación se muestra solo para Admin Campo
- [ ] Se pueden seleccionar 1, 2 o 3 imágenes
- [ ] Preview de imágenes funciona antes de enviar
- [ ] POST con imágenes sube correctamente a Cloudinary
- [ ] URLs de Cloudinary se guardan en la BD
- [ ] Publicaciones aparecen en la landing page
- [ ] Filtros por tipo funcionan
- [ ] Solo el autor puede editar/eliminar sus publicaciones
- [ ] Soft delete oculta la publicación de la landing

---

## 📞 CONTACTO Y SOPORTE

**Backend Developer:** [Tu nombre]  
**Dudas:** Consultar documentación en `/docs/PRUEBAS_PUBLICACIONES.md`

---

## 🚀 SIGUIENTE FASE

Una vez implementado:
1. ✅ Panel de administración para líderes
2. ✅ Sistema de notificaciones
3. ✅ Estadísticas de publicaciones más vistas
4. ✅ Comentarios en publicaciones

---

**¡Listo para implementar en el frontend!** 🎨
