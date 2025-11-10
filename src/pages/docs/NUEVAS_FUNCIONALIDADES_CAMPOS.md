# 🎯 Nuevas Funcionalidades para Formulario de Campos

## ✅ Problemas Resueltos

### 1. **Error 403 en `/api/usuarios`** 
**Problema:** Admin de Campo no podía ver la lista de usuarios  
**Solución:** ✅ Corregida la validación de roles para usar `req.user.rol || req.user.id_rol`

### 2. **Crear Líder de Campo desde Formulario**
**Problema:** No existía forma de crear un nuevo usuario mientras se creaba un campo  
**Solución:** ✅ Nuevos endpoints para listar y crear líderes rápidamente

---

## 📡 Nuevos Endpoints Disponibles

### 1️⃣ Obtener Líderes Disponibles
```http
GET /api/usuarios/posibles-lideres-campo
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "total": 5,
  "usuarios": [
    {
      "id": 5,
      "nombre": "Pedro López",
      "correo": "pedro.lopez@ucp.edu.co",
      "tiene_campo": false,
      "disponible": true  // ← Disponible para asignar
    },
    {
      "id": 2,
      "nombre": "María González",
      "correo": "maria.gonzalez@ucp.edu.co",
      "tiene_campo": true,
      "disponible": false  // ← Ya tiene un campo asignado
    }
  ]
}
```

**Ordenamiento:** 
- Primero los **disponibles** (sin campo asignado)
- Luego los que ya tienen campo
- Orden alfabético por nombre

---

### 2️⃣ Crear Líder Rápidamente
```http
POST /api/usuarios/quick-create-lider
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "correo": "juan.perez@ucp.edu.co"
}
```

**Respuesta:**
```json
{
  "message": "Líder de campo creado exitosamente",
  "user": {
    "id": 25,
    "nombre": "Juan Pérez",
    "correo": "juan.perez@ucp.edu.co",
    "id_rol": 2,
    "tempPassword": "Tempabc123!"
  },
  "nota": "IMPORTANTE: Contraseña temporal generada. Cambie la contraseña en el primer inicio de sesión."
}
```

**Características:**
- ✅ Crea usuario con `rol = 2` (Admin Campo)
- ✅ Genera contraseña temporal automáticamente
- ✅ Devuelve la contraseña (mostrarla al admin)
- ✅ Usuario activo pero correo no verificado
- ⚠️ **IMPORTANTE:** Guardar la contraseña temporal y proporcionarla al nuevo líder

---

## 🎨 Implementación en Frontend

### **Modificar el Formulario de Campos**

```tsx
import { useState, useEffect } from 'react';

function FormularioCampo() {
  const [lideres, setLideres] = useState([]);
  const [mostrarFormularioNuevoLider, setMostrarFormularioNuevoLider] = useState(false);
  const [nuevoLider, setNuevoLider] = useState({ nombre: '', correo: '' });
  const [passwordGenerada, setPasswordGenerada] = useState(null);

  // Cargar líderes disponibles al abrir el formulario
  useEffect(() => {
    cargarLideresDisponibles();
  }, []);

  const cargarLideresDisponibles = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/usuarios/posibles-lideres-campo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    setLideres(data.usuarios);
  };

  const crearNuevoLider = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/api/usuarios/quick-create-lider', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoLider)
    });

    const data = await response.json();
    
    if (response.ok) {
      // Mostrar la contraseña temporal
      setPasswordGenerada(data.user.tempPassword);
      
      // Recargar la lista de líderes
      await cargarLideresDisponibles();
      
      // Seleccionar automáticamente el nuevo líder
      setFormData({ ...formData, lider: data.user.id });
      
      alert(`✅ Líder creado exitosamente!\n\nNombre: ${data.user.nombre}\nCorreo: ${data.user.correo}\nContraseña temporal: ${data.user.tempPassword}\n\n⚠️ IMPORTANTE: Guarde esta contraseña y proporciónela al nuevo líder.`);
      
      setMostrarFormularioNuevoLider(false);
    } else {
      alert(`❌ Error: ${data.message}`);
    }
  };

  return (
    <div>
      <h2>Crear Campo de Investigación</h2>
      
      {/* Campo: Líder del Semillero */}
      <div className="form-group">
        <label>Líder del Campo *</label>
        
        <select 
          value={formData.lider} 
          onChange={(e) => setFormData({ ...formData, lider: e.target.value })}
          required
        >
          <option value="">Seleccione un líder</option>
          
          <optgroup label="✅ Disponibles (sin campo asignado)">
            {lideres
              .filter(l => l.disponible)
              .map(lider => (
                <option key={lider.id} value={lider.id}>
                  {lider.nombre} ({lider.correo})
                </option>
              ))
            }
          </optgroup>
          
          <optgroup label="⚠️ Ya tienen campo asignado">
            {lideres
              .filter(l => !l.disponible)
              .map(lider => (
                <option key={lider.id} value={lider.id}>
                  {lider.nombre} ({lider.correo})
                </option>
              ))
            }
          </optgroup>
        </select>

        <button 
          type="button" 
          onClick={() => setMostrarFormularioNuevoLider(true)}
          className="btn-secondary mt-2"
        >
          ➕ Crear Nuevo Líder
        </button>
      </div>

      {/* Modal/Formulario para crear nuevo líder */}
      {mostrarFormularioNuevoLider && (
        <div className="modal">
          <div className="modal-content">
            <h3>Crear Nuevo Líder de Campo</h3>
            <form onSubmit={crearNuevoLider}>
              <input
                type="text"
                placeholder="Nombre completo"
                value={nuevoLider.nombre}
                onChange={(e) => setNuevoLider({ ...nuevoLider, nombre: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={nuevoLider.correo}
                onChange={(e) => setNuevoLider({ ...nuevoLider, correo: e.target.value })}
                required
              />
              <div className="modal-actions">
                <button type="submit">Crear Líder</button>
                <button 
                  type="button" 
                  onClick={() => setMostrarFormularioNuevoLider(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resto del formulario... */}
    </div>
  );
}
```

---

## 📋 Flujo de Trabajo Recomendado

### **Opción 1: Usar Líder Existente**
1. Abrir formulario de creación de campo
2. Ver lista de líderes disponibles (ordenados por disponibilidad)
3. Seleccionar un líder disponible (preferiblemente sin campo asignado)
4. Completar resto del formulario
5. Guardar campo

### **Opción 2: Crear Nuevo Líder**
1. Abrir formulario de creación de campo
2. Hacer clic en "➕ Crear Nuevo Líder"
3. Ingresar nombre y correo del nuevo líder
4. Sistema genera contraseña temporal automáticamente
5. **⚠️ IMPORTANTE:** Copiar y guardar la contraseña mostrada
6. Nuevo líder se agrega automáticamente a la lista
7. Continuar con el formulario de campo

---

## 🔒 Permisos

| Acción | Admin Semillero (rol=1) | Admin Campo (rol=2) | Delegado (rol=3) |
|--------|-------------------------|---------------------|------------------|
| Listar líderes disponibles | ✅ Sí | ❌ No | ❌ No |
| Crear nuevo líder rápido | ✅ Sí | ❌ No | ❌ No |
| Ver usuarios | ✅ Sí | ✅ Sí | ✅ Sí |

---

## ⚠️ Notas Importantes

1. **Contraseña Temporal:**
   - Se genera automáticamente (ej: `Tempabc123!`)
   - Se muestra UNA SOLA VEZ al crear el usuario
   - **DEBE copiarse y enviarse al nuevo líder**
   - En producción, debería enviarse por correo electrónico

2. **Verificación de Correo:**
   - El usuario se crea con `email_verificado = 0`
   - El usuario puede iniciar sesión inmediatamente
   - Se recomienda implementar verificación de correo

3. **Seguridad:**
   - Solo Admin Semillero (rol=1) puede crear líderes
   - El correo debe ser único en el sistema
   - La contraseña cumple requisitos mínimos de seguridad

4. **Disponibilidad:**
   - Un líder está "disponible" si NO tiene campo asignado
   - Se puede asignar un líder que ya tiene campo (pero se marca como "no disponible")

---

## ✅ Testing

### **Probar Lista de Líderes:**
```bash
curl -X GET http://localhost:3000/api/usuarios/posibles-lideres-campo \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### **Probar Creación Rápida:**
```bash
curl -X POST http://localhost:3000/api/usuarios/quick-create-lider \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Líder",
    "correo": "test.lider@ucp.edu.co"
  }'
```

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica que el token JWT sea válido
2. Confirma que el usuario tiene rol=1 (Admin Semillero)
3. Revisa los logs del servidor (`console.log` en controlador)
4. Verifica que bcryptjs esté instalado (`npm install bcryptjs`)
