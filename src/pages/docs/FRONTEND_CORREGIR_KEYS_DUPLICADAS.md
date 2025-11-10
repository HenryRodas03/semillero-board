# 🔧 FRONTEND: Corregir Keys Duplicadas en Select de Líderes

## 🚨 Error Detectado

```
Warning: Encountered two children with the same key, `3`
```

**Ubicación:** `CampoDialog.tsx` línea 35  
**Componente:** Select de líderes de campo  
**Impacto:** Puede causar comportamiento inesperado en React

---

## ✅ Backend Corregido

Ya se corrigió el backend agregando `GROUP BY` a la query para evitar duplicados. Pero el frontend **DEBE** manejar keys únicas para evitar problemas.

---

## 🔧 Solución Frontend

### **Problema:**
Cuando renderizas líderes en optgroups separados (disponibles vs ocupados), React ve el mismo `key={lider.id}` dos veces si accidentalmente el mismo líder aparece en ambos grupos.

### **Solución: Usar keys compuestas por grupo**

**Archivo:** `CampoDialog.tsx`

```tsx
// ❌ ANTES (causaba warning):
<SelectContent>
  <SelectGroup>
    <SelectLabel>✅ Disponibles</SelectLabel>
    {lideresDisponibles.map(lider => (
      <SelectItem key={lider.id} value={String(lider.id)}>
        {lider.nombre}
      </SelectItem>
    ))}
  </SelectGroup>
  
  <SelectGroup>
    <SelectLabel>⚠️ Con campo asignado</SelectLabel>
    {lideresOcupados.map(lider => (
      <SelectItem key={lider.id} value={String(lider.id)}>  {/* ← Mismo key */}
        {lider.nombre}
      </SelectItem>
    ))}
  </SelectGroup>
</SelectContent>

// ✅ DESPUÉS (corregido):
<SelectContent>
  <SelectGroup>
    <SelectLabel>✅ Disponibles</SelectLabel>
    {lideresDisponibles.map(lider => (
      <SelectItem 
        key={`disponible-${lider.id}`}  {/* ← Key única con prefijo */}
        value={String(lider.id)}
      >
        {lider.nombre} - {lider.correo}
      </SelectItem>
    ))}
  </SelectGroup>
  
  <SelectGroup>
    <SelectLabel>⚠️ Con campo asignado</SelectLabel>
    {lideresOcupados.map(lider => (
      <SelectItem 
        key={`ocupado-${lider.id}`}  {/* ← Key única con prefijo diferente */}
        value={String(lider.id)}
      >
        {lider.nombre} - {lider.correo}
      </SelectItem>
    ))}
  </SelectGroup>
</SelectContent>
```

---

## 📋 Código Completo Corregido

```tsx
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CampoDialog({ open, onOpenChange, onSuccess, editingCampo }) {
  const [lideres, setLideres] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    lider: '',
    descripcion: '',
    id_semillero: '',
  });

  // Cargar líderes al abrir el diálogo
  useEffect(() => {
    if (open) {
      cargarLideres();
    }
  }, [open]);

  const cargarLideres = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/usuarios/posibles-lideres-campo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLideres(data.usuarios || []);
    } catch (error) {
      console.error('Error al cargar líderes:', error);
    }
  };

  // ✅ Separar en grupos ANTES de renderizar
  const lideresDisponibles = lideres.filter(l => l.disponible);
  const lideresOcupados = lideres.filter(l => !l.disponible);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingCampo ? 'Editar Campo' : 'Crear Campo de Investigación'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Campo: Nombre */}
          <div className="space-y-2">
            <label>Nombre del Campo *</label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Inteligencia Artificial"
              required
            />
          </div>

          {/* Campo: Líder - CON KEYS ÚNICAS */}
          <div className="space-y-2">
            <label>Líder del Campo *</label>
            <Select 
              value={formData.lider} 
              onValueChange={(value) => setFormData({ ...formData, lider: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un líder" />
              </SelectTrigger>
              <SelectContent>
                {/* Grupo 1: Disponibles */}
                {lideresDisponibles.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>✅ Disponibles (sin campo asignado)</SelectLabel>
                    {lideresDisponibles.map(lider => (
                      <SelectItem 
                        key={`disponible-${lider.id}`}  // ✅ Key única
                        value={String(lider.id)}
                      >
                        {lider.nombre} - {lider.correo}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}

                {/* Grupo 2: Con campo asignado */}
                {lideresOcupados.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>⚠️ Ya tienen campo asignado</SelectLabel>
                    {lideresOcupados.map(lider => (
                      <SelectItem 
                        key={`ocupado-${lider.id}`}  // ✅ Key única y diferente
                        value={String(lider.id)}
                      >
                        {lider.nombre} - {lider.correo}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}

                {lideres.length === 0 && (
                  <div className="p-2 text-center text-muted-foreground">
                    No hay líderes disponibles
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Resto del formulario... */}
          
          <DialogFooter>
            <Button type="submit">
              {editingCampo ? 'Actualizar' : 'Crear Campo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🎯 Cambios Clave

| Antes | Después | Beneficio |
|-------|---------|-----------|
| `key={lider.id}` | `key={\`disponible-\${lider.id}\`}` | Keys únicas por grupo |
| Mismo key en ambos grupos | Prefijos diferentes | No más warnings |
| Posibles duplicados | Filtrado antes de render | Código más limpio |

---

## ⚠️ Warnings de React Router (Opcional)

Estos NO son errores críticos, solo informativos sobre cambios futuros:

```tsx
// En tu App.tsx o donde esté BrowserRouter
<BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}
>
  <Routes>
    {/* tus rutas */}
  </Routes>
</BrowserRouter>
```

Esto silenciará los warnings, pero **NO es urgente**.

---

## ✅ Checklist de Implementación

- [ ] Abrir `CampoDialog.tsx`
- [ ] Separar líderes en `lideresDisponibles` y `lideresOcupados`
- [ ] Cambiar `key={lider.id}` por `key={\`disponible-\${lider.id}\`}`
- [ ] Cambiar el segundo grupo a `key={\`ocupado-\${lider.id}\`}`
- [ ] Guardar y refrescar frontend
- [ ] Verificar que NO hay más warnings de "duplicate keys"

---

## 🧪 Verificación

Después de aplicar los cambios:

1. Abre la consola del navegador (F12)
2. Abre el diálogo de crear campo
3. **NO debería aparecer:** `Warning: Encountered two children with the same key`
4. ✅ Consola limpia

---

## 📝 Notas Adicionales

**¿Por qué pasaba esto?**
- El backend podía retornar el mismo usuario múltiples veces si tenía varios campos
- Aunque se corrigió el backend con `GROUP BY`, el frontend debe usar keys únicas por seguridad

**¿Es peligroso?**
- No rompe la aplicación, pero puede causar:
  - Renderizado incorrecto
  - Estado desincronizado
  - Problemas al actualizar la lista

**Buenas prácticas:**
- Siempre usa keys únicas en listas
- Si agrupas items, agrega prefijo al key: `grupo-${id}`
- Nunca uses índice del array como key (excepto casos muy específicos)

---

**Estado Backend:** ✅ Corregido (GROUP BY aplicado)  
**Acción Frontend:** ⏳ Pendiente (aplicar keys únicas)  
**Prioridad:** 🟡 Media (funciona pero con warnings)
