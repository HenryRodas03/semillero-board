# ⚡ ACCIONES INMEDIATAS - Formulario de Campos

## ✅ Problemas Resueltos (Backend)

1. **Error 403 en `/api/usuarios`** → ✅ CORREGIDO
2. **Crear nuevo líder desde formulario** → ✅ NUEVOS ENDPOINTS
3. **Líneas de investigación vacías** → ✅ SCRIPT SQL LISTO

---

## 🔧 Paso 1: Ejecutar Script SQL (1 minuto)

```bash
mysql -u root -p gestion_proyectos_db < migrations/insert_lineas_investigacion.sql
```

**O desde MySQL Workbench:**
1. Abrir archivo: `migrations/insert_lineas_investigacion.sql`
2. Ejecutar todo el script
3. Verificar: `SELECT * FROM lineas_investigacion;`

**Resultado:** 12 líneas de investigación disponibles ✅

---

## 🎨 Paso 2: Modificar Frontend (15-30 minutos)

### **A) Cargar Líderes Disponibles**

```tsx
// En el componente FormularioCampo
const [lideres, setLideres] = useState([]);

useEffect(() => {
  const token = localStorage.getItem('token');
  fetch('http://localhost:3000/api/usuarios/posibles-lideres-campo', {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => setLideres(data.usuarios));
}, []);
```

### **B) Select de Líderes con Disponibilidad**

```tsx
<label>Líder del Campo *</label>
<select value={formData.lider} onChange={handleChange} required>
  <option value="">Seleccione un líder</option>
  
  <optgroup label="✅ Disponibles (sin campo asignado)">
    {lideres.filter(l => l.disponible).map(lider => (
      <option key={lider.id} value={lider.id}>
        {lider.nombre} - {lider.correo}
      </option>
    ))}
  </optgroup>
  
  <optgroup label="⚠️ Ya tienen campo asignado">
    {lideres.filter(l => !l.disponible).map(lider => (
      <option key={lider.id} value={lider.id}>
        {lider.nombre} - {lider.correo}
      </option>
    ))}
  </optgroup>
</select>

<button 
  type="button" 
  onClick={() => setMostrarFormNuevo(true)}
  className="btn-agregar-lider"
>
  ➕ Crear Nuevo Líder
</button>
```

### **C) Modal para Crear Nuevo Líder**

```tsx
{mostrarFormNuevo && (
  <div className="modal-overlay">
    <div className="modal-contenido">
      <h3>Crear Nuevo Líder de Campo</h3>
      
      <input
        type="text"
        placeholder="Nombre completo"
        value={nuevoLider.nombre}
        onChange={(e) => setNuevoLider({...nuevoLider, nombre: e.target.value})}
        required
      />
      
      <input
        type="email"
        placeholder="correo@ucp.edu.co"
        value={nuevoLider.correo}
        onChange={(e) => setNuevoLider({...nuevoLider, correo: e.target.value})}
        required
      />
      
      <button onClick={async () => {
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
          alert(`✅ Líder creado exitosamente!\n\n` +
                `Nombre: ${data.user.nombre}\n` +
                `Correo: ${data.user.correo}\n` +
                `Contraseña temporal: ${data.user.tempPassword}\n\n` +
                `⚠️ IMPORTANTE: Anote esta contraseña y proporciónela al nuevo líder.`);
          
          // Recargar lista de líderes
          const refreshResponse = await fetch('http://localhost:3000/api/usuarios/posibles-lideres-campo', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const refreshData = await refreshResponse.json();
          setLideres(refreshData.usuarios);
          
          // Seleccionar automáticamente el nuevo líder
          setFormData({...formData, lider: data.user.id});
          setMostrarFormNuevo(false);
        } else {
          alert(`❌ Error: ${data.message}`);
        }
      }}>
        Crear Líder
      </button>
      
      <button onClick={() => setMostrarFormNuevo(false)}>
        Cancelar
      </button>
    </div>
  </div>
)}
```

---

## 🧪 Paso 3: Probar (5 minutos)

### **Test 1: Ver Lista de Usuarios**
1. Iniciar sesión como **María González** (admin@ucp.edu.co / admin123)
2. Ir a sección de usuarios
3. ✅ Debería cargar SIN error 403

### **Test 2: Líneas de Investigación**
1. Abrir formulario de crear campo
2. Select de "Línea de Investigación"
3. ✅ Debería mostrar 12 opciones

### **Test 3: Crear Nuevo Líder**
1. Abrir formulario de crear campo
2. Clic en "➕ Crear Nuevo Líder"
3. Ingresar datos:
   - Nombre: "Test Usuario"
   - Correo: "test@ucp.edu.co"
4. ✅ Debería crear y mostrar contraseña temporal
5. ✅ Nuevo líder aparece en el select

---

## 📡 Endpoints Disponibles

| Endpoint | Uso |
|----------|-----|
| `GET /api/usuarios/posibles-lideres-campo` | Listar líderes con disponibilidad |
| `POST /api/usuarios/quick-create-lider` | Crear líder rápido con contraseña temporal |
| `GET /api/lineas-investigacion` | Listar líneas de investigación |

**Todos requieren:** `Authorization: Bearer {token}`

---

## ⚠️ IMPORTANTE

**Contraseña Temporal:**
- Se genera automáticamente (ej: `Tempabc123!`)
- Se muestra UNA SOLA VEZ al crear el usuario
- **DEBE anotarse y enviarse al nuevo líder**

**Seguridad:**
- Solo Admin Semillero (rol=1) puede crear líderes
- Correo debe ser único
- Usuario activo inmediatamente

---

## 📂 Documentación Completa

- **`docs/RESUMEN_CORRECCIONES_CAMPOS.md`** - Resumen completo de cambios
- **`docs/NUEVAS_FUNCIONALIDADES_CAMPOS.md`** - Guía detallada con ejemplos

---

**Estado Backend:** ✅ Listo  
**Script SQL:** ✅ Preparado  
**Servidor:** ✅ Puerto 3000  
**Próximo:** Implementar frontend según esta guía
