# ⚡ ACCIÓN URGENTE: Mostrar Solo MI Semillero

## 🚨 Problema
María García (líder) ve TODOS los semilleros cuando solo debería ver el suyo.

## ✅ Solución Rápida (3 cambios principales)

### **1. Cambiar el servicio de semilleros**

**Archivo:** `semillerosService.ts`

```typescript
// AGREGAR estos nuevos métodos:
export const getMiSemillero = async () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/semilleros/mi-semillero/info`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getMisCampos = async () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/semilleros/mi-semillero/campos`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

---

### **2. Dashboard - Mostrar solo SU semillero**

**Archivo:** Dashboard principal donde se muestra la tabla

```typescript
// ❌ QUITAR ESTO:
const [semilleros, setSemilleros] = useState([]);
const loadSemilleros = async () => {
  const response = await semillerosService.getAll();
  setSemilleros(response.data.semilleros);
};

// ✅ CAMBIAR POR ESTO:
const { user } = useAuth();
const [miSemillero, setMiSemillero] = useState(null);

const loadData = async () => {
  if (user.rol === 1) {
    // Líder: solo SU semillero
    const response = await semillerosService.getMiSemillero();
    setMiSemillero(response.data.semillero);
  } else {
    // Admin: todos
    const response = await semillerosService.getAll();
    setSemilleros(response.data.semilleros);
  }
};
```

---

### **3. Vista - Renderizar según rol**

```tsx
{user.rol === 1 ? (
  // LÍDER: Solo su semillero
  <Card>
    <CardHeader>
      <CardTitle>Mi Semillero</CardTitle>
    </CardHeader>
    <CardContent>
      <h3>{miSemillero?.nombre}</h3>
      <p>{miSemillero?.descripcion}</p>
      <Badge>{miSemillero?.activo ? 'Activo' : 'Cerrado'}</Badge>
      <Button onClick={() => navigate('/mi-semillero')}>
        Gestionar
      </Button>
    </CardContent>
  </Card>
) : (
  // ADMIN: Tabla con todos
  <Table>
    {semilleros.map(s => (
      <TableRow key={s.id}>
        <TableCell>{s.nombre}</TableCell>
        {/* ... */}
      </TableRow>
    ))}
  </Table>
)}
```

---

### **4. OCULTAR botón "Nuevo Semillero"**

```tsx
// ❌ QUITAR:
<Button onClick={crearSemillero}>+ Nuevo Semillero</Button>

// ✅ SOLO MOSTRAR SI NO ES LÍDER:
{user.rol !== 1 && (
  <Button onClick={crearSemillero}>+ Nuevo Semillero</Button>
)}
```

---

## 📝 Endpoints del Backend (YA LISTOS)

| Endpoint | Qué hace |
|----------|----------|
| `GET /api/semilleros/mi-semillero/info` | Retorna solo SU semillero |
| `GET /api/semilleros/mi-semillero/campos` | Retorna solo SUS campos |
| `PUT /api/semilleros/mi-semillero/actualizar` | Actualiza SU semillero |

**Importante:** TODOS requieren token JWT en headers:
```typescript
headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
```

---

## ✅ Resultado Esperado

**ANTES:** María ve 3 semilleros + botón "Nuevo Semillero"  
**DESPUÉS:** María ve solo "Semillero TechLab" + NO hay botón de crear

---

## 📄 Documentación Completa

Ver: `docs/FRONTEND_LIDER_SEMILLERO_PERMISOS.md`

---

**Prioridad:** 🔴 URGENTE  
**Backend:** ✅ Listo  
**Frontend:** ⚠️ Pendiente estos 4 cambios
