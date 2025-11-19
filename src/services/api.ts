import axios from 'axios';

// Prefer build-time VITE_API_URL, luego runtime variable (window.__RUNTIME_API_URL),
// y finalmente la URL de producción indicada por el equipo si ninguna existe.
const viteUrl = import.meta.env.VITE_API_URL;
const runtimeVar = typeof window !== 'undefined' ? (window as any).__RUNTIME_API_URL : undefined;
const runtimeUrl = viteUrl || runtimeVar || 'https://gestionproyectos-8cuz.onrender.com/api';

const api = axios.create({
  baseURL: runtimeUrl,
});

// Log de depuración para confirmar la URL base que usa el frontend
const detectedSource = viteUrl ? 'VITE_API_URL' : runtimeVar ? 'window.__RUNTIME_API_URL' : 'fallback';
console.debug('API baseURL inicializada:', api.defaults.baseURL, { source: detectedSource });

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Token agregado a ${config.method?.toUpperCase()} ${config.url}`);
    }
    try {
      const base = config.baseURL || api.defaults.baseURL || (typeof window !== 'undefined' ? window.location.origin : undefined);
      const resolved = base && config.url ? new URL(config.url.toString(), base).toString() : config.url;
      console.debug('API Request ->', config.method?.toUpperCase(), resolved, { baseURL: config.baseURL || api.defaults.baseURL, url: config.url });
    } catch (err) {
      console.debug('API Request ->', config.method?.toUpperCase(), config.url, { baseURL: config.baseURL || api.defaults.baseURL });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
