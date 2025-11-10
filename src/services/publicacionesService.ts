import api from './api';

export interface Publicacion {
  id: number;
  titulo: string;
  descripcion?: string;
  tipo: 'Artículo' | 'Paper' | 'Poster' | 'Libro' | 'Capítulo' | 'Tesis' | 'Otro';
  autores: string;
  fecha_publicacion: string;
  editorial?: string;
  doi?: string;
  url?: string;
  archivo?: string;
  imagen?: string;
  id_campo: number;
  es_publico: boolean;
  orden: number;
  campo?: {
    id: number;
    nombre: string;
    imagen?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreatePublicacionDto {
  titulo: string;
  descripcion?: string;
  tipo: Publicacion['tipo'];
  autores: string;
  fecha_publicacion: string;
  editorial?: string;
  doi?: string;
  url?: string;
  archivo?: string;
  imagen?: string;
  id_campo: number;
  es_publico?: boolean;
  orden?: number;
}

export const publicacionesService = {
  // Obtener todas las publicaciones (admin)
  async getAll(params?: { id_campo?: number; es_publico?: boolean; tipo?: string; desde?: string; hasta?: string }): Promise<Publicacion[]> {
    const queryParams = new URLSearchParams();
    if (params?.id_campo) queryParams.append('id_campo', params.id_campo.toString());
    if (params?.es_publico !== undefined) queryParams.append('es_publico', params.es_publico.toString());
    if (params?.tipo) queryParams.append('tipo', params.tipo);
    if (params?.desde) queryParams.append('desde', params.desde);
    if (params?.hasta) queryParams.append('hasta', params.hasta);

    const response = await api.get(`/publicaciones?${queryParams.toString()}`);
    return response.data || [];
  },

  // Obtener publicaciones públicas
  async getPublicas(params?: { id_campo?: number; tipo?: string; desde?: string; hasta?: string }): Promise<Publicacion[]> {
    const queryParams = new URLSearchParams();
    if (params?.id_campo) queryParams.append('id_campo', params.id_campo.toString());
    if (params?.tipo) queryParams.append('tipo', params.tipo);
    if (params?.desde) queryParams.append('desde', params.desde);
    if (params?.hasta) queryParams.append('hasta', params.hasta);

    const response = await api.get(`/publicaciones/publicas?${queryParams.toString()}`);
    return response.data || [];
  },

  // Obtener una publicación por ID
  async getById(id: number): Promise<Publicacion> {
    const response = await api.get(`/publicaciones/${id}`);
    return response.data;
  },

  // Obtener una publicación pública por ID
  async getPublicaById(id: number): Promise<Publicacion> {
    const response = await api.get(`/publicaciones/${id}/publica`);
    return response.data;
  },

  // Crear una publicación
  async create(data: CreatePublicacionDto): Promise<Publicacion> {
    const response = await api.post('/publicaciones', data);
    return response.data;
  },

  // Actualizar una publicación
  async update(id: number, data: Partial<CreatePublicacionDto>): Promise<Publicacion> {
    const response = await api.put(`/publicaciones/${id}`, data);
    return response.data;
  },

  // Eliminar una publicación
  async delete(id: number): Promise<void> {
    await api.delete(`/publicaciones/${id}`);
  },

  // Obtener publicaciones por campo de investigación
  async getByCampo(id_campo: number, esPublico?: boolean): Promise<Publicacion[]> {
    const url = esPublico 
      ? `/publicaciones/campo/${id_campo}/publicas`
      : `/publicaciones/campo/${id_campo}`;
    const response = await api.get(url);
    return response.data || [];
  }
};
