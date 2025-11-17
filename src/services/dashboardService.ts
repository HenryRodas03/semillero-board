import api from './api';

export interface DashboardStats {
  totalProyectos?: number;
  totalActividades?: number;
  totalIntegrantes?: number;
  actividadesPendientes?: number;
  actividadesEnProgreso?: number;
  actividadesCompletadas?: number;
  proyectosActivos?: number;
}

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  estado?: string;
  id_campo?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  progreso?: number;
}

export const dashboardService = {
  /**
   * Obtener todos los proyectos
   * GET /api/projects
   */
  getProyectos: async (): Promise<Proyecto[]> => {
    try {
      console.log('📊 Obteniendo proyectos del dashboard...');
      const response = await api.get('/projects');
      const data = response.data;
      
      // Normalizar respuesta (puede venir como array o como { projects: [...] })
      const proyectos = Array.isArray(data) ? data : (data.projects || data.proyectos || []);
      
      console.log('✅ Proyectos obtenidos:', proyectos.length);
      return proyectos;
    } catch (error: any) {
      console.error('❌ Error al obtener proyectos:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas generales del dashboard
   * Puedes agregar este endpoint en tu backend si lo necesitas
   */
  getEstadisticas: async (): Promise<DashboardStats> => {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard...');
      const response = await api.get('/dashboard/stats');
      console.log('✅ Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener estadísticas:', error);
      // Si el endpoint no existe, devolver un objeto vacío
      return {};
    }
  },

  /**
   * Obtener proyectos recientes
   */
  getProyectosRecientes: async (limit: number = 5): Promise<Proyecto[]> => {
    try {
      const response = await api.get('/projects', {
        params: { limit, sort: 'recent' }
      });
      const data = response.data;
      return Array.isArray(data) ? data : (data.projects || data.proyectos || []);
    } catch (error: any) {
      console.error('❌ Error al obtener proyectos recientes:', error);
      throw error;
    }
  },

  /**
   * Obtener actividades recientes del usuario
   */
  getActividadesRecientes: async (limit: number = 10): Promise<any[]> => {
    try {
      const response = await api.get('/activities', {
        params: { limit, sort: 'recent' }
      });
      const data = response.data;
      return Array.isArray(data) ? data : (data.activities || data.actividades || []);
    } catch (error: any) {
      console.error('❌ Error al obtener actividades recientes:', error);
      return [];
    }
  },

  /**
   * Obtener resumen de actividades por estado
   */
  getResumenActividades: async (): Promise<{
    pendientes: number;
    enProgreso: number;
    completadas: number;
  }> => {
    try {
      const response = await api.get('/activities/resumen');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener resumen de actividades:', error);
      return { pendientes: 0, enProgreso: 0, completadas: 0 };
    }
  },

  /**
   * Obtener proyectos con su progreso
   */
  getProyectosConProgreso: async (): Promise<Proyecto[]> => {
    try {
      const response = await api.get('/projects?incluir_progreso=true');
      const data = response.data;
      return Array.isArray(data) ? data : (data.projects || data.proyectos || []);
    } catch (error: any) {
      console.error('❌ Error al obtener proyectos con progreso:', error);
      throw error;
    }
  },
};
