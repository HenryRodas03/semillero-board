import api from './api';

export const proyectosService = {
  getAll: async (params?: any) => {
    const response = await api.get('/projects', { params });
    return response.data.projects || response.data.proyectos || response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/projects/${id}`);
    return response.data.project || response.data.proyecto || response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/projects', data);
    return response.data.project || response.data.proyecto || response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data.project || response.data.proyecto || response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  getTasks: async (id: number) => {
    const response = await api.get(`/projects/${id}/tasks`);
    return response.data.tasks || response.data.tareas || response.data;
  },

  getIntegrantes: async (id: number) => {
    const response = await api.get(`/projects/${id}/integrantes`);
    return response.data.integrantes || response.data;
  },

  updateProgress: async (id: number, porcentaje: number) => {
    const response = await api.patch(`/projects/${id}/progress`, { porcentaje_completado: porcentaje });
    return response.data;
  },
};
