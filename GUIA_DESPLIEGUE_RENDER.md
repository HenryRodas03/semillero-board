# 🚀 Guía de Despliegue en Render

## 📋 Configuración del Proyecto

Este proyecto ya está configurado con los archivos necesarios para el despliegue en Render:

### Archivos de Configuración

1. **`render.yaml`** - Configuración de servicio de Render
2. **`public/_redirects`** - Manejo de rutas de React Router
3. **`.env`** - Variables de entorno (URL del API backend)

## 🔧 Pasos para Desplegar en Render

### 1. Preparar el Repositorio

Asegúrate de que todos los cambios estén commiteados y pusheados a GitHub:

```bash
git add .
git commit -m "Configuración para despliegue en Render"
git push origin main
```

### 2. Crear el Servicio en Render

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"Static Site"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `semillero-board`

### 3. Configuración del Static Site

Usa la siguiente configuración:

#### **Name (Nombre)**
```
semillero-board
```
o el nombre que prefieras

#### **Branch (Rama)**
```
main
```

#### **Root Directory (Directorio raíz)**
```
(dejar vacío)
```

#### **Build Command (Comando de construcción)**
```
npm install && npm run build
```

#### **Publish Directory (Directorio de publicación)**
```
dist
```

### 4. Variables de Entorno

En la sección **"Environment"**, agrega:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://gestionproyectos-8cuz.onrender.com/api` |

### 5. Auto-Deploy

- ✅ Habilita **"Auto-Deploy"** para que se despliegue automáticamente con cada push a `main`

### 6. Click en "Create Static Site"

Render comenzará a:
1. Clonar tu repositorio
2. Instalar dependencias (`npm install`)
3. Construir el proyecto (`npm run build`)
4. Desplegar el contenido de `dist/`

## ⚙️ Configuración Avanzada (Opcional)

### Headers de Seguridad

El archivo `render.yaml` ya incluye headers de seguridad básicos:
- `X-Frame-Options: SAMEORIGIN`

### Rutas de React Router

El archivo `public/_redirects` asegura que todas las rutas sean manejadas por React Router:
```
/*    /index.html   200
```

Esto redirige todas las peticiones al `index.html`, permitiendo que React Router maneje las rutas del lado del cliente.

## 🔍 Solución de Problemas

### Error: "There's an error above"

Si ves este error en Render:

1. **Verifica que los campos estén correctos:**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Asegúrate de que el archivo `render.yaml` esté en la raíz del proyecto**

3. **Verifica que las dependencias se instalen correctamente:**
   - Revisa los logs de build en Render
   - Busca errores de npm o TypeScript

### Error: "Failed to build"

1. **Verifica que el build funcione localmente:**
   ```bash
   npm run build
   ```

2. **Revisa los logs de Render** para ver errores específicos

3. **Asegúrate de que todas las variables de entorno estén configuradas**

### Error 404 en rutas

Si las rutas de React Router dan 404:

1. **Verifica que el archivo `public/_redirects` exista**
2. **Asegúrate de que contenga:**
   ```
   /*    /index.html   200
   ```

### Problemas de API

Si el frontend no se conecta al backend:

1. **Verifica la variable de entorno `VITE_API_URL`**
2. **Asegúrate de que el backend esté activo en Render**
3. **Verifica CORS en el backend**

## 🌐 Acceso a la Aplicación

Una vez desplegado, Render te dará una URL como:
```
https://semillero-board.onrender.com
```

Puedes acceder a tu aplicación desde cualquier navegador.

## 📝 Notas Importantes

1. **Primer Deploy**: El primer despliegue puede tardar 3-5 minutos
2. **Auto-Deploy**: Cada push a `main` disparará un nuevo deploy
3. **Build Time**: El tiempo de build típicamente es de 2-3 minutos
4. **Free Tier**: Los sitios estáticos gratuitos pueden tener límite de ancho de banda

## 🔄 Actualizar el Despliegue

Para actualizar la aplicación desplegada:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Render detectará el push y desplegará automáticamente la nueva versión.

## ✅ Checklist de Despliegue

- [x] Archivo `render.yaml` configurado
- [x] Archivo `public/_redirects` creado
- [x] Variables de entorno configuradas
- [x] Build command: `npm install && npm run build`
- [x] Publish directory: `dist`
- [x] Auto-deploy habilitado
- [ ] Repositorio pusheado a GitHub
- [ ] Servicio creado en Render
- [ ] Aplicación desplegada y funcionando

## 🎯 URLs del Proyecto

- **Backend API**: https://gestionproyectos-8cuz.onrender.com/api
- **Frontend** (después de desplegar): https://[tu-app].onrender.com

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de build en Render
2. Verifica que el build funcione localmente
3. Consulta la [documentación oficial de Render](https://render.com/docs/static-sites)
