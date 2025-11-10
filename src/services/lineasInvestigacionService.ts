import api from './api';

export interface LineaInvestigacion {
  id: number;
  nombre: string;
  descripcion?: string;
  id_campo: number;
  es_activa: boolean;
  campo?: {
    id: number;
    nombre: string;
    imagen?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateLineaInvestigacionDto {
  nombre: string;
  descripcion?: string;
  id_campo: number;
  es_activa?: boolean;
}

export const lineasInvestigacionService = {
  // Obtener todas las líneas de investigación
  async getAll(params?: { id_campo?: number; es_activa?: boolean }): Promise<LineaInvestigacion[]> {
    const queryParams = new URLSearchParams();
    if (params?.id_campo) {
      queryParams.append('id_campo', params.id_campo.toString());
    }
    if (params?.es_activa !== undefined) {
      queryParams.append('es_activa', params.es_activa.toString());
    }

    const response = await api.get(`/lineas-investigacion?${queryParams.toString()}`);
    return response.data || [];
  },

  // Obtener una línea de investigación por ID
  async getById(id: number): Promise<LineaInvestigacion> {
    const response = await api.get(`/lineas-investigacion/${id}`);
    return response.data;
  },

  // Crear una línea de investigación
  async create(data: CreateLineaInvestigacionDto): Promise<LineaInvestigacion> {
    const response = await api.post('/lineas-investigacion', data);
    return response.data;
  },

  // Actualizar una línea de investigación
  async update(id: number, data: Partial<CreateLineaInvestigacionDto>): Promise<LineaInvestigacion> {
    const response = await api.put(`/lineas-investigacion/${id}`, data);
    return response.data;
  },

  // Eliminar una línea de investigación
  async delete(id: number): Promise<void> {
    await api.delete(`/lineas-investigacion/${id}`);
  },

  // Obtener líneas de investigación por campo
  async getByCampo(id_campo: number, es_activa?: boolean): Promise<LineaInvestigacion[]> {
    const queryParams = new URLSearchParams();
    if (es_activa !== undefined) {
      queryParams.append('es_activa', es_activa.toString());
    }

    const response = await api.get(`/lineas-investigacion/campo/${id_campo}?${queryParams.toString()}`);
    return response.data || [];
  },

  // Activar/Desactivar una línea de investigación
  async toggleEstado(id: number, es_activa: boolean): Promise<LineaInvestigacion> {
    const response = await api.patch(`/lineas-investigacion/${id}/estado`, { es_activa });
    return response.data;
  }
};
