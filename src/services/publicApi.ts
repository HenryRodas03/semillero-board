import axios from 'axios';

const normalizeApiUrl = (u?: string) => {
  if (!u) return undefined;
  try {
    const trimmed = u.replace(/\/+$/g, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  } catch (err) {
    return u;
  }
};

const viteUrlRaw = import.meta.env.VITE_API_URL as string | undefined;
const baseURL = normalizeApiUrl(viteUrlRaw) || 'https://gestionproyectos-8cuz.onrender.com/api';

const publicApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar respuestas de error
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default publicApi;
