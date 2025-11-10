import api from './api';

export interface ReporteProyecto {
  proyecto: any;
  actividades: any[];
  progreso: {
    total: number;
    completadas: number;
    en_progreso: number;
    pendientes: number;
    porcentaje: number;
  };
  integrantes: any[];
}

export interface ReporteCampo {
  campo: any;
  proyectos: any[];
  estadisticas: {
    total_proyectos: number;
    proyectos_activos: number;
    proyectos_completados: number;
    total_integrantes: number;
  };
}

export interface ReporteSemillero {
  semillero: any;
  campos: any[];
  proyectos: any[];
  estadisticas: {
    total_campos: number;
    total_proyectos: number;
    total_integrantes: number;
  };
}

export const reportesService = {
  /**
   * Generar reporte completo de un proyecto
   */
  async generarReporteProyecto(proyectoId: number): Promise<ReporteProyecto> {
    const response = await api.get(`/reportes/proyecto/${proyectoId}`);
    return response.data;
  },

  /**
   * Generar reporte de un campo de investigación
   */
  async generarReporteCampo(campoId: number): Promise<ReporteCampo> {
    const response = await api.get(`/reportes/campo/${campoId}`);
    return response.data;
  },

  /**
   * Generar reporte de un semillero
   */
  async generarReporteSemillero(semilleroId: number): Promise<ReporteSemillero> {
    const response = await api.get(`/reportes/semillero/${semilleroId}`);
    return response.data;
  },

  /**
   * Generar reporte de múltiples proyectos
   */
  async generarReporteMultipleProyectos(proyectos: number[]): Promise<any> {
    const response = await api.post('/reportes/proyectos-multiple', { proyectos });
    return response.data;
  },

  /**
   * Generar reporte PDF de un proyecto
   */
  async generarReportePDF(proyectoId: number): Promise<Blob> {
    const response = await api.get(`/reportes/proyecto/${proyectoId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Generar reporte Excel de un proyecto
   */
  async generarReporteExcel(proyectoId: number): Promise<Blob> {
    const response = await api.get(`/reportes/proyecto/${proyectoId}/excel`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Generar reporte PDF de un campo
   */
  async generarReporteCampoPDF(campoId: number): Promise<Blob> {
    const response = await api.get(`/reportes/campo/${campoId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Generar reporte Excel de un campo
   */
  async generarReporteCampoExcel(campoId: number): Promise<Blob> {
    const response = await api.get(`/reportes/campo/${campoId}/excel`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Exportar reporte personalizado
   */
  async exportarReporte(params: {
    tipo: 'proyecto' | 'campo' | 'semillero';
    id: number;
    formato: 'pdf' | 'excel';
    incluir?: string[];
  }): Promise<Blob> {
    const response = await api.post('/reportes/exportar', params, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Exportar PDF general (proyectos, actividades, miembros)
   */
  async exportarPDFGeneral(tipo: string, params: any): Promise<Blob> {
    const response = await api.post(`/reportes/${tipo}/pdf`, params, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Exportar Excel general (proyectos, actividades, miembros)
   */
  async exportarExcelGeneral(tipo: string, params: any): Promise<Blob> {
    const response = await api.post(`/reportes/${tipo}/excel`, params, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Descargar archivo blob como descarga en el navegador
   */
  descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
