# 📸 Sistema de Imágenes con Cloudinary - Gestión de Semilleros UCP

**Universidad Católica de Pereira - Backend de Gestión de Proyectos**

---

## 🎯 Objetivo

Implementar un sistema completo de gestión de imágenes usando **Cloudinary** para:
- ✅ Semilleros de Investigación
- ✅ Campos de Investigación  
- ✅ Proyectos
- ✅ Usuarios (avatares - futuro)

---

## 📋 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│  FLUJO DE SUBIDA DE IMÁGENES                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Admin sube imagen desde formulario (Frontend)       │
│           ↓                                              │
│  2. Multer recibe y valida archivo (Backend)            │
│           ↓                                              │
│  3. Archivo temporal en /uploads/temp/                  │
│           ↓                                              │
│  4. CloudinaryService sube a Cloudinary                 │
│           ↓                                              │
│  5. Cloudinary retorna URL pública                      │
│           ↓                                              │
│  6. URL se guarda en MySQL (ruta_imagen)                │
│           ↓                                              │
│  7. Archivo temporal se elimina (opcional)              │
│           ↓                                              │
│  8. Frontend muestra imagen desde URL de Cloudinary     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Paso 1: Configurar Credenciales

### **Opción A: Usar cuenta existente de CodeCommunity**

**Ventaja:** Ya está configurada
**Desventaja:** Compartirás espacio con otro proyecto

```env
# .env (BackendGestorProyectos)
CLOUDINARY_CLOUD_NAME=dw9krxrn4
CLOUDINARY_API_KEY=126699642837729
CLOUDINARY_API_SECRET=0xTjrN0MlI0T5SmJLOe0lHIw5NI
```

### **Opción B: Crear cuenta nueva (RECOMENDADO)**

1. Ve a https://cloudinary.com/users/register_free
2. Crea cuenta con email de UCP
3. Obtén credenciales en Dashboard → Settings → Access Keys
4. Actualiza `.env`

---

## 📁 Estructura de Carpetas en Cloudinary

### **Para evitar conflictos con CodeCommunity:**

```
Cloudinary Root
├── codecommunity/
│   ├── desafios/
│   └── soluciones/
│
└── semilleros-ucp/              ← NUEVO PROYECTO
    ├── semilleros/              ← Imágenes de semilleros
    ├── campos/                  ← Imágenes de campos de investigación
    ├── proyectos/               ← Imágenes de proyectos
    └── usuarios/                ← Avatares (futuro)
```

---

## 🛠️ Paso 2: Crear CloudinaryService

### **Archivo:** `src/services/CloudinaryService.js`

```javascript
// =====================================================
// SERVICIO DE CLOUDINARY
// Universidad Católica de Pereira
// Gestión de imágenes para Semilleros
// =====================================================

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Sube una imagen a Cloudinary y retorna la URL pública
 * @param {string} filePath - Ruta temporal del archivo subido por Multer
 * @param {string} tipo - Tipo de entidad: 'semilleros', 'campos', 'proyectos'
 * @returns {Promise<string>} URL pública de la imagen en Cloudinary
 */
const subirImagen = async (filePath, tipo = 'semilleros') => {
  try {
    // Carpeta base del proyecto
    const carpetaBase = 'semilleros-ucp';
    
    // Validar tipo
    const tiposPermitidos = ['semilleros', 'campos', 'proyectos', 'usuarios'];
    if (!tiposPermitidos.includes(tipo)) {
      throw new Error(`Tipo no válido. Permitidos: ${tiposPermitidos.join(', ')}`);
    }

    // Subir a Cloudinary
    const resultado = await cloudinary.uploader.upload(filePath, {
      folder: `${carpetaBase}/${tipo}`,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },  // Máximo 800x600
        { quality: 'auto:good' }                     // Optimización automática
      ]
    });

    // Eliminar archivo temporal
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return resultado.secure_url;
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    
    // Eliminar archivo temporal en caso de error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    throw new Error('Error al subir imagen a Cloudinary');
  }
};

/**
 * Elimina una imagen de Cloudinary dado su public_id
 * @param {string} imageUrl - URL completa de la imagen en Cloudinary
 * @returns {Promise<Object>} Resultado de la eliminación
 */
const eliminarImagen = async (imageUrl) => {
  try {
    // Extraer public_id de la URL
    // Ejemplo: https://res.cloudinary.com/dw9krxrn4/image/upload/v123/semilleros-ucp/semilleros/abc.jpg
    // Public ID: semilleros-ucp/semilleros/abc
    
    const parts = imageUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex === -1) {
      throw new Error('URL de imagen inválida');
    }

    // Tomar desde "upload" hasta el final, sin versión y sin extensión
    const publicIdParts = parts.slice(uploadIndex + 2); // Saltar "upload" y versión
    const publicIdWithExt = publicIdParts.join('/');
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.')); // Quitar extensión

    const resultado = await cloudinary.uploader.destroy(publicId);
    return resultado;
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw new Error('Error al eliminar imagen de Cloudinary');
  }
};

/**
 * Obtiene una URL optimizada de Cloudinary
 * @param {string} imageUrl - URL original de Cloudinary
 * @param {Object} transformaciones - Objeto con width, height, quality
 * @returns {string} URL transformada
 */
const obtenerUrlOptimizada = (imageUrl, { width = 400, height = 300, quality = 'auto' } = {}) => {
  // Insertar transformaciones en la URL
  const parts = imageUrl.split('/upload/');
  if (parts.length !== 2) return imageUrl;

  return `${parts[0]}/upload/w_${width},h_${height},c_fill,q_${quality}/${parts[1]}`;
};

module.exports = {
  subirImagen,
  eliminarImagen,
  obtenerUrlOptimizada
};
```

---

## 🔧 Paso 3: Actualizar Middleware de Upload

Tu middleware actual ya está bien, solo necesita crear la carpeta temporal:

```bash
# Crear carpeta temporal
mkdir uploads
mkdir uploads\temp
```

**Archivo:** `src/middlewares/upload.js` (ya lo tienes, solo verifica):

```javascript
// ✅ Tu configuración actual está perfecta
// Solo asegúrate que la carpeta 'uploads/temp/' exista
```

---

## 📝 Paso 4: Actualizar Controladores

### **A. Semilleros** (`src/controllers/semilleroController.js`)

```javascript
const { subirImagen, eliminarImagen } = require('../services/CloudinaryService');

// ========== CREAR SEMILLERO ==========
const createSemillero = async (req, res) => {
  try {
    const { nombre, lider, descripcion, contacto, lineas_investigacion_id } = req.body;
    let ruta_imagen = null;

    // Subir imagen a Cloudinary si existe
    if (req.file) {
      ruta_imagen = await subirImagen(req.file.path, 'semilleros');
    }

    const semillero = await Semillero.create({
      nombre,
      lider,
      descripcion,
      contacto,
      lineas_investigacion_id,
      ruta_imagen,  // URL de Cloudinary
      activo: 1
    });

    res.status(201).json({
      mensaje: 'Semillero creado exitosamente',
      semillero
    });
  } catch (error) {
    console.error('Error al crear semillero:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// ========== ACTUALIZAR SEMILLERO ==========
const updateSemillero = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, lider, descripcion, contacto, lineas_investigacion_id } = req.body;

    const semillero = await Semillero.findByPk(id);
    if (!semillero) {
      return res.status(404).json({ mensaje: 'Semillero no encontrado' });
    }

    // Si hay nueva imagen
    if (req.file) {
      // Eliminar imagen anterior de Cloudinary si existe
      if (semillero.ruta_imagen) {
        try {
          await eliminarImagen(semillero.ruta_imagen);
        } catch (error) {
          console.error('Error al eliminar imagen anterior:', error);
        }
      }

      // Subir nueva imagen
      const nuevaRutaImagen = await subirImagen(req.file.path, 'semilleros');
      semillero.ruta_imagen = nuevaRutaImagen;
    }

    // Actualizar otros campos
    semillero.nombre = nombre || semillero.nombre;
    semillero.lider = lider || semillero.lider;
    semillero.descripcion = descripcion || semillero.descripcion;
    semillero.contacto = contacto || semillero.contacto;
    semillero.lineas_investigacion_id = lineas_investigacion_id || semillero.lineas_investigacion_id;

    await semillero.save();

    res.json({
      mensaje: 'Semillero actualizado exitosamente',
      semillero
    });
  } catch (error) {
    console.error('Error al actualizar semillero:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// ========== ELIMINAR SEMILLERO ==========
const deleteSemillero = async (req, res) => {
  try {
    const { id } = req.params;
    const semillero = await Semillero.findByPk(id);

    if (!semillero) {
      return res.status(404).json({ mensaje: 'Semillero no encontrado' });
    }

    // Eliminar imagen de Cloudinary si existe
    if (semillero.ruta_imagen) {
      try {
        await eliminarImagen(semillero.ruta_imagen);
      } catch (error) {
        console.error('Error al eliminar imagen de Cloudinary:', error);
      }
    }

    await semillero.destroy();

    res.json({ mensaje: 'Semillero eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar semillero:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};
```

### **B. Campos de Investigación** (`src/controllers/campoController.js`)

```javascript
const { subirImagen, eliminarImagen } = require('../services/CloudinaryService');

// Similar a semilleros, pero usa tipo 'campos':
// await subirImagen(req.file.path, 'campos');
```

### **C. Proyectos** (`src/controllers/projectController.js`)

```javascript
const { subirImagen, eliminarImagen } = require('../services/CloudinaryService');

// Similar a semilleros, pero usa tipo 'proyectos':
// await subirImagen(req.file.path, 'proyectos');
```

---

## 🚀 Paso 5: Actualizar Rutas

### **Archivo:** `src/routes/semilleros.js`

```javascript
const express = require('express');
const router = express.Router();
const semilleroController = require('../controllers/semilleroController');
const { auth, isAdminSemillero } = require('../middlewares/authMiddleware');
const { upload, handleMulterError } = require('../middlewares/upload');

// Rutas públicas
router.get('/', semilleroController.getAllSemilleros);
router.get('/activos', semilleroController.getSemillerosActivos);
router.get('/:id', semilleroController.getSemilleroById);

// Rutas protegidas (requieren autenticación y rol Admin Semillero)
router.post(
  '/', 
  auth, 
  isAdminSemillero, 
  upload.single('imagen'),      // ← Multer intercepta la imagen
  handleMulterError,            // ← Maneja errores de Multer
  semilleroController.createSemillero
);

router.put(
  '/:id', 
  auth, 
  isAdminSemillero, 
  upload.single('imagen'), 
  handleMulterError,
  semilleroController.updateSemillero
);

router.delete(
  '/:id', 
  auth, 
  isAdminSemillero, 
  semilleroController.deleteSemillero
);

module.exports = router;
```

**Repite para `campos.js` y `projects.js`**

---

## 🎨 Paso 6: Frontend - Componente de Subida

### **Componente React con Preview:**

```jsx
import { useState } from 'react';

export const FormularioSemillero = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    lider: '',
    contacto: '',
    lineas_investigacion_id: ''
  });
  
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Manejar cambio de campos de texto
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Manejar selección de imagen
  const handleImagenChange = (e) => {
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

      setImagenFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Crear FormData para enviar archivo
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('lider', formData.lider);
      formDataToSend.append('contacto', formData.contacto);
      formDataToSend.append('lineas_investigacion_id', formData.lineas_investigacion_id);
      
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);  // ← Campo 'imagen' que espera Multer
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/semilleros', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NO incluir 'Content-Type': FormData lo maneja automáticamente
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        alert('Semillero creado exitosamente');
        // Resetear formulario
        setFormData({ nombre: '', descripcion: '', lider: '', contacto: '', lineas_investigacion_id: '' });
        setImagenPreview(null);
        setImagenFile(null);
      } else {
        alert(data.mensaje || 'Error al crear semillero');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear semillero');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-semillero">
      <h2>Crear Nuevo Semillero</h2>

      {/* Nombre */}
      <div className="form-group">
        <label>Nombre del Semillero:</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
      </div>

      {/* Descripción */}
      <div className="form-group">
        <label>Descripción:</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>

      {/* Líder (Select de usuarios con rol Admin Campo) */}
      <div className="form-group">
        <label>Líder:</label>
        <select
          name="lider"
          value={formData.lider}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar...</option>
          {/* Aquí mapeas los usuarios desde otro endpoint */}
        </select>
      </div>

      {/* Contacto */}
      <div className="form-group">
        <label>Contacto (Email):</label>
        <input
          type="email"
          name="contacto"
          value={formData.contacto}
          onChange={handleChange}
          required
        />
      </div>

      {/* Línea de investigación */}
      <div className="form-group">
        <label>Línea de Investigación:</label>
        <select
          name="lineas_investigacion_id"
          value={formData.lineas_investigacion_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar...</option>
          <option value="1">Desarrollo de Software</option>
          <option value="2">Inteligencia Artificial</option>
          <option value="3">Ciberseguridad</option>
          <option value="4">IoT y Sistemas Embebidos</option>
        </select>
      </div>

      {/* Imagen */}
      <div className="form-group">
        <label>Imagen del Semillero:</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImagenChange}
        />
        <small>Formatos permitidos: JPG, PNG, WebP. Máximo 5MB.</small>
      </div>

      {/* Preview de la imagen */}
      {imagenPreview && (
        <div className="imagen-preview">
          <p>Vista previa:</p>
          <img 
            src={imagenPreview} 
            alt="Preview" 
            style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
          />
          <button 
            type="button" 
            onClick={() => {
              setImagenPreview(null);
              setImagenFile(null);
            }}
            className="btn-remover"
          >
            ✕ Remover imagen
          </button>
        </div>
      )}

      {/* Botón de envío */}
      <button 
        type="submit" 
        disabled={loading}
        className="btn-submit"
      >
        {loading ? 'Guardando...' : 'Crear Semillero'}
      </button>
    </form>
  );
};
```

---

## 🎨 Estilos CSS para el Formulario

```css
.formulario-semillero {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.formulario-semillero h2 {
  color: #003366;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.85rem;
}

.imagen-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
}

.btn-remover {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: #003366;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-submit:hover {
  background: #00509e;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}
```

---

## ✅ Checklist de Implementación

### **Backend:**
- [ ] Instalar Cloudinary: `npm install cloudinary`
- [ ] Crear `.env` con credenciales de Cloudinary
- [ ] Crear carpeta `uploads/temp/`
- [ ] Crear `src/services/CloudinaryService.js`
- [ ] Actualizar controladores (semilleros, campos, proyectos)
- [ ] Actualizar rutas con `upload.single('imagen')`
- [ ] Probar endpoint con Postman

### **Frontend:**
- [ ] Crear componente `FormularioSemillero.jsx`
- [ ] Implementar preview de imagen
- [ ] Enviar FormData con fetch
- [ ] Manejar estados de loading
- [ ] Validar tamaño y tipo de archivo
- [ ] Aplicar estilos CSS

---

## 🧪 Prueba con Postman

### **POST http://localhost:5000/api/semilleros**

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Body (form-data):**
```
nombre: Semillero TechLab
descripcion: Semillero de desarrollo de software
lider: 2
contacto: techlab@ucp.edu.co
lineas_investigacion_id: 1
imagen: [seleccionar archivo .jpg]
```

**Response esperada:**
```json
{
  "mensaje": "Semillero creado exitosamente",
  "semillero": {
    "id": 4,
    "nombre": "Semillero TechLab",
    "ruta_imagen": "https://res.cloudinary.com/dw9krxrn4/image/upload/v1730912345/semilleros-ucp/semilleros/abc123.jpg",
    ...
  }
}
```

---

## 📊 Monitoreo en Cloudinary

**Dashboard:** https://console.cloudinary.com/

**Carpetas que deberías ver:**
```
semilleros-ucp/
├── semilleros/    (3 imágenes)
├── campos/        (5 imágenes)
└── proyectos/     (8 imágenes)
```

---

## 🚀 Siguiente Paso: Panel de Admin Completo

¿Quieres que te cree el documento para el **Panel de Administración completo** con:
- ✅ Tabla de semilleros con vista previa de imágenes
- ✅ Botones Crear/Editar/Eliminar
- ✅ Modal para formularios
- ✅ Drag & Drop para imágenes
- ✅ Filtros y búsqueda

---

**¡Con Cloudinary configurado, el sistema de imágenes queda profesional y escalable!** 🚀📸
