# 🎨 Guía Frontend - FASE 3: Módulos Administrativos y CRUD

## 🎯 Objetivo
Implementar todos los módulos CRUD (Semilleros, Campos, Proyectos, Actividades, Asignaciones, Integrantes, Comentarios) con sus respectivos endpoints.

---

## 📁 1. SEMILLEROS

### 1.1 GET /semilleros
**Descripción:** Listar todos los semilleros (requiere autenticación)

```javascript
const getSemilleros = async () => {
  try {
    const response = await api.get('/semilleros');
    return response.data;
  } catch (error) {
    console.error('Error al obtener semilleros:', error);
    throw error;
  }
};

// Respuesta (200):
[
  {
    "id": 1,
    "nombre": "GISDEL",
    "descripcion": "Grupo de investigación...",
    "ruta_imagen": "https://...",
    "estado": "Activo",
    "fecha_creacion": "2024-01-15T00:00:00.000Z"
  }
]
```

### 1.2 GET /semilleros/:id
**Descripción:** Obtener detalle de un semillero

```javascript
const getSemilleroById = async (id) => {
  try {
    const response = await api.get(`/semilleros/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener semillero:', error);
    throw error;
  }
};

// Respuesta (200):
{
  "id": 1,
  "nombre": "GISDEL",
  "descripcion": "Grupo de investigación...",
  "ruta_imagen": "https://...",
  "estado": "Activo",
  "fecha_creacion": "2024-01-15T00:00:00.000Z"
}
```

### 1.3 POST /semilleros
**Descripción:** Crear semillero (Solo Admin Semillero)

```javascript
const createSemillero = async (data) => {
  try {
    const response = await api.post('/semilleros', {
      nombre: data.nombre,
      descripcion: data.descripcion,
      ruta_imagen: data.ruta_imagen, // URL de Cloudinary
      estado: data.estado || 'Activo'
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear semillero:', error);
    throw error;
  }
};

// Request Body:
{
  "nombre": "Nuevo Semillero",
  "descripcion": "Descripción del semillero...",
  "ruta_imagen": "https://res.cloudinary.com/.../imagen.jpg",
  "estado": "Activo"
}

// Respuesta (201):
{
  "message": "Semillero creado",
  "semillero": { /* datos del semillero */ }
}

// Errores:
// 400 - { "message": "Faltan campos requeridos" }
// 403 - { "message": "No autorizado" }
```

### 1.4 PUT /semilleros/:id
**Descripción:** Actualizar semillero (Solo Admin Semillero)

```javascript
const updateSemillero = async (id, data) => {
  try {
    const response = await api.put(`/semilleros/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar semillero:', error);
    throw error;
  }
};

// Request Body (enviar solo campos a actualizar):
{
  "nombre": "Nombre actualizado",
  "descripcion": "Nueva descripción",
  "estado": "Inactivo"
}

// Respuesta (200):
{
  "message": "Semillero actualizado"
}
```

### 1.5 DELETE /semilleros/:id
**Descripción:** Eliminar semillero (Solo Admin Semillero)

```javascript
const deleteSemillero = async (id) => {
  try {
    const response = await api.delete(`/semilleros/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar semillero:', error);
    throw error;
  }
};

// Respuesta (200):
{
  "message": "Semillero eliminado"
}
```

### 1.6 GET /semilleros/:id/proyectos
**Descripción:** Obtener proyectos de un semillero

```javascript
const getProyectosSemillero = async (id) => {
  try {
    const response = await api.get(`/semilleros/${id}/proyectos`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    throw error;
  }
};

// Respuesta (200):
[
  {
    "id": 1,
    "nombre": "Proyecto 1",
    "descripcion": "...",
    "estado": "En Progreso",
    "porcentaje_completado": 65
  }
]
```

### 1.7 GET /semilleros/:id/integrantes
**Descripción:** Obtener integrantes de un semillero

```javascript
const getIntegrantesSemillero = async (id) => {
  try {
    const response = await api.get(`/semilleros/${id}/integrantes`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener integrantes:', error);
    throw error;
  }
};

// Respuesta (200):
[
  {
    "id": 1,
    "id_usuario": 5,
    "estado": "Activo",
    "usuario": {
      "nombre": "Juan Pérez",
      "correo": "juan@ucp.edu.co"
    },
    "rol": {
      "nombre": "Colaborador"
    }
  }
]
```

---

## 🔬 2. CAMPOS DE INVESTIGACIÓN

### 2.1 GET /campos
**Descripción:** Listar todos los campos

```javascript
const getCampos = async () => {
  try {
    const response = await api.get('/campos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener campos:', error);
    throw error;
  }
};

// Respuesta (200):
[
  {
    "id": 1,
    "nombre": "Ingeniería de Software",
    "lider": 2,
    "descripcion": "Campo enfocado en...",
    "ruta_imagen": "https://...",
    "id_semillero": 1,
    "horario_reunion": "Miércoles 2:00 PM",
    "contacto_email": "campo@ucp.edu.co",
    "contacto_redes_sociales": { /* JSON */ }
  }
]
```

### 2.2 GET /campos/:id
**Descripción:** Obtener detalle de un campo

```javascript
const getCampoById = async (id) => {
  try {
    const response = await api.get(`/campos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener campo:', error);
    throw error;
  }
};
```

### 2.3 POST /campos
**Descripción:** Crear campo (Admin Semillero)

```javascript
const createCampo = async (data) => {
  try {
    const response = await api.post('/campos', {
      nombre: data.nombre,
      lider: data.lider, // ID del usuario líder
      descripcion: data.descripcion,
      ruta_imagen: data.ruta_imagen,
      id_semillero: data.id_semillero,
      horario_reunion: data.horario_reunion, // Opcional, max 200 caracteres
      contacto_email: data.contacto_email, // Opcional, debe ser email válido
      contacto_redes_sociales: data.contacto_redes_sociales // Opcional, JSON válido
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear campo:', error);
    throw error;
  }
};

// Request Body:
{
  "nombre": "Inteligencia Artificial",
  "lider": 3,
  "descripcion": "Campo enfocado en IA...",
  "ruta_imagen": "https://res.cloudinary.com/.../campo.jpg",
  "id_semillero": 1,
  "horario_reunion": "Miércoles 2:00 PM - 4:00 PM, Edificio 7, Sala 301",
  "contacto_email": "campo.ia@ucp.edu.co",
  "contacto_redes_sociales": {
    "facebook": "https://facebook.com/campoIA",
    "instagram": "https://instagram.com/campo_ia",
    "website": "https://campo-ia.ucp.edu.co"
  }
}

// Respuesta (201):
{
  "message": "Campo de investigación creado",
  "campo": { /* datos del campo */ }
}

// Errores:
// 400 - Email no válido
// 400 - Redes sociales no válidas (solo se permiten: facebook, instagram, twitter, linkedin, website, youtube, github)
```

### 2.4 PUT /campos/:id
**Descripción:** Actualizar campo (Admin Semillero o Admin del Campo)

```javascript
const updateCampo = async (id, data) => {
  try {
    const response = await api.put(`/campos/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar campo:', error);
    throw error;
  }
};

// Request Body (enviar solo lo que se actualiza):
{
  "nombre": "Nuevo nombre",
  "descripcion": "Nueva descripción",
  "horario_reunion": "Viernes 3:00 PM"
}
```

### 2.5 DELETE /campos/:id
**Descripción:** Eliminar campo (Admin Semillero)

```javascript
const deleteCampo = async (id) => {
  try {
    const response = await api.delete(`/campos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar campo:', error);
    throw error;
  }
};
```

### 2.6 GET /campos/:id/proyectos
**Descripción:** Obtener proyectos de un campo

```javascript
const getProyectosCampo = async (id) => {
  try {
    const response = await api.get(`/campos/${id}/proyectos`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    throw error;
  }
};
```

### 2.7 GET /campos/:id/integrantes
**Descripción:** Obtener integrantes de un campo

```javascript
const getintegrantesCampo = async (id) => {
  try {
    const response = await api.get(`/campos/${id}/integrantes`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener integrantes:', error);
    throw error;
  }
};
```

### 2.8 PUT /campo-management/:id/horario
**Descripción:** Actualizar solo el horario (Delegado o superior)

```javascript
const updateHorarioCampo = async (id, horario) => {
  try {
    const response = await api.put(`/campo-management/${id}/horario`, {
      horario_reunion: horario
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar horario:', error);
    throw error;
  }
};

// Request Body:
{
  "horario_reunion": "Viernes 3:00 PM - 5:00 PM, Virtual (Google Meet)"
}

// Respuesta (200):
{
  "message": "Horario de reunión actualizado exitosamente",
  "horario_reunion": "Viernes 3:00 PM - 5:00 PM, Virtual (Google Meet)"
}
```

### 2.9 PUT /campo-management/:id/contacto
**Descripción:** Actualizar información de contacto (Delegado o superior)

```javascript
const updateContactoCampo = async (id, contacto) => {
  try {
    const response = await api.put(`/campo-management/${id}/contacto`, {
      contacto_email: contacto.email,
      contacto_redes_sociales: contacto.redes
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar contacto:', error);
    throw error;
  }
};

// Request Body:
{
  "contacto_email": "nuevo.email@ucp.edu.co",
  "contacto_redes_sociales": {
    "instagram": "https://instagram.com/campo",
    "website": "https://campo.ucp.edu.co"
  }
}

// Respuesta (200):
{
  "message": "Información de contacto actualizada exitosamente",
  "contacto": {
    "email": "nuevo.email@ucp.edu.co",
    "redes_sociales": { /* ... */ }
  }
}
```

### 2.10 GET /campo-management/:id/info-completa
**Descripción:** Obtener toda la información del campo

```javascript
const getInfoCompletaCampo = async (id) => {
  try {
    const response = await api.get(`/campo-management/${id}/info-completa`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener info:', error);
    throw error;
  }
};
```

---

## 📂 3. PROYECTOS

### 3.1 GET /proyectos
**Descripción:** Listar todos los proyectos

```javascript
const getProyectos = async () => {
  try {
    const response = await api.get('/proyectos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    throw error;
  }
};

// Respuesta (200):
[
  {
    "id": 1,
    "nombre": "Sistema de Gestión",
    "descripcion": "Plataforma web...",
    "ruta_imagen": "https://...",
    "fecha_inicio": "2024-01-15",
    "fecha_fin": "2024-12-15",
    "estado": "En Progreso",
    "porcentaje_completado": 65,
    "id_campo": 1
  }
]
```

### 3.2 GET /proyectos/:id
**Descripción:** Obtener detalle de un proyecto

```javascript
const getProyectoById = async (id) => {
  try {
    const response = await api.get(`/proyectos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    throw error;
  }
};
```

### 3.3 POST /proyectos
**Descripción:** Crear proyecto (Delegado o superior)

```javascript
const createProyecto = async (data) => {
  try {
    const response = await api.post('/proyectos', {
      nombre: data.nombre,
      descripcion: data.descripcion,
      ruta_imagen: data.ruta_imagen,
      fecha_inicio: data.fecha_inicio, // Formato: YYYY-MM-DD
      fecha_fin: data.fecha_fin, // Formato: YYYY-MM-DD
      estado: data.estado || 'Planificación',
      porcentaje_completado: data.porcentaje_completado || 0,
      id_campo: data.id_campo
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    throw error;
  }
};

// Request Body:
{
  "nombre": "Sistema de Gestión de Proyectos",
  "descripcion": "Plataforma web para gestionar proyectos de investigación",
  "ruta_imagen": "https://res.cloudinary.com/.../proyecto.jpg",
  "fecha_inicio": "2024-01-15",
  "fecha_fin": "2024-12-15",
  "estado": "Planificación",
  "porcentaje_completado": 0,
  "id_campo": 1
}

// Respuesta (201):
{
  "message": "Proyecto creado",
  "proyecto": { /* datos del proyecto */ }
}
```

### 3.4 PUT /proyectos/:id
**Descripción:** Actualizar proyecto (Delegado o superior)

```javascript
const updateProyecto = async (id, data) => {
  try {
    const response = await api.put(`/proyectos/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    throw error;
  }
};
```

### 3.5 DELETE /proyectos/:id
**Descripción:** Eliminar proyecto (Delegado o superior)

```javascript
const deleteProyecto = async (id) => {
  try {
    const response = await api.delete(`/proyectos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    throw error;
  }
};
```

### 3.6 GET /proyectos/:id/actividades
**Descripción:** Obtener actividades de un proyecto

```javascript
const getActividadesProyecto = async (id) => {
  try {
    const response = await api.get(`/proyectos/${id}/actividades`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    throw error;
  }
};

// Respuesta (200):
[
  {
    "id": 1,
    "nombre": "Diseño de base de datos",
    "descripcion": "Crear el diagrama ER...",
    "fecha_inicio": "2024-01-20",
    "fecha_fin": "2024-02-01",
    "estado": "Completada",
    "prioridad": "Alta",
    "porcentaje_completado": 100
  }
]
```

### 3.7 GET /proyectos/:id/asignaciones
**Descripción:** Obtener asignaciones de un proyecto

```javascript
const getAsignacionesProyecto = async (id) => {
  try {
    const response = await api.get(`/proyectos/${id}/asignaciones`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    throw error;
  }
};
```

### 3.8 GET /proyectos/:id/progreso
**Descripción:** Obtener progreso detallado de un proyecto

```javascript
const getProgresoProyecto = async (id) => {
  try {
    const response = await api.get(`/proyectos/${id}/progreso`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    throw error;
  }
};

// Respuesta (200):
{
  "proyecto": {
    "id": 1,
    "nombre": "Sistema de Gestión",
    "porcentaje_completado": 65
  },
  "actividades": {
    "total": 12,
    "completadas": 8,
    "en_progreso": 3,
    "pendientes": 1
  },
  "asignaciones": {
    "total": 20,
    "completadas": 15,
    "pendientes": 5
  },
  "diasRestantes": 180
}
```

### 3.9 PUT /proyectos/:id/completar
**Descripción:** Marcar proyecto como completado (Delegado o superior)

```javascript
const completarProyecto = async (id) => {
  try {
    const response = await api.put(`/proyectos/${id}/completar`);
    return response.data;
  } catch (error) {
    console.error('Error al completar proyecto:', error);
    throw error;
  }
};

// Respuesta (200):
{
  "message": "Proyecto marcado como completado",
  "proyecto": {
    "id": 1,
    "estado": "Completado",
    "porcentaje_completado": 100
  }
}
```

---

## ✅ 4. ACTIVIDADES

### 4.1 GET /actividades
**Descripción:** Listar todas las actividades

```javascript
const getActividades = async () => {
  try {
    const response = await api.get('/actividades');
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    throw error;
  }
};
```

### 4.2 GET /actividades/:id
**Descripción:** Obtener detalle de una actividad

```javascript
const getActividadById = async (id) => {
  try {
    const response = await api.get(`/actividades/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    throw error;
  }
};
```

### 4.3 POST /actividades
**Descripción:** Crear actividad (Delegado o superior)

```javascript
const createActividad = async (data) => {
  try {
    const response = await api.post('/actividades', {
      nombre: data.nombre,
      descripcion: data.descripcion,
      fecha_inicio: data.fecha_inicio, // YYYY-MM-DD
      fecha_fin: data.fecha_fin, // YYYY-MM-DD
      estado: data.estado || 'Pendiente',
      prioridad: data.prioridad || 'Media', // Baja, Media, Alta
      porcentaje_completado: data.porcentaje_completado || 0,
      id_proyecto: data.id_proyecto
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear actividad:', error);
    throw error;
  }
};

// Request Body:
{
  "nombre": "Diseño de base de datos",
  "descripcion": "Crear el diagrama ER y el script SQL",
  "fecha_inicio": "2024-01-20",
  "fecha_fin": "2024-02-01",
  "estado": "Pendiente",
  "prioridad": "Alta",
  "porcentaje_completado": 0,
  "id_proyecto": 1
}

// Respuesta (201):
{
  "message": "Actividad creada",
  "actividad": { /* datos de la actividad */ }
}
```

### 4.4 PUT /actividades/:id
**Descripción:** Actualizar actividad (Delegado o superior)

```javascript
const updateActividad = async (id, data) => {
  try {
    const response = await api.put(`/actividades/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    throw error;
  }
};
```

### 4.5 DELETE /actividades/:id
**Descripción:** Eliminar actividad (Delegado o superior)

```javascript
const deleteActividad = async (id) => {
  try {
    const response = await api.delete(`/actividades/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    throw error;
  }
};
```

### 4.6 PUT /actividades/:id/completar
**Descripción:** Marcar actividad como completada (Delegado o superior)

```javascript
const completarActividad = async (id) => {
  try {
    const response = await api.put(`/actividades/${id}/completar`);
    return response.data;
  } catch (error) {
    console.error('Error al completar actividad:', error);
    throw error;
  }
};

// Respuesta (200):
{
  "message": "Actividad completada",
  "actividad": {
    "id": 1,
    "estado": "Completada",
    "porcentaje_completado": 100
  }
}
```

### 4.7 GET /actividades/:id/asignaciones
**Descripción:** Obtener asignaciones de una actividad

```javascript
const getAsignacionesActividad = async (id) => {
  try {
    const response = await api.get(`/actividades/${id}/asignaciones`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    throw error;
  }
};

// Respuesta (200):
[
  {
    "id": 1,
    "id_actividad": 1,
    "id_integrante": 5,
    "fecha_asignacion": "2024-01-20",
    "fecha_completada": null,
    "estado": "Pendiente",
    "comentarios": null,
    "integrante": {
      "usuario": {
        "nombre": "Juan Pérez",
        "correo": "juan@ucp.edu.co"
      }
    }
  }
]
```

---

## 👥 5. ASIGNACIONES

### 5.1 GET /asignaciones
**Descripción:** Listar todas las asignaciones

```javascript
const getAsignaciones = async () => {
  try {
    const response = await api.get('/asignaciones');
    return response.data;
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    throw error;
  }
};
```

### 5.2 GET /asignaciones/:id
**Descripción:** Obtener detalle de una asignación

```javascript
const getAsignacionById = async (id) => {
  try {
    const response = await api.get(`/asignaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener asignación:', error);
    throw error;
  }
};
```

### 5.3 POST /asignaciones
**Descripción:** Crear asignación (Delegado o superior)

```javascript
const createAsignacion = async (data) => {
  try {
    const response = await api.post('/asignaciones', {
      id_actividad: data.id_actividad,
      id_integrante: data.id_integrante,
      fecha_asignacion: data.fecha_asignacion || new Date().toISOString().split('T')[0],
      estado: data.estado || 'Pendiente',
      comentarios: data.comentarios || null
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear asignación:', error);
    throw error;
  }
};

// Request Body:
{
  "id_actividad": 1,
  "id_integrante": 5,
  "fecha_asignacion": "2024-01-20",
  "estado": "Pendiente",
  "comentarios": "Por favor revisar el documento adjunto"
}

// Respuesta (201):
{
  "message": "Asignación creada",
  "asignacion": { /* datos de la asignación */ }
}
```

### 5.4 PUT /asignaciones/:id
**Descripción:** Actualizar asignación (Delegado o superior)

```javascript
const updateAsignacion = async (id, data) => {
  try {
    const response = await api.put(`/asignaciones/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    throw error;
  }
};
```

### 5.5 DELETE /asignaciones/:id
**Descripción:** Eliminar asignación (Delegado o superior)

```javascript
const deleteAsignacion = async (id) => {
  try {
    const response = await api.delete(`/asignaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    throw error;
  }
};
```

### 5.6 PUT /asignaciones/:id/estado
**Descripción:** Cambiar estado de asignación (Colaborador puede completar las propias)

```javascript
const cambiarEstadoAsignacion = async (id, nuevoEstado) => {
  try {
    const response = await api.put(`/asignaciones/${id}/estado`, {
      estado: nuevoEstado // 'Pendiente', 'En Progreso', 'Completada'
    });
    return response.data;
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    throw error;
  }
};

// Request Body:
{
  "estado": "Completada"
}

// Respuesta (200):
{
  "message": "Estado de asignación actualizado",
  "asignacion": {
    "id": 1,
    "estado": "Completada",
    "fecha_completada": "2024-02-01T10:30:00.000Z"
  }
}
```

---

## 👤 6. INTEGRANTES

### 6.1 GET /integrantes
**Descripción:** Listar todos los integrantes

```javascript
const getIntegrantes = async () => {
  try {
    const response = await api.get('/integrantes');
    return response.data;
  } catch (error) {
    console.error('Error al obtener integrantes:', error);
    throw error;
  }
};
```

### 6.2 GET /integrantes/:id
**Descripción:** Obtener detalle de un integrante

```javascript
const getIntegranteById = async (id) => {
  try {
    const response = await api.get(`/integrantes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener integrante:', error);
    throw error;
  }
};
```

### 6.3 POST /integrantes
**Descripción:** Agregar integrante a un campo (Admin Campo o superior)

```javascript
const createIntegrante = async (data) => {
  try {
    const response = await api.post('/integrantes', {
      id_usuario: data.id_usuario,
      id_campo: data.id_campo,
      id_rol: data.id_rol,
      fecha_ingreso: data.fecha_ingreso || new Date().toISOString().split('T')[0],
      estado: data.estado || 'Activo'
    });
    return response.data;
  } catch (error) {
    console.error('Error al agregar integrante:', error);
    throw error;
  }
};

// Request Body:
{
  "id_usuario": 5,
  "id_campo": 1,
  "id_rol": 4, // Colaborador
  "fecha_ingreso": "2024-01-20",
  "estado": "Activo"
}

// Respuesta (201):
{
  "message": "Integrante agregado",
  "integrante": { /* datos del integrante */ }
}
```

### 6.4 PUT /integrantes/:id
**Descripción:** Actualizar integrante (Admin Campo o superior)

```javascript
const updateIntegrante = async (id, data) => {
  try {
    const response = await api.put(`/integrantes/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar integrante:', error);
    throw error;
  }
};
```

### 6.5 DELETE /integrantes/:id
**Descripción:** Eliminar integrante (Admin Campo o superior)

```javascript
const deleteIntegrante = async (id) => {
  try {
    const response = await api.delete(`/integrantes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar integrante:', error);
    throw error;
  }
};
```

### 6.6 PUT /integrantes/:id/activar
**Descripción:** Activar integrante (Admin Campo o superior)

```javascript
const activarIntegrante = async (id) => {
  try {
    const response = await api.put(`/integrantes/${id}/activar`);
    return response.data;
  } catch (error) {
    console.error('Error al activar integrante:', error);
    throw error;
  }
};

// Respuesta (200):
{
  "message": "Integrante activado",
  "integrante": {
    "id": 1,
    "estado": "Activo",
    "fecha_salida": null
  }
}
```

### 6.7 PUT /integrantes/:id/desactivar
**Descripción:** Desactivar integrante (Admin Campo o superior)

```javascript
const desactivarIntegrante = async (id) => {
  try {
    const response = await api.put(`/integrantes/${id}/desactivar`);
    return response.data;
  } catch (error) {
    console.error('Error al desactivar integrante:', error);
    throw error;
  }
};

// Respuesta (200):
{
  "message": "Integrante desactivado",
  "integrante": {
    "id": 1,
    "estado": "Inactivo",
    "fecha_salida": "2024-02-15T10:30:00.000Z"
  }
}
```

### 6.8 PUT /integrantes/:id/transferir
**Descripción:** Transferir integrante a otro campo (Admin Semillero)

```javascript
const transferirIntegrante = async (id, nuevoCampoId) => {
  try {
    const response = await api.put(`/integrantes/${id}/transferir`, {
      nuevo_campo_id: nuevoCampoId
    });
    return response.data;
  } catch (error) {
    console.error('Error al transferir integrante:', error);
    throw error;
  }
};

// Request Body:
{
  "nuevo_campo_id": 2
}

// Respuesta (200):
{
  "message": "Integrante transferido exitosamente",
  "integrante": {
    "id": 1,
    "id_campo": 2
  }
}
```

---

## 💬 7. COMENTARIOS

### 7.1 GET /comentarios
**Descripción:** Listar todos los comentarios

```javascript
const getComentarios = async () => {
  try {
    const response = await api.get('/comentarios');
    return response.data;
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    throw error;
  }
};
```

### 7.2 GET /comentarios/:id
**Descripción:** Obtener detalle de un comentario

```javascript
const getComentarioById = async (id) => {
  try {
    const response = await api.get(`/comentarios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener comentario:', error);
    throw error;
  }
};
```

### 7.3 POST /comentarios
**Descripción:** Crear comentario (Todos los usuarios autenticados)

```javascript
const createComentario = async (data) => {
  try {
    const response = await api.post('/comentarios', {
      contenido: data.contenido,
      id_usuario: data.id_usuario, // Se puede obtener del token
      id_actividad: data.id_actividad, // Opcional
      id_proyecto: data.id_proyecto // Opcional
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear comentario:', error);
    throw error;
  }
};

// Request Body (comentario en actividad):
{
  "contenido": "Excelente trabajo en esta actividad!",
  "id_usuario": 5,
  "id_actividad": 1
}

// O comentario en proyecto:
{
  "contenido": "El proyecto va muy bien",
  "id_usuario": 5,
  "id_proyecto": 1
}

// Respuesta (201):
{
  "message": "Comentario creado",
  "comentario": { /* datos del comentario */ }
}
```

### 7.4 PUT /comentarios/:id
**Descripción:** Actualizar comentario (Solo el autor o Admin)

```javascript
const updateComentario = async (id, contenido) => {
  try {
    const response = await api.put(`/comentarios/${id}`, {
      contenido: contenido
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    throw error;
  }
};
```

### 7.5 DELETE /comentarios/:id
**Descripción:** Eliminar comentario (Solo el autor o Admin)

```javascript
const deleteComentario = async (id) => {
  try {
    const response = await api.delete(`/comentarios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    throw error;
  }
};
```

---

## ✅ Checklist Fase 3

- [ ] Implementar CRUD de Semilleros
- [ ] Implementar CRUD de Campos (incluyendo gestión específica)
- [ ] Implementar CRUD de Proyectos
- [ ] Implementar CRUD de Actividades
- [ ] Implementar CRUD de Asignaciones
- [ ] Implementar CRUD de Integrantes
- [ ] Implementar CRUD de Comentarios
- [ ] Crear formularios para cada entidad
- [ ] Implementar validaciones en frontend
- [ ] Mostrar/Ocultar opciones según permisos
- [ ] Implementar notificaciones de éxito/error
- [ ] Probar todos los endpoints

---

*Continúa en GUIA_FRONTEND_FASE4.md...*
