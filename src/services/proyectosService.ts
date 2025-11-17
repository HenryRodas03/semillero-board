import api from './api';

export interface Proyecto {
  id?: number;
  titulo: string;
  descripcion?: string;
  id_estado: number;
  id_campo: number;
  url?: string;
  ruta_foto?: string;
  porcentaje_avance?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProyectoDto {
  titulo: string;
  descripcion?: string;
  id_estado: number;
  id_campo: number;
  url?: string;
  ruta_foto?: string;
  porcentaje_avance?: number;
}

export const proyectosService = {
  /**
   * Obtener todos los proyectos
   * GET /api/projects
   */
  getAll: async (params?: any): Promise<Proyecto[]> => {
    console.log('📋 Obteniendo todos los proyectos...');
    const response = await api.get('/projects', { params });
    const data = response.data;
    const proyectos = data.projects || data.proyectos || data.data || data;
    console.log('✅ Proyectos obtenidos:', proyectos.length);
    return Array.isArray(proyectos) ? proyectos : [];
  },

  /**
   * Obtener un proyecto por ID
   * GET /api/projects/:id
   */
  getById: async (id: number): Promise<Proyecto> => {
    console.log(`🔍 Obteniendo proyecto ${id}...`);
    const response = await api.get(`/projects/${id}`);
    const data = response.data;
    return data.project || data.proyecto || data.data || data;
  },

  /**
   * Crear un nuevo proyecto
   * POST /api/projects
   */
  create: async (data: CreateProyectoDto): Promise<Proyecto> => {
    console.log('🚀 Creando nuevo proyecto:', data);
    
    // Validar campos requeridos
    if (!data.titulo) {
      throw new Error('El título del proyecto es requerido');
    }
    if (!data.id_estado) {
      throw new Error('El estado del proyecto es requerido');
    }
    if (!data.id_campo) {
      throw new Error('El campo de investigación es requerido');
    }

    const response = await api.post('/projects', data);
    console.log('✅ Proyecto creado:', response.data);
    
    const result = response.data;
    return result.data || result.project || result.proyecto || result;
  },

  /**
   * Actualizar un proyecto existente
   * PUT /api/projects/:id
   */
  update: async (id: number, data: Partial<CreateProyectoDto>): Promise<Proyecto> => {
    console.log(`📝 Actualizando proyecto ${id}:`, data);
    const response = await api.put(`/projects/${id}`, data);
    console.log('✅ Proyecto actualizado:', response.data);
    
    const result = response.data;
    return result.data || result.project || result.proyecto || result;
  },

  /**
   * Eliminar un proyecto
   * DELETE /api/projects/:id
   */
  delete: async (id: number): Promise<void> => {
    console.log(`🗑️ Eliminando proyecto ${id}...`);
    const response = await api.delete(`/projects/${id}`);
    console.log('✅ Proyecto eliminado:', response.data);
  },

  // --- Métodos adicionales ---

  /**
   * Obtener actividades de un proyecto
   * GET /api/projects/:id/actividades
   */
  getActividades: async (id: number): Promise<any> => {
    console.log(`📋 Obteniendo actividades del proyecto ${id}...`);
    const response = await api.get(`/projects/${id}/actividades`);
    console.log('✅ Actividades obtenidas:', response.data);
    return response.data;
  },

  /**
   * Obtener integrantes de un proyecto
   */
  getIntegrantes: async (id: number): Promise<any[]> => {
    const response = await api.get(`/projects/${id}/integrantes`);
    return response.data.integrantes || response.data;
  },

  /**
   * Actualizar progreso del proyecto
   */
  updateProgress: async (id: number, porcentaje: number): Promise<any> => {
    const response = await api.patch(`/projects/${id}/progress`, { 
      porcentaje_avance: porcentaje 
    });
    return response.data;
  },
};
