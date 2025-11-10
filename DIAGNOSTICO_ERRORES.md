🔍 Guía de Diagnóstico de Errores

## Problema Actual

Estás experimentando los siguientes errores:

1. **Error 400 en `/api/auth/login`**: "Faltan campos"
2. **Error 500 en `/api/public/semilleros`**: Error interno del servidor
3. **Error 500 en `/api/public/proyectos`**: Error interno del servidor

---

## ✅ Checklist de Verificación

### 1. ¿El Backend está corriendo?

Abre una terminal y ejecuta:

```bash
# Navega a la carpeta del backend
cd path/to/backend

# Verifica si está corriendo
curl http://localhost:3000/api/health
# o
curl http://localhost:3000
```

Si no responde, inicia el backend:

```bash
npm run dev
# o
npm start
```

---

### 2. Verificar el puerto del backend

El frontend está configurado para conectarse a `http://localhost:3000/api`

**Verifica en tu backend:**
- ¿Está corriendo en el puerto 3000?
- ¿Tiene el prefijo `/api` en las rutas?

**Si el backend usa otro puerto o prefijo:**

Edita el archivo `src/services/api.ts`:
```typescript
const api = axios.create({
  baseURL: 'http://localhost:TU_PUERTO/TU_PREFIJO',  // Cambia según tu backend
  timeout: 10000
});
```

---

### 3. Verificar el formato de campos del login

El frontend envía:
```json
{
  "correo": "admin@ucp.edu.co",
  "contraseña": "tu_password"
}
```

**¿Tu backend espera campos en inglés?**

Opción A - Backend espera español (correo/contraseña):
- ✅ El código actual debería funcionar

Opción B - Backend espera inglés (email/password):
- ✅ El código ahora intenta automáticamente ambos formatos

Opción C - Verificar manualmente con curl:
```bash
# Prueba con español
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@ucp.edu.co","contraseña":"tupassword"}'

# Prueba con inglés
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ucp.edu.co","password":"tupassword"}'
```

---

### 4. Verificar CORS en el Backend

El error 400/500 podría ser por CORS. Verifica que tu backend tenga:

```javascript
// En tu backend (Express)
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // Puerto del frontend Vite
  credentials: true
}));
```

---

### 5. Verificar la Base de Datos

Los errores 500 en endpoints públicos sugieren problemas con la BD:

```bash
# Verifica que la BD esté corriendo
# MySQL:
mysql -u root -p -e "SHOW DATABASES;"

# PostgreSQL:
psql -U postgres -c "\l"
```

**Verifica las tablas:**
```sql
-- Debe existir la tabla semilleros
SELECT * FROM semilleros LIMIT 1;

-- Debe existir la tabla proyectos
SELECT * FROM proyectos LIMIT 1;

-- Debe existir la tabla integrantes/usuarios
SELECT * FROM integrantes LIMIT 1;
```

---

### 6. Verificar Seeds/Data Inicial

Si las tablas están vacías, ejecuta los seeders:

```bash
# En tu carpeta de backend
npm run seed
# o
npx sequelize-cli db:seed:all
# o el comando que uses para poblar datos iniciales
```

---

### 7. Revisar Logs del Backend

Inicia el backend y observa los logs cuando hagas login:

```bash
npm run dev
```

Busca mensajes como:
- ❌ "Campo 'correo' es requerido"
- ❌ "Campo 'email' es requerido"
- ❌ "Error de conexión a la base de datos"
- ❌ "Tabla 'semilleros' no existe"

---

## 🚀 Solución Rápida

### Si el backend espera campos en inglés:

Edita `src/services/authService.ts` línea 18:

```typescript
// CAMBIAR ESTO:
login: async (credentials: { correo: string; contraseña: string }) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
  
// POR ESTO:
login: async (credentials: { correo: string; contraseña: string }) => {
  const englishCredentials = {
    email: credentials.correo,
    password: credentials.contraseña
  };
  const response = await axios.post(`${BASE_URL}/auth/login`, englishCredentials);
```

### Si los endpoints públicos no existen:

Verifica en tu backend que existan estas rutas:
```javascript
// Deben existir:
router.get('/api/public/semilleros', ...);
router.get('/api/public/proyectos', ...);
```

---

## 📝 Próximos Pasos

1. **Abre la consola del navegador** (F12) y vuelve a intentar hacer login
2. **Busca en los logs** el mensaje: "🔐 Intentando login con:"
3. **Copia el error completo** que aparece en rojo
4. **Revisa los logs del backend** en la terminal donde está corriendo

Con esta información podremos identificar exactamente dónde está el problema.

---

## 🆘 ¿Necesitas más ayuda?

Proporciona esta información:

1. **Puerto del backend**: ¿En qué puerto corre? (ej: 3000, 8000, 4000)
2. **Formato de campos**: ¿Usa español o inglés? (correo/contraseña o email/password)
3. **Error completo del backend**: Copia los logs cuando intentas hacer login
4. **Base de datos**: ¿MySQL o PostgreSQL? ¿Está corriendo?
5. **Estructura del proyecto**: ¿Estás usando Express, NestJS, otro framework?

