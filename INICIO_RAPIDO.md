# 🚀 Guía Rápida de Inicio

## ⚡ Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
npm install axios socket.io-client
```

### 2. Verificar Backend
Asegúrate de que el backend esté corriendo en `http://localhost:3000`

```bash
# En otra terminal, en la carpeta del backend:
npm start
```

### 3. Iniciar Frontend
```bash
npm run dev
```

### 4. Abrir en el Navegador
El sistema se abrirá automáticamente en: `http://localhost:5173`

---

## 🧪 Probar el Sistema

### Opción 1: Navegar sin Login
1. Ve a `http://localhost:5173`
2. Explora la home page
3. Haz clic en "Ver Semilleros" o "Ver Proyectos"
4. Navega por la información pública

### Opción 2: Crear Cuenta y Login
1. Ve a `http://localhost:5173/register`
2. Completa el formulario:
   - Nombre: Tu nombre
   - Correo: tu@correo.com
   - Contraseña: mínimo 8 caracteres
   - Rol: Selecciona uno (para pruebas, elige "Admin Semillero")
3. Haz clic en "Crear Cuenta"
4. Si el backend tiene email configurado, verifica tu correo
5. Si NO tiene email, ve directo a login
6. Inicia sesión en `http://localhost:5173/login`
7. Serás redirigido al dashboard administrativo

---

## 📋 Checklist de Verificación

### ✅ Backend (Debe estar corriendo)
- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Base de datos MySQL conectada
- [ ] CORS configurado para `http://localhost:5173`
- [ ] Socket.IO habilitado
- [ ] (Opcional) Servicio de email configurado
- [ ] (Opcional) Cloudinary configurado para imágenes

### ✅ Frontend
- [ ] Dependencias instaladas (`npm install`)
- [ ] Axios instalado (`npm install axios socket.io-client`)
- [ ] Proyecto inicia correctamente (`npm run dev`)
- [ ] No hay errores en consola del navegador

---

## 🔍 Solución de Problemas Comunes

### Problema: "Cannot connect to backend"
**Solución:**
1. Verifica que el backend esté corriendo en puerto 3000
2. Abre `http://localhost:3000/api` en el navegador
3. Deberías ver una respuesta del servidor
4. Si no, revisa los logs del backend

### Problema: Error de CORS
**Solución:**
Añade al backend (app.js o similar):
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Problema: "Token inválido" al iniciar sesión
**Solución:**
1. Verifica que el JWT_SECRET esté configurado en el backend
2. Limpia localStorage: Abre DevTools > Application > Local Storage > Clear
3. Intenta iniciar sesión nuevamente

### Problema: Socket.IO no conecta
**Solución:**
1. Verifica que el backend tenga Socket.IO instalado y configurado
2. Revisa la URL en `src/services/socket.ts`
3. Abre la consola del navegador y busca "Socket conectado"

### Problema: Imágenes no cargan
**Solución:**
1. Verifica que Cloudinary esté configurado en el backend
2. Las URLs deben empezar con `https://res.cloudinary.com/...`
3. Si no tienes Cloudinary, las imágenes no funcionarán (puedes omitirlas por ahora)

---

## 🎯 URLs Importantes

### Público (Sin Login)
- **Home**: http://localhost:5173/
- **Semilleros**: http://localhost:5173/public/semilleros
- **Proyectos**: http://localhost:5173/public/proyectos

### Autenticación
- **Login**: http://localhost:5173/login
- **Registro**: http://localhost:5173/register

### Administrativo (Con Login)
- **Dashboard**: http://localhost:5173/admin/dashboard
- **Proyectos**: http://localhost:5173/admin/proyectos
- **Tareas**: http://localhost:5173/admin/tareas
- **Usuarios**: http://localhost:5173/admin/usuarios

---

## 📊 Roles de Usuario

Para pruebas, estos son los roles disponibles:

| ID | Nombre | Permisos |
|----|--------|----------|
| 1 | Admin Semillero | ⭐⭐⭐⭐⭐ Acceso total |
| 2 | Admin Campo | ⭐⭐⭐⭐ Gestión de campo |
| 3 | Delegado | ⭐⭐⭐ Gestión de proyectos |
| 4 | Colaborador | ⭐⭐ Solo visualización |

**Recomendación:** Para pruebas, crea una cuenta con rol "Admin Semillero" para ver todas las funcionalidades.

---

## 🔥 Comandos Útiles

```bash
# Desarrollo
npm run dev           # Inicia servidor de desarrollo

# Build
npm run build         # Compila para producción
npm run preview       # Preview del build de producción

# Linting
npm run lint          # Verifica el código

# Limpieza
rm -rf node_modules   # Elimina dependencias (Windows: rmdir /s node_modules)
npm install           # Reinstala dependencias limpias
```

---

## 💡 Tips de Desarrollo

### Consola del Navegador
Abre las DevTools (F12) para ver:
- Errores de JavaScript
- Peticiones HTTP (Network tab)
- Estado de Socket.IO (Console)
- LocalStorage con token (Application tab)

### Hot Reload
Vite tiene hot reload activado. Al guardar cambios, la página se actualiza automáticamente.

### Estructura de Datos
Para ver qué datos retorna el backend, revisa:
- `GUIA_FRONTEND_COMPLETA.md` - Todos los endpoints
- `GUIA_FRONTEND_FASE3.md` - Endpoints CRUD
- `GUIA_FRONTEND_FASE4.md` - Endpoints avanzados

---

## 🎨 Personalización Rápida

### Cambiar Logo
Edita: `src/components/Layout/AppSidebar.tsx` línea 63

### Cambiar Nombre del Sistema
Edita: `src/components/Layout/AppSidebar.tsx` línea 69

### Cambiar Colores
Edita: `src/index.css` - Variables CSS del tema

---

## 📱 Contacto y Soporte

- **Documentación completa**: Ver `INSTRUCCIONES_FRONTEND.md`
- **Resumen de implementación**: Ver `RESUMEN_IMPLEMENTACION.md`
- **Alcance del proyecto**: Ver `contexto.md`

---

## ✅ Todo Listo!

Si todos los checkboxes están marcados y no hay errores, ¡el sistema está funcionando correctamente! 🎉

Ahora puedes:
1. ✅ Navegar por las páginas públicas sin login
2. ✅ Crear una cuenta y verificarla
3. ✅ Iniciar sesión y acceder al dashboard
4. ✅ Gestionar proyectos (si tienes permisos)
5. ✅ Ver actualizaciones en tiempo real con Socket.IO

---

**¡Disfruta del Sistema de Gestión de Semilleros!** 🚀
