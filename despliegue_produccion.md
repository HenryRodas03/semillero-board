# Guía de despliegue a producción — semillero-board (frontend)

Fecha: 19 de noviembre de 2025

Este documento describe paso a paso cómo llevar el frontend del proyecto `semillero-board` a producción, incluyendo build local, configuración de variables, ajustes para servicios de hosting (Render, Netlify, Vercel), y resolución de problemas comunes (CORS, uploads, bun/postinstall, `dist` inexistente).

---

## Resumen rápido

- Framework: Vite + React + TypeScript
- Carpeta de salida (publish): `dist` (Vite genera `dist` al ejecutar `vite build`)
- Script de build en `package.json`: `npm run build` (ejecuta `vite build`)
- Variable crítica para producción: `VITE_API_URL` (ej.: `https://gestionproyectos-8cuz.onrender.com/api`)

---

## Requisitos previos

- Tener Node.js (compatible) y npm instalados en la máquina de build. Recomiendo Node 18+.
- Asegurarse de usar `npm` (o `pnpm`/`yarn`) consistente en CI. Evitar que la plataforma use `bun` por defecto a menos que lo administres.
- Variables de entorno: token de terceros si aplica, y `VITE_API_URL` para apuntar al backend.

---

## Comandos locales (Windows - cmd.exe)

1. Instalar dependencias:

```cmd
cd "c:\Users\santiago1\Desktop\proyecto de grado\codigo\semillero-board"
npm install
```

2. Probar en desarrollo:

```cmd
npm run dev
```

3. Generar build de producción (genera `dist`):

```cmd
npm run build
```

4. Comprobar que `dist` existe:

```cmd
dir dist
```

5. (Opcional) Servir `dist` localmente para verificar:

```cmd
npx serve dist
```

---

## Variables de entorno importantes

- `VITE_API_URL` — URL base del backend que usa el frontend. Debe incluir el sufijo `/api` si tus rutas en el código usan `/api`.
  - Ejemplo: `VITE_API_URL=https://gestionproyectos-8cuz.onrender.com/api`

- Otros valores que el backend requiera (no expuestos en frontend) se configuran en el backend; en el frontend solo necesitas la API URL y tokens si son gestionados desde el cliente.

Importante: Vite sustituye `import.meta.env.VITE_*` en tiempo de build. Para cambiar la API en producción hay que rebuildear o usar configuración runtime (ver más abajo).

---

## Configuración recomendada para servicios de hosting

### Render

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment variables: añadir `VITE_API_URL` con la URL del backend

Pasos:
1. En el dashboard de Render, seleccionar el servicio frontend.
2. En `Environment` añadir `VITE_API_URL=https://gestionproyectos-8cuz.onrender.com/api`.
3. En `Build Command` poner `npm ci && npm run build`.
4. En `Publish Directory` poner `dist`.
5. Redeploy.

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: `VITE_API_URL` en Site settings → Build & deploy → Environment

### Vercel

- Framework: Other / Static
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_API_URL`

---

## Opciones para cambiar la URL del backend sin rebuild (runtime config)

Si no quieres rebuildear para cambiar `VITE_API_URL`, usa una pequeña carga runtime:

1. Crear `public/env.js` (archivo estático que el hosting puede reemplazar):

```js
// public/env.js
window.__RUNTIME_API_URL = 'https://gestionproyectos-8cuz.onrender.com/api';
```

2. Incluirlo en `index.html` antes del bundle:

```html
<script src="/env.js"></script>
<!-- luego el bundle -->
```

3. Modificar `src/services/api.ts` para preferir `window.__RUNTIME_API_URL`:

```ts
const runtime = (window as any).__RUNTIME_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const api = axios.create({ baseURL: runtime });
```

Ventaja: puedes editar `env.js` en el servidor (o copiar una versión diferente) y cambiar la API sin rebuild.

---

## CORS, Autenticación y tokens

- Asegúrate que el backend permite el origen del frontend (dominio) en su configuración CORS.
- `src/services/api.ts` añade `Authorization: Bearer <token>` si `localStorage.token` existe. Verifica que el token sea válido en producción.
- Si recibes 401/403:
  - 401: probablemente token inválido/expirado. El interceptor ya limpia token y redirige a `/login`.
  - 403: problemas de permisos en backend — revisar roles/claims del token o reglas del backend.

---

## Subida de archivos: problemas comunes

- No fijar manualmente `Content-Type` al enviar `FormData`. Dejar que el navegador agregue el boundary. Ejemplo correcto:

```ts
const res = await api.post('/publicaciones', formData); // no headers manuales
```

- Si el backend reporta campos faltantes, inspecciona en la consola del navegador las entradas del `FormData` antes de enviar:

```ts
for (const pair of (fd as any).entries()) console.debug(pair[0], pair[1]);
```

---

## Errores con Bun / postinstall (en deploy)

- Si la plataforma intenta usar `bun` y muestra `Blocked 1 postinstall. Run 'bun pm untrusted' for details`:
  - Preferible: cambiar la plataforma para usar `npm` o `pnpm` en vez de `bun`. En Render/Netlify/Vercel puedes indicar el comando de build (usar `npm ci` o `npm install`).
  - Si debes usar Bun, ejecutar `bun pm untrusted` localmente para revisar y permitir paquetes no confiables, pero en CI suele ser inviable.

---

## Verificación post-deploy y pruebas

1. Accede al frontend en producción.
2. Abre consola del navegador y verifica:
   - No errores de CORS en la consola.
   - Peticiones a `https://gestionproyectos-8cuz.onrender.com/api/...` (si la API URL quedó correcta).
3. Crear una publicación con imágenes y verificar en Network que la petición a `/publicaciones` contiene campos `imagen_1`, etc., y que la respuesta es 200/201.

---

## Rollback y logs

- Mantén un plan de rollback: redeploy de la versión anterior o cambiar `env.js` si usas runtime config.
- Revisa logs del hosting (Render logs / Netlify deploy logs / Vercel) si falla el build o si el runtime lanza errores.

---

## Checklist final antes de marcar listo

- [ ] `npm run build` genera `dist` localmente sin errores.
- [ ] `VITE_API_URL` configurada en entorno de hosting.
- [ ] Publish directory configurada como `dist`.
- [ ] CORS en backend permite el dominio del frontend o está bien configurado para producción.
- [ ] Prueba de subida de imágenes OK (Network: FormData contiene archivos).
- [ ] Pruebas funcionales básicas (login, listar publicaciones, crear publicación) pasan.

---

Si quieres, puedo:

- Añadir un pequeño `despliegue-checklist.md` con comandos exactos y comprobaciones automáticas.
- Aplicar la opción runtime (`public/env.js` + cambios en `api.ts`) en el repo para que puedas cambiar la API sin rebuild.
- Generar un script `deploy/render-setup.md` con capturas de pantalla y pasos concretos para Render.

Dime cuál de estas acciones prefieres y procedo.

Fin del documento
