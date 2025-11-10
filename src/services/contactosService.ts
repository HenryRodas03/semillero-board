import api from './api';

export interface Contacto {
  id: number;
  tipo: 'Email' | 'Teléfono' | 'WhatsApp' | 'LinkedIn' | 'Facebook' | 'Twitter' | 'Instagram' | 'Sitio Web' | 'Otro';
  valor: string;
  descripcion?: string;
  id_campo: number;
  es_publico: boolean;
  orden: number;
  campo?: {
    id: number;
    nombre: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateContactoDto {
  tipo: Contacto['tipo'];
  valor: string;
  descripcion?: string;
  id_campo: number;
  es_publico?: boolean;
  orden?: number;
}

export const contactosService = {
  // Obtener todos los contactos (admin)
  async getAll(params?: { id_campo?: number; es_publico?: boolean }): Promise<Contacto[]> {
    const queryParams = new URLSearchParams();
    if (params?.id_campo) queryParams.append('id_campo', params.id_campo.toString());
    if (params?.es_publico !== undefined) queryParams.append('es_publico', params.es_publico.toString());

    const response = await api.get(`/contactos?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener contactos públicos
  async getPublicos(params?: { id_campo?: number }): Promise<Contacto[]> {
    const queryParams = new URLSearchParams();
    if (params?.id_campo) queryParams.append('id_campo', params.id_campo.toString());

    const response = await api.get(`/contactos/publicos?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener un contacto por ID
  async getById(id: number): Promise<Contacto> {
    const response = await api.get(`/contactos/${id}`);
    return response.data;
  },

  // Obtener un contacto público por ID
  async getPublicoById(id: number): Promise<Contacto> {
    const response = await api.get(`/contactos/${id}/publico`);
    return response.data;
  },

  // Crear un contacto
  async create(data: CreateContactoDto): Promise<Contacto> {
    const response = await api.post('/contactos', data);
    return response.data;
  },

  // Actualizar un contacto
  async update(id: number, data: Partial<CreateContactoDto>): Promise<Contacto> {
    const response = await api.put(`/contactos/${id}`, data);
    return response.data;
  },

  // Eliminar un contacto
  async delete(id: number): Promise<void> {
    await api.delete(`/contactos/${id}`);
  },

  // Obtener contactos por campo de investigación
  async getByCampo(id_campo: number, esPublico?: boolean): Promise<Contacto[]> {
    const url = esPublico 
      ? `/contactos/campo/${id_campo}/publicos`
      : `/contactos/campo/${id_campo}`;
    const response = await api.get(url);
    return response.data;
  }
};
