import api from './api';

export interface Semillero {
  id: number;
  nombre: string;
  descripcion?: string;
  contacto?: string;
  ruta_imagen?: string;
  activo: number; // 1 = abierto, 0 = cerrado
  lider?: number;
  liderUsuario?: {
    id: number;
    nombre: string;
    correo: string;
  };
  linea?: {
    id: number;
    nombre: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateSemilleroDto {
  nombre: string;
  descripcion?: string;
  logo?: string;
  es_activo?: boolean;
  id_linea?: number;
}

export const semillerosService = {
  // Obtener todos los semilleros
  async getAll(params?: { es_activo?: boolean }): Promise<Semillero[]> {
    const queryParams = new URLSearchParams();
    if (params?.es_activo !== undefined) {
      queryParams.append('es_activo', params.es_activo.toString());
    }
    
    const response = await api.get(`/semilleros?${queryParams.toString()}`);
    const data = response.data;
    // Algunas respuestas vienen con la forma { semilleros: [...] }
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).semilleros)) return (data as any).semilleros;
    // Fallback
    return [];
  },

  // Obtener el semillero del líder autenticado
  async getMiSemillero(): Promise<Semillero> {
    const response = await api.get('/semilleros/mi-semillero/info');
    const data = response.data;
    // El backend puede envolver la respuesta: { semillero: {...} } o devolver el objeto directamente
    if (data && (data as any).semillero) return (data as any).semillero;
    // Algunas versiones devuelven { semilleros: [...] }
    if (data && Array.isArray((data as any).semilleros) && (data as any).semilleros.length > 0) return (data as any).semilleros[0];
    return data;
  },

  // Obtener los campos de investigación del semillero del líder
  async getMisCampos(): Promise<any[]> {
    const response = await api.get('/semilleros/mi-semillero/campos');
    const data = response.data;
    // Normalizar: puede venir como array directo, o { campos: [...] }, o { data: { campos: [...] } }
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).campos)) return (data as any).campos;
    if (data && data.data && Array.isArray((data as any).data.campos)) return (data as any).data.campos;
    return [];
  },

  // Actualizar la información del semillero del líder
  async actualizarMiSemillero(data: FormData): Promise<Semillero> {
    const response = await api.put('/semilleros/mi-semillero/actualizar', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Eliminar la imagen del semillero del líder
  async eliminarImagenMiSemillero(): Promise<void> {
    await api.delete('/semilleros/mi-semillero/imagen');
  },

  // Cambiar el estado (abierto/cerrado) del semillero del líder
  async cambiarEstadoMiSemillero(nuevoEstado: number): Promise<Semillero> {
    const response = await api.patch('/semilleros/mi-semillero/estado', { activo: nuevoEstado });
    return response.data;
  },

  // Obtener semilleros públicos (activos)
  async getPublicos(): Promise<Semillero[]> {
    const response = await api.get('/semilleros/publicos');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).semilleros)) return (data as any).semilleros;
    return [];
  },

  // Obtener un semillero por ID
  async getById(id: number): Promise<Semillero> {
    const response = await api.get(`/semilleros/${id}`);
    return response.data;
  },

  // Obtener un semillero público por ID
  async getPublicoById(id: number): Promise<Semillero> {
    const response = await api.get(`/semilleros/${id}/publico`);
    return response.data;
  },

  // Crear un semillero
  async create(data: CreateSemilleroDto): Promise<Semillero> {
    const response = await api.post('/semilleros', data);
    return response.data;
  },

  // Actualizar un semillero
  async update(id: number, data: Partial<CreateSemilleroDto>): Promise<Semillero> {
    const response = await api.put(`/semilleros/${id}`, data);
    return response.data;
  },

  // Eliminar un semillero
  async delete(id: number): Promise<void> {
    await api.delete(`/semilleros/${id}`);
  },

  // Activar/Desactivar un semillero
  async toggleEstado(id: number, es_activo: boolean): Promise<Semillero> {
    const response = await api.patch(`/semilleros/${id}/estado`, { es_activo });
    return response.data;
  }
};
