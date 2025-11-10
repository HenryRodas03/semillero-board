import api from './api';

export const actividadesService = {
  getAll: async (params?: any) => {
    const response = await api.get('/activities', { params });
    return response.data.activities || response.data.actividades || response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/activities/${id}`);
    return response.data.activity || response.data.actividad || response.data;
  },

  getByProyecto: async (idProyecto: number) => {
    const response = await api.get(`/projects/${idProyecto}/activities`);
    return response.data.activities || response.data.actividades || response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/activities', data);
    return response.data.activity || response.data.actividad || response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/activities/${id}`, data);
    return response.data.activity || response.data.actividad || response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },

  updateEstado: async (id: number, id_estado: number) => {
    const response = await api.patch(`/activities/${id}/estado`, { id_estado });
    return response.data;
  },
};
