import api from './api';

export const integrantesService = {
  getAll: async () => {
    const response = await api.get('/integrantes');
    return response.data.integrantes || response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/integrantes/${id}`);
    return response.data.integrante || response.data;
  },

  getByCampo: async (idCampo: number) => {
    const response = await api.get(`/campos/${idCampo}/integrantes`);
    return response.data.integrantes || response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/integrantes', data);
    return response.data.integrante || response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/integrantes/${id}`, data);
    return response.data.integrante || response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/integrantes/${id}`);
    return response.data;
  },

  getDisponibles: async (idProyecto?: number) => {
    const params = idProyecto ? { id_proyecto: idProyecto } : {};
    const response = await api.get('/integrantes/disponibles', { params });
    return response.data.integrantes || response.data;
  },

  asignarAProyecto: async (idIntegrante: number, idProyecto: number, rol?: string) => {
    const response = await api.post(`/integrantes/${idIntegrante}/asignar-proyecto`, {
      id_proyecto: idProyecto,
      rol_proyecto: rol
    });
    return response.data;
  },

  removerDeProyecto: async (idIntegrante: number, idProyecto: number) => {
    const response = await api.delete(`/integrantes/${idIntegrante}/proyectos/${idProyecto}`);
    return response.data;
  }
};
