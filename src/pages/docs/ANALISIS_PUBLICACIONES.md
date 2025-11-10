# 📊 ANÁLISIS DE ESTRUCTURA ACTUAL Y PLAN DE MODIFICACIÓN

**Universidad Católica de Pereira - Sistema de Gestión de Semilleros**

---

## 🔍 **ANÁLISIS DE LO QUE TIENES ACTUALMENTE:**

### ✅ **Tablas Existentes que SÍ NECESITAS:**
1. ✅ `usuarios` - Para todos los usuarios del sistema
2. ✅ `roles` - Admin Semillero, Admin Campo, Delegado, Colaborador
3. ✅ `semilleros` - Con líder y ruta_imagen ✅
4. ✅ `campos_investigacion` - Con líder y ruta_imagen ✅
5. ✅ `proyectos` - Para los proyectos de cada campo
6. ✅ `integrantes` - Relación usuarios-campos-roles
7. ✅ `actividades` - Tareas y actividades
8. ✅ `estados` - Estados de proyectos/actividades
9. ✅ `lineas_investigacion` - IA, Software, etc.

### ❌ **Tablas que NO NECESITAS (pero no hacen daño):**
- `actividades_usuarios` - Relación muchos a muchos de actividades
- `comentarios` - Comentarios en actividades
- `historial_actividades` - Log de cambios

### 🆕 **TABLA QUE NECESITAS CREAR:**
- ❌ **NO EXISTE:** `publicaciones` (para eventos/logros de cada campo)

---

## 🎯 **LO QUE NECESITAS IMPLEMENTAR:**

### **1. Sistema de Publicaciones por Campo de Investigación**

**Características requeridas:**
- ✅ Cada líder de campo puede crear publicaciones
- ✅ Máximo 3 imágenes por publicación
- ✅ Descripción de la publicación
- ✅ Tipo: Evento, Logro, Noticia, etc.
- ✅ Fecha de publicación
- ✅ Visible públicamente en la landing

---

## 📋 **NUEVA TABLA: `publicaciones`**

```sql
CREATE TABLE IF NOT EXISTS `publicaciones` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `id_campo` INT NOT NULL,                          -- Campo al que pertenece
    `id_usuario` INT NOT NULL,                        -- Líder que publica
    `titulo` VARCHAR(200) NOT NULL,                   -- Título de la publicación
    `descripcion` TEXT NOT NULL,                      -- Descripción del evento/logro
    `tipo` ENUM('Evento', 'Logro', 'Noticia', 'Otro') DEFAULT 'Evento',
    `imagen_1` VARCHAR(255) NULL DEFAULT NULL,        -- URL Cloudinary imagen 1
    `imagen_2` VARCHAR(255) NULL DEFAULT NULL,        -- URL Cloudinary imagen 2
    `imagen_3` VARCHAR(255) NULL DEFAULT NULL,        -- URL Cloudinary imagen 3
    `fecha_publicacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `activo` TINYINT(1) DEFAULT 1,                    -- Soft delete
    PRIMARY KEY (`id`),
    INDEX `idx_campo` (`id_campo`),
    INDEX `idx_usuario` (`id_usuario`),
    INDEX `idx_fecha` (`fecha_publicacion` DESC),
    CONSTRAINT `publicaciones_ibfk_1` 
        FOREIGN KEY (`id_campo`) 
        REFERENCES `campos_investigacion` (`id`) 
        ON DELETE CASCADE,
    CONSTRAINT `publicaciones_ibfk_2` 
        FOREIGN KEY (`id_usuario`) 
        REFERENCES `usuarios` (`id`) 
        ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
```

### **Índices para optimizar queries:**
- `idx_campo` - Para filtrar publicaciones por campo
- `idx_usuario` - Para ver publicaciones de un líder
- `idx_fecha` - Para ordenar por más recientes

---

## 🔧 **VALIDACIÓN DE ESTRUCTURA ACTUAL:**

### ✅ **`campos_investigacion` - YA ESTÁ BIEN:**
```sql
`id` INT
`nombre` VARCHAR(100)
`lider` INT                     ✅ Líder del campo
`descripcion` TEXT              ✅ Descripción del campo
`ruta_imagen` VARCHAR(255)      ✅ Foto del campo (1 imagen)
`id_semillero` INT
```

**Esto ya permite:**
- ✅ Líder de campo asignado
- ✅ Subir 1 imagen del campo
- ✅ Descripción del campo

### ✅ **`semilleros` - YA ESTÁ BIEN:**
```sql
`id` INT
`nombre` VARCHAR(100)
`lider` INT                     ✅ Líder del semillero
`ruta_imagen` VARCHAR(255)      ✅ Foto del semillero
`descripcion` TEXT              ✅ Descripción
`contacto` VARCHAR(100)
`lineas_investigacion_id` INT
`activo` TINYINT(1)             ← ⚠️ FALTA AGREGAR ESTA COLUMNA
```

**⚠️ PROBLEMA DETECTADO:**
La columna `activo` NO existe en tu `bd.sql` pero la usamos en los scripts de seed.

---

## 🛠️ **SCRIPTS SQL NECESARIOS:**

### **SCRIPT 1: Agregar columna `activo` a semilleros (si no existe)**
```sql
-- Verificar si la columna existe primero, si no, agregarla
ALTER TABLE `semilleros` 
ADD COLUMN IF NOT EXISTS `activo` TINYINT(1) DEFAULT 1 AFTER `creado_en`;
```

### **SCRIPT 2: Crear tabla `publicaciones`**
```sql
USE `gestion_proyectos_db`;

CREATE TABLE IF NOT EXISTS `publicaciones` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `id_campo` INT NOT NULL,
    `id_usuario` INT NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `tipo` ENUM('Evento', 'Logro', 'Noticia', 'Otro') DEFAULT 'Evento',
    `imagen_1` VARCHAR(255) NULL DEFAULT NULL,
    `imagen_2` VARCHAR(255) NULL DEFAULT NULL,
    `imagen_3` VARCHAR(255) NULL DEFAULT NULL,
    `fecha_publicacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `activo` TINYINT(1) DEFAULT 1,
    PRIMARY KEY (`id`),
    INDEX `idx_campo` (`id_campo`),
    INDEX `idx_usuario` (`id_usuario`),
    INDEX `idx_fecha` (`fecha_publicacion` DESC),
    CONSTRAINT `publicaciones_ibfk_1` 
        FOREIGN KEY (`id_campo`) 
        REFERENCES `campos_investigacion` (`id`) 
        ON DELETE CASCADE,
    CONSTRAINT `publicaciones_ibfk_2` 
        FOREIGN KEY (`id_usuario`) 
        REFERENCES `usuarios` (`id`) 
        ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
```

### **SCRIPT 3: Insertar publicaciones de prueba**
```sql
USE `gestion_proyectos_db`;

-- Publicación 1: Evento del campo "Desarrollo Web Full Stack"
INSERT INTO `publicaciones` 
(id_campo, id_usuario, titulo, descripcion, tipo, imagen_1, imagen_2, imagen_3) 
VALUES 
(1, 2, 'Taller de React JS 2024', 
 'Se llevó a cabo el taller de React JS con la participación de 50 estudiantes. Se abordaron temas como Hooks, Context API y Redux. Los estudiantes desarrollaron proyectos prácticos y recibieron certificados de participación.',
 'Evento', 
 NULL, NULL, NULL);

-- Publicación 2: Logro del campo "Machine Learning Aplicado"
INSERT INTO `publicaciones` 
(id_campo, id_usuario, titulo, descripcion, tipo, imagen_1, imagen_2) 
VALUES 
(2, 3, 'Primer Lugar en Competencia Nacional de IA', 
 'Nuestro equipo de Machine Learning obtuvo el primer lugar en la competencia nacional de Inteligencia Artificial organizada por la Universidad Nacional. El proyecto consistió en un modelo de predicción de deserción estudiantil con 95% de precisión.',
 'Logro', 
 NULL, NULL);

-- Publicación 3: Noticia del campo "Desarrollo Mobile"
INSERT INTO `publicaciones` 
(id_campo, id_usuario, titulo, descripcion, tipo, imagen_1, imagen_2, imagen_3) 
VALUES 
(3, 5, 'Lanzamiento de App Universitaria', 
 'Se lanzó oficialmente la aplicación móvil de eventos universitarios desarrollada por nuestro campo de investigación. La app cuenta con más de 1000 descargas en su primera semana y está disponible en iOS y Android.',
 'Noticia', 
 NULL, NULL, NULL);
```

---

## 📝 **SERVICIOS/CONTROLADORES QUE NECESITAS:**

### ✅ **Controladores Existentes que Puedes Reutilizar:**
1. ✅ `semilleroController.js` - Para gestión de semilleros
2. ✅ `campoController.js` - Para gestión de campos
3. ✅ `projectController.js` - Para proyectos
4. ✅ `publicController.js` - Para endpoints públicos (landing)

### 🆕 **Nuevo Controlador a Crear:**
1. ❌ `publicacionController.js` - Para gestionar publicaciones

---

## 🎯 **FUNCIONALIDADES A IMPLEMENTAR:**

### **1. Gestión de Campos de Investigación (YA EXISTE - MEJORAR)**

**Endpoints actuales:**
- `GET /api/campos` - Listar todos los campos ✅
- `GET /api/campos/:id` - Detalle de un campo ✅
- `POST /api/campos` - Crear campo (Admin Semillero) ✅
- `PUT /api/campos/:id` - Actualizar campo (Admin Campo) ✅
- `DELETE /api/campos/:id` - Eliminar campo ✅

**Lo que FALTA:**
- ✅ Integrar subida de imagen con Cloudinary
- ✅ Permitir al líder del campo actualizar descripción e imagen

---

### **2. Sistema de Publicaciones (NUEVO - CREAR)**

**Endpoints necesarios:**

#### **Públicos (Landing Page):**
- `GET /api/publicaciones` - Todas las publicaciones activas
- `GET /api/publicaciones/campo/:id` - Publicaciones de un campo
- `GET /api/publicaciones/:id` - Detalle de una publicación

#### **Protegidos (Admin Campo):**
- `POST /api/publicaciones` - Crear publicación (solo líder del campo)
- `PUT /api/publicaciones/:id` - Editar publicación (solo autor)
- `DELETE /api/publicaciones/:id` - Eliminar publicación (soft delete)
- `PATCH /api/publicaciones/:id/estado` - Activar/Desactivar publicación

---

## 🚀 **PLAN DE IMPLEMENTACIÓN:**

### **FASE 1: Actualizar Base de Datos (15 minutos)**
1. ✅ Ejecutar script para agregar columna `activo` a semilleros
2. ✅ Ejecutar script para crear tabla `publicaciones`
3. ✅ Ejecutar script para insertar publicaciones de prueba
4. ✅ Verificar en MySQL Workbench

### **FASE 2: Crear Carpeta en Cloudinary (5 minutos)**
1. ✅ Agregar carpeta `semilleros-ucp/publicaciones/` (automático al subir)
2. ✅ Probar subida de múltiples imágenes

### **FASE 3: Crear Controlador de Publicaciones (30 minutos)**
1. ❌ Crear `src/controllers/publicacionController.js`
2. ❌ Implementar CRUD completo
3. ❌ Validar que solo líder del campo pueda publicar
4. ❌ Permitir subir hasta 3 imágenes con Multer

### **FASE 4: Actualizar Controlador de Campos (20 minutos)**
1. ❌ Integrar Cloudinary en `campoController.js`
2. ❌ Permitir actualizar imagen y descripción

### **FASE 5: Crear Rutas (10 minutos)**
1. ❌ Crear `src/routes/publicaciones.js`
2. ❌ Proteger rutas con middleware de autenticación
3. ❌ Validar rol de líder de campo

### **FASE 6: Actualizar Landing Page (Frontend)**
1. ❌ Sección de "Publicaciones Recientes"
2. ❌ Galería con 3 imágenes por publicación
3. ❌ Filtro por campo de investigación

---

## ❓ **PREGUNTAS PARA CONFIRMAR:**

1. **¿Eliminar tablas de noticias?**
   - ✅ NO HAY tabla `noticias` actualmente, así que no hay nada que eliminar

2. **¿Mantener tabla `comentarios` y `historial_actividades`?**
   - ✅ Sí, no afectan el nuevo sistema de publicaciones
   - ✅ Son útiles para actividades de proyectos

3. **¿Solo líderes de campo pueden publicar?**
   - Confirmar: ¿O también Admin Semillero puede publicar en cualquier campo?

4. **¿Máximo 3 imágenes es obligatorio o pueden ser menos?**
   - Confirmar: ¿Se pueden publicar con 1, 2 o 3 imágenes (flexible)?

5. **¿Las publicaciones son públicas o solo para usuarios logueados?**
   - Asumo que son **públicas** para la landing page

---

## 📋 **RESUMEN DE CAMBIOS:**

### ✅ **LO QUE YA TIENES:**
- Tabla `campos_investigacion` con líder, descripción e imagen ✅
- Tabla `semilleros` con líder ✅
- Sistema de autenticación y roles ✅
- Cloudinary configurado ✅

### 🆕 **LO QUE HAY QUE AGREGAR:**
1. Columna `activo` en tabla `semilleros`
2. Tabla nueva `publicaciones` con 3 campos para imágenes
3. Controlador `publicacionController.js`
4. Rutas `/api/publicaciones`
5. Integración de Cloudinary en campos y publicaciones
6. Validación de rol "líder de campo"

### ❌ **LO QUE NO HAY QUE ELIMINAR:**
- ✅ Ninguna tabla actual (todas son útiles)
- ✅ No hay tabla de noticias para eliminar

---

## 🎯 **SIGUIENTE PASO:**

**¿Quieres que comencemos con la FASE 1 (Base de Datos)?**

Te voy a dar:
1. ✅ Script SQL para agregar columna `activo` a semilleros
2. ✅ Script SQL para crear tabla `publicaciones`
3. ✅ Script SQL con datos de prueba
4. ✅ Verificación en MySQL

**¿Procedemos?** 🚀
