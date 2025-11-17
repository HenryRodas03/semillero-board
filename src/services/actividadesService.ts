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

  /**
   * Actualizar el estado de una actividad (drag and drop)
   * PUT /api/actividades/:id
   */
  cambiarEstado: async (id: number, id_estado: number) => {
    console.log(`🔄 Cambiando estado de actividad ${id} a estado ${id_estado}`);
    const response = await api.put(`/actividades/${id}`, { id_estado });
    console.log('✅ Estado actualizado:', response.data);
    return response.data;
  },

  /**
   * Crear una nueva actividad
   * POST /api/actividades
   */
  crearActividad: async (data: {
    id_proyecto: number;
    titulo: string;
    descripcion: string;
    id_estado?: number;
    prioridad?: string;
    id_integrante?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) => {
    console.log('➕ Creando nueva actividad:', data);
    const response = await api.post('/actividades', data);
    console.log('✅ Actividad creada:', response.data);
    return response.data;
  },

  /**
   * Actualizar una actividad existente
   * PUT /api/actividades/:id
   */
  actualizarActividad: async (id: number, data: {
    titulo?: string;
    descripcion?: string;
    id_estado?: number;
    prioridad?: string;
    id_integrante?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) => {
    console.log(`✏️ Actualizando actividad ${id}:`, data);
    const response = await api.put(`/actividades/${id}`, data);
    console.log('✅ Actividad actualizada:', response.data);
    return response.data;
  },

  /**
   * Eliminar una actividad
   * DELETE /api/actividades/:id
   */
  eliminarActividad: async (id: number) => {
    console.log(`🗑️ Eliminando actividad ${id}`);
    const response = await api.delete(`/actividades/${id}`);
    console.log('✅ Actividad eliminada:', response.data);
    return response.data;
  },
};
