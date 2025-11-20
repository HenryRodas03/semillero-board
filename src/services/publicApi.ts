import axios from 'axios';

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://gestionproyectos-8cuz.onrender.com/api',
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
