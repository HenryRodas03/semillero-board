import axios from 'axios';

// Prefer runtime variable (window.__RUNTIME_API_URL), luego VITE_API_URL y finalmente
// la URL de producción indicada por el equipo si ninguna de las dos anteriores existe.
const runtimeUrl = (typeof window !== 'undefined' && (window as any).__RUNTIME_API_URL) || import.meta.env.VITE_API_URL || 'https://gestionproyectos-8cuz.onrender.com/api';

const api = axios.create({
  baseURL: runtimeUrl,
});

// Log de depuración para confirmar la URL base que usa el frontend
console.debug('API baseURL inicializada:', api.defaults.baseURL);

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Token agregado a ${config.method?.toUpperCase()} ${config.url}`);
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
