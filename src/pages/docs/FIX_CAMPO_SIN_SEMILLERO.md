# 🔧 Fix: Campo Creado Sin Semillero

## 🚨 Problema
Al crear un campo de investigación, aparecía "Sin semillero" en lugar del nombre del semillero.

**Captura del error:**
```
Mecatronica | Sin semillero | Carlos Mendoza | miercoles 2pm-3pm
```

---

## 🔍 Causa Raíz

El servicio `campoService.createCampo()` creaba el campo en la BD correctamente, pero **NO cargaba las asociaciones** (semillero, liderUsuario) al retornar el objeto.

**Código anterior:**
```javascript
async function createCampo({ nombre, lider, descripcion, ... }) {
  return CampoInvestigacion.create({
    nombre,
    lider,
    descripcion,
    id_semillero  // ✅ Se guardaba en BD
  });
  // ❌ Pero no se retornaba con las asociaciones cargadas
}
```

---

## ✅ Solución Implementada

### **1. Modificar `campoService.js`**

**Archivo:** `src/services/campoService.js`

```javascript
async function createCampo({ 
  nombre, 
  lider, 
  descripcion, 
  ruta_imagen, 
  id_semillero,
  horario_reunion,
  contacto_email,
  contacto_redes_sociales
}) {
  // Crear el campo
  const nuevoCampo = await CampoInvestigacion.create({
    nombre,
    lider,
    descripcion,
    ruta_imagen,
    id_semillero,
    horario_reunion,
    contacto_email,
    contacto_redes_sociales
  });

  // ✅ Retornar el campo CON todas sus asociaciones cargadas
  return CampoInvestigacion.findByPk(nuevoCampo.id, {
    include: [
      { association: 'semillero' },
      { association: 'liderUsuario', attributes: ['id', 'nombre', 'correo'] }
    ]
  });
}
```

**Cambios:**
1. Crear el campo normalmente
2. **Hacer un `findByPk` adicional** con `include` para cargar:
   - `semillero` → Información completa del semillero
   - `liderUsuario` → Datos del líder del campo

---

### **2. Agregar Logs de Depuración**

**Archivo:** `src/controllers/campoController.js`

```javascript
async function createCampo(req, res) {
  try {
    let { nombre, lider, descripcion, id_semillero, ... } = req.body;
    
    // 🔍 LOGS para debugging
    console.log('📋 Crear Campo - Request Body:', req.body);
    console.log('👤 Usuario:', req.user?.correo, 'Rol:', req.user?.rol);
    console.log('🏛️ userSemilleroId del middleware:', req.userSemilleroId);
    
    // Auto-asignar semillero si no viene en el body
    if (!id_semillero && req.userSemilleroId) {
      console.log('✅ Auto-asignando semillero:', req.userSemilleroId);
      id_semillero = req.userSemilleroId;
    }
    
    console.log('✅ id_semillero final:', id_semillero);
    
    // ... resto del código
  }
}
```

---

## 🧪 Resultado Esperado

### **Antes:**
```json
{
  "message": "Campo de investigación creado",
  "campo": {
    "id": 5,
    "nombre": "Mecatronica",
    "lider": 3,
    "id_semillero": 1,
    "semillero": null,           // ❌ NULL
    "liderUsuario": null         // ❌ NULL
  }
}
```

### **Después:**
```json
{
  "message": "Campo de investigación creado",
  "campo": {
    "id": 5,
    "nombre": "Mecatronica",
    "lider": 3,
    "id_semillero": 1,
    "semillero": {                // ✅ Cargado
      "id": 1,
      "nombre": "TechLab",
      "descripcion": "Semillero de tecnología",
      "activo": 1
    },
    "liderUsuario": {             // ✅ Cargado
      "id": 3,
      "nombre": "Carlos Mendoza",
      "correo": "carlos.mendoza@ucp.edu.co"
    }
  }
}
```

---

## 📋 Frontend - Verificar

**En el frontend, ahora debería aparecer:**

```
Mecatronica | TechLab | Carlos Mendoza | miercoles 2pm-3pm
```

En lugar de:

```
Mecatronica | Sin semillero | Carlos Mendoza | miercoles 2pm-3pm
```

---

## 🔄 Cómo Probarlo

### **1. Crear un nuevo campo:**

```bash
POST http://localhost:3000/api/campos
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Test Campo",
  "lider": 3,
  "descripcion": "Campo de prueba"
  // NO enviar id_semillero (se auto-asigna si eres líder de semillero)
}
```

### **2. Verificar en los logs del servidor:**

```
📋 Crear Campo - Request Body: { nombre: 'Test Campo', lider: 3, ... }
👤 Usuario: maria.garcia@ucp.edu.co Rol: 1
🏛️ userSemilleroId del middleware: 1
✅ Auto-asignando semillero: 1
✅ id_semillero final: 1
```

### **3. Verificar respuesta del servidor:**

Debe incluir:
- ✅ `campo.semillero.nombre` → Nombre del semillero
- ✅ `campo.liderUsuario.nombre` → Nombre del líder

---

## ✅ Estado

**Servidor:** ✅ Corriendo en puerto 3000  
**Fix Aplicado:** ✅ Sí  
**Probado:** ⏳ Pendiente prueba desde frontend

---

## 📝 Archivos Modificados

1. `src/services/campoService.js` → Agregar `findByPk` con `include`
2. `src/controllers/campoController.js` → Agregar logs de debugging

---

**Ahora el campo se crea correctamente con toda la información del semillero y líder cargada.** 🎉
