import api from './api';

export interface Evento {
  id: number;
  titulo: string;
  descripcion?: string;
  tipo: 'Reunión' | 'Taller' | 'Presentación' | 'Conferencia' | 'Otro';
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion?: string;
  enlace_virtual?: string;
  id_campo: number;
  id_creador: number;
  estado: 'Programado' | 'En Curso' | 'Finalizado' | 'Cancelado';
  es_publico: boolean;
  campo?: {
    id: number;
    nombre: string;
    imagen?: string;
  };
  creador?: {
    id: number;
    nombre: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventoDto {
  titulo: string;
  descripcion?: string;
  tipo: Evento['tipo'];
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion?: string;
  enlace_virtual?: string;
  id_campo: number;
  estado?: Evento['estado'];
  es_publico?: boolean;
}

export const eventosService = {
  // Obtener todos los eventos (admin)
  async getAll(params?: { id_campo?: number; es_publico?: boolean; tipo?: string; desde?: string; hasta?: string }): Promise<Evento[]> {
    const queryParams = new URLSearchParams();
    if (params?.id_campo) queryParams.append('id_campo', params.id_campo.toString());
    if (params?.es_publico !== undefined) queryParams.append('es_publico', params.es_publico.toString());
    if (params?.tipo) queryParams.append('tipo', params.tipo);
    if (params?.desde) queryParams.append('desde', params.desde);
    if (params?.hasta) queryParams.append('hasta', params.hasta);

    const response = await api.get(`/eventos?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener eventos públicos
  async getPublicos(params?: { id_campo?: number; tipo?: string; desde?: string; hasta?: string }): Promise<Evento[]> {
    const queryParams = new URLSearchParams();
    if (params?.id_campo) queryParams.append('id_campo', params.id_campo.toString());
    if (params?.tipo) queryParams.append('tipo', params.tipo);
    if (params?.desde) queryParams.append('desde', params.desde);
    if (params?.hasta) queryParams.append('hasta', params.hasta);

    const response = await api.get(`/eventos/publicos?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener un evento por ID
  async getById(id: number): Promise<Evento> {
    const response = await api.get(`/eventos/${id}`);
    return response.data;
  },

  // Obtener un evento público por ID
  async getPublicoById(id: number): Promise<Evento> {
    const response = await api.get(`/eventos/${id}/publico`);
    return response.data;
  },

  // Crear un evento
  async create(data: CreateEventoDto): Promise<Evento> {
    const response = await api.post('/eventos', data);
    return response.data;
  },

  // Actualizar un evento
  async update(id: number, data: Partial<CreateEventoDto>): Promise<Evento> {
    const response = await api.put(`/eventos/${id}`, data);
    return response.data;
  },

  // Eliminar un evento
  async delete(id: number): Promise<void> {
    await api.delete(`/eventos/${id}`);
  },

  // Obtener eventos por campo de investigación
  async getByCampo(id_campo: number, esPublico?: boolean): Promise<Evento[]> {
    const url = esPublico 
      ? `/eventos/campo/${id_campo}/publicos`
      : `/eventos/campo/${id_campo}`;
    const response = await api.get(url);
    return response.data;
  }
};
