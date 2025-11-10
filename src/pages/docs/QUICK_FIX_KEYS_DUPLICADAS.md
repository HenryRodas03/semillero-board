# ⚡ QUICK FIX: Keys Duplicadas en Select

## ✅ Backend YA CORREGIDO

Se agregó `GROUP BY` a la query de líderes para evitar duplicados:

```sql
-- ANTES: Retornaba duplicados si un líder tenía varios campos
LEFT JOIN campos_investigacion c ON c.lider = u.id

-- AHORA: Agrupa por usuario, cuenta campos
GROUP BY u.id, u.nombre, u.correo, u.activo
```

**Servidor reiniciado:** ✅ Puerto 3000

---

## 🔧 FRONTEND: Cambio de 1 Minuto

**Archivo:** `CampoDialog.tsx`

**Cambiar:**

```tsx
// ❌ ANTES:
{lideres.map(lider => (
  <SelectItem key={lider.id} value={String(lider.id)}>
    {lider.nombre}
  </SelectItem>
))}

// ✅ DESPUÉS:
// Separar primero:
const lideresDisponibles = lideres.filter(l => l.disponible);
const lideresOcupados = lideres.filter(l => !l.disponible);

// Luego renderizar con keys únicas:
{lideresDisponibles.map(lider => (
  <SelectItem key={`disponible-${lider.id}`} value={String(lider.id)}>
    {lider.nombre}
  </SelectItem>
))}

{lideresOcupados.map(lider => (
  <SelectItem key={`ocupado-${lider.id}`} value={String(lider.id)}>
    {lider.nombre}
  </SelectItem>
))}
```

**Resultado:** Elimina warning `Encountered two children with the same key, '3'`

---

## 📄 Documentación Completa

Ver: `FRONTEND_CORREGIR_KEYS_DUPLICADAS.md` con código completo

---

**Backend:** ✅ LISTO  
**Frontend:** ⏳ 1 min de cambio  
**Impacto:** Elimina warnings de React
