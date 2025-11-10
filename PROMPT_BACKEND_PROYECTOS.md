# 🔧 Requerimiento Backend: Incluir Proyectos en Endpoint de Campos

## � **URGENTE: PENDIENTE DE IMPLEMENTACIÓN**

**Fecha de verificación:** 7 de noviembre de 2025  
**Estado actual:** ❌ **NO IMPLEMENTADO**  
**Endpoint afectado:** `GET /api/campos/:id`

El endpoint actualmente **NO** devuelve los proyectos asociados al campo. El frontend está esperando recibir `campo.proyectos[]` pero el backend no lo está enviando.

---

## �📋 Contexto del Problema

Actualmente existe una inconsistencia de datos entre dos endpoints:

- ✅ `GET /api/projects` → Devuelve **todos** los proyectos correctamente con información del campo
- ❌ `GET /api/campos/:id` → **NO incluye** los proyectos asociados al campo en su respuesta

### 🐛 Impacto

- Los proyectos se muestran correctamente en la landing page (usa `/api/projects`)
- Los proyectos **NO aparecen** en la página de detalle del campo (usa `/api/campos/:id`)
- El usuario ve "Sistema de Gestión Universitaria" en la landing, pero al entrar al campo Full Stack no aparece

---

## 🎯 Requerimiento

Modificar el endpoint **`GET /api/campos/:id`** para que incluya un array `proyectos` con todos los proyectos asociados al campo.

### ⚠️ **IMPORTANTE: ACTUALMENTE NO FUNCIONA**

He verificado el endpoint y actualmente **NO está devolviendo el array de proyectos**:

**Respuesta actual del backend:**
```json
{
  "campo": {
    "id": 1,
    "nombre": "Desarrollo Web Full Stack",
    "lider": 21,
    "descripcion": "...",
    "ruta_imagen": "...",
    "semillero": { ... },
    "liderUsuario": { ... }
    // ❌ FALTA: "proyectos": []
    // ❌ FALTA: "integrantes": []
  }
}
```

**El frontend está esperando esta estructura pero no la está recibiendo.**

---

## 📊 Estructura de Respuesta Actual

```json
{
  "campo": {
    "id": 1,
    "nombre": "Desarrollo Web Full Stack",
    "descripcion": "...",
    "imagen": "...",
    "contacto_email": "...",
    "horario_atencion": "...",
    "ubicacion": "...",
    "telefono": "...",
    "facebook": "...",
    "instagram": "...",
    "linkedin": "...",
    "youtube": "...",
    "lider": {
      "id": 2,
      "nombre": "Carlos",
      "apellido": "Rodríguez",
      "email": "carlos@example.com"
    },
    "semillero": {
      "id": 1,
      "nombre": "Semillero de Desarrollo",
      "linea_investigacion": "Tecnologías Web"
    }
  }
}
```

---

## ✅ Estructura de Respuesta REQUERIDA

```json
{
  "campo": {
    "id": 1,
    "nombre": "Desarrollo Web Full Stack",
    "descripcion": "...",
    "imagen": "...",
    "contacto_email": "...",
    "horario_atencion": "...",
    "ubicacion": "...",
    "telefono": "...",
    "facebook": "...",
    "instagram": "...",
    "linkedin": "...",
    "youtube": "...",
    "lider": {
      "id": 2,
      "nombre": "Carlos",
      "apellido": "Rodríguez",
      "email": "carlos@example.com"
    },
    "semillero": {
      "id": 1,
      "nombre": "Semillero de Desarrollo",
      "linea_investigacion": "Tecnologías Web"
    },
    "proyectos": [
      {
        "id": 1,
        "titulo": "Sistema de Gestión Universitaria",
        "descripcion": "Plataforma web para gestión académica y administrativa",
        "imagen": "https://res.cloudinary.com/...",
        "estado": 1,
        "porcentaje_avance": 75,
        "url": "https://github.com/usuario/proyecto"
      },
      {
        "id": 2,
        "titulo": "App de Control de Inventario",
        "descripcion": "Sistema móvil para gestión de inventarios",
        "imagen": "https://res.cloudinary.com/...",
        "estado": 1,
        "porcentaje_avance": 50,
        "url": "https://github.com/usuario/inventario"
      }
    ]
  }
}
```

---

## 💻 Implementación Sugerida

### Opción 1: Query Única con JOIN y JSON_ARRAYAGG (MySQL 5.7.22+)

```sql
SELECT 
  c.id,
  c.nombre,
  c.descripcion,
  c.imagen,
  c.contacto_email,
  c.horario_atencion,
  c.ubicacion,
  c.telefono,
  c.facebook,
  c.instagram,
  c.linkedin,
  c.youtube,
  -- Líder del campo
  JSON_OBJECT(
    'id', u.id,
    'nombre', u.nombre,
    'apellido', u.apellido,
    'email', u.email
  ) as lider,
  -- Semillero
  JSON_OBJECT(
    'id', s.id,
    'nombre', s.nombre,
    'linea_investigacion', s.linea_investigacion
  ) as semillero,
  -- Proyectos del campo
  COALESCE(
    JSON_ARRAYAGG(
      CASE WHEN p.id IS NOT NULL THEN
        JSON_OBJECT(
          'id', p.id,
          'titulo', p.titulo,
          'descripcion', p.descripcion,
          'imagen', p.imagen,
          'estado', p.estado,
          'porcentaje_avance', p.porcentaje_avance,
          'url', p.url
        )
      END
    ),
    JSON_ARRAY()
  ) as proyectos
FROM campos_investigacion c
LEFT JOIN usuarios u ON c.lider = u.id
LEFT JOIN semilleros s ON c.id_semillero = s.id
LEFT JOIN proyectos p ON p.id_campo = c.id
WHERE c.id = ?
GROUP BY c.id;
```

### Opción 2: Dos Queries Separadas (Más Compatible)

```javascript
// controllers/camposController.js

const getCampoById = async (req, res) => {
  try {
    const { id } = req.params;

    // Query 1: Obtener campo con líder y semillero (código actual)
    const [campoRows] = await db.query(`
      SELECT 
        c.*,
        JSON_OBJECT(
          'id', u.id,
          'nombre', u.nombre,
          'apellido', u.apellido,
          'email', u.email
        ) as lider,
        JSON_OBJECT(
          'id', s.id,
          'nombre', s.nombre,
          'linea_investigacion', s.linea_investigacion
        ) as semillero
      FROM campos_investigacion c
      LEFT JOIN usuarios u ON c.lider = u.id
      LEFT JOIN semilleros s ON c.id_semillero = s.id
      WHERE c.id = ?
    `, [id]);

    if (campoRows.length === 0) {
      return res.status(404).json({ message: 'Campo no encontrado' });
    }

    const campo = campoRows[0];

    // Query 2: Obtener proyectos del campo
    const [proyectos] = await db.query(`
      SELECT 
        id,
        titulo,
        descripcion,
        imagen,
        estado,
        porcentaje_avance,
        url
      FROM proyectos
      WHERE id_campo = ?
      ORDER BY fecha_creacion DESC
    `, [id]);

    // Agregar proyectos al campo
    campo.proyectos = proyectos || [];

    return res.status(200).json({ campo });

  } catch (error) {
    console.error('Error al obtener campo:', error);
    return res.status(500).json({ 
      message: 'Error al obtener campo',
      error: error.message 
    });
  }
};
```

---

## ✅ Validaciones Requeridas

Por favor asegúrate de que:

1. ✅ El array `proyectos` **siempre esté presente** (aunque sea vacío `[]`, nunca `null` o `undefined`)
2. ✅ Cada proyecto incluya **todos los campos especificados**:
   - `id` (number)
   - `titulo` (string)
   - `descripcion` (string)
   - `imagen` (string | null)
   - `estado` (number: 1=activo, 0=inactivo)
   - `porcentaje_avance` (number: 0-100)
   - `url` (string | null)
3. ✅ Solo se incluyan proyectos donde `id_campo = campo.id`
4. ✅ El endpoint siga devolviendo correctamente la información del **líder** y **semillero**
5. ✅ Si el campo no tiene proyectos, debe devolver `proyectos: []`

---

## 🧪 Testing

### Prueba Manual

```bash
# GET campo con ID 1 (ejemplo: Full Stack)
curl -X GET http://localhost:3000/api/campos/1
```

### Respuesta Esperada

```json
{
  "campo": {
    "id": 1,
    "nombre": "Desarrollo Web Full Stack",
    "proyectos": [
      {
        "id": 1,
        "titulo": "Sistema de Gestión Universitaria",
        "descripcion": "...",
        "imagen": "...",
        "estado": 1,
        "porcentaje_avance": 75,
        "url": "https://github.com/..."
      }
    ]
  }
}
```

### Casos de Prueba

| Caso | Campo | Resultado Esperado |
|------|-------|-------------------|
| Campo con proyectos | Full Stack (ID: 1) | `proyectos: [...]` con array lleno |
| Campo sin proyectos | Inteligencia Artificial (ID: 3) | `proyectos: []` array vacío |
| Campo inexistente | ID: 9999 | Status 404 + mensaje error |

---

## 📝 Notas Adicionales

- El frontend ya está preparado para recibir esta estructura
- No es necesario modificar el endpoint `GET /api/projects` (funciona correctamente)
- Si usas Sequelize/ORM, agrega el `include`:

```javascript
Campo.findByPk(id, {
  include: [
    { model: Usuario, as: 'lider' },
    { model: Semillero, as: 'semillero' },
    { 
      model: Proyecto, 
      as: 'proyectos',
      attributes: ['id', 'titulo', 'descripcion', 'imagen', 'estado', 'porcentaje_avance', 'url']
    }
  ]
});
```

---

## 🚀 Prioridad

**CRÍTICA** - Esto está bloqueando la visualización correcta de proyectos en la página de detalle del campo.

### 📂 Archivo a Modificar

Busca en tu backend el archivo del controlador de campos, probablemente:
- `controllers/camposController.js` o
- `routes/campos.js` o  
- `api/campos/index.js`

Y modifica la función que maneja `GET /api/campos/:id` para agregar los proyectos.

### 🔍 Verificación Rápida

Después de implementar, ejecuta:
```bash
curl http://localhost:3000/api/campos/1
```

**Debes ver:**
```json
{
  "campo": {
    "id": 1,
    "proyectos": [...]  // ✅ Este array debe aparecer
  }
}
```

---

## 📞 Contacto

Si tienes dudas sobre la implementación, avísame y podemos revisarlo juntos.

---

**Fecha:** 7 de noviembre de 2025  
**Solicitado por:** Frontend Team  
**Estado:** Pendiente implementación
