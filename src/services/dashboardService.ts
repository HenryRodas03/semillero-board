import api from './api';

// Interfaces para la respuesta del dashboard
export interface DashboardStats {
  proyectos_activos: number;
  tareas_completadas: number;
  tareas_pendientes: number;
  progreso_general: number;
}

export interface Campo {
  id: number;
  nombre: string;
}

export interface Semillero {
  id: number;
  nombre: string;
}

export interface ProyectoReciente {
  id: number;
  titulo: string;
  estado: string;
  porcentaje_avance: string;
  campo?: Campo;
  fecha_actualizacion: string;
  total_actividades?: number;
  actividades_completadas?: number;
  mis_actividades?: {
    total: number;
    completadas: number;
    pendientes: number;
  };
}

export interface DashboardResponse {
  rol: string;
  semillero?: Semillero;
  campo?: Campo;
  estadisticas: DashboardStats;
  proyectos_recientes: ProyectoReciente[];
}

// Interfaces legacy (mantener por compatibilidad)
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  estado?: string;
  id_campo?: number;
  fecha_creacion?: string;
  fecha_fin?: string;
  progreso?: number;
}

export const dashboardService = {
  /**
   * Obtener datos del dashboard según el rol del usuario
   * GET /api/dashboard
   */
  getDashboard: async (): Promise<DashboardResponse> => {
    try {
      console.log('📊 Obteniendo datos del dashboard...');
      const response = await api.get('/dashboard');
      console.log('✅ Dashboard obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al obtener dashboard:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los proyectos (legacy)
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
   * Obtener estadísticas generales del dashboard (legacy)
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
      // Si el endpoint no existe, devolver un objeto con valores por defecto
      return {
        proyectos_activos: 0,
        tareas_completadas: 0,
        tareas_pendientes: 0,
        progreso_general: 0
      };
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
