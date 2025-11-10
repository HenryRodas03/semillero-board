import api from './api';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  avatar?: string;
  telefono?: string;
  es_activo: boolean;
  id_rol: number;
  rol?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  avatar?: string;
  telefono?: string;
  id_rol: number;
  es_activo?: boolean;
}

export interface UpdateUsuarioDto {
  email?: string;
  nombre?: string;
  apellido?: string;
  avatar?: string;
  telefono?: string;
  id_rol?: number;
  es_activo?: boolean;
}

export const usuariosService = {
  // Obtener todos los usuarios (admin)
  async getAll(params?: { es_activo?: boolean; id_rol?: number; search?: string }): Promise<Usuario[]> {
    const queryParams = new URLSearchParams();
    if (params?.es_activo !== undefined) {
      queryParams.append('es_activo', params.es_activo.toString());
    }
    if (params?.id_rol) {
      queryParams.append('id_rol', params.id_rol.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const response = await api.get(`/usuarios?${queryParams.toString()}`);
    return response.data || [];
  },

  // Obtener un usuario por ID
  async getById(id: number): Promise<Usuario> {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Crear un usuario
  async create(data: CreateUsuarioDto): Promise<Usuario> {
    // Map frontend DTO to backend expected field names
    // Backend expects: { nombre, correo, contrasena, id_rol, ... }
    const payload: any = {
      nombre: data.nombre,
      correo: data.email || (data as any).correo || undefined,
      contrasena: (data as any).password || (data as any).contrasena || undefined,
      apellido: (data as any).apellido,
      id_rol: data.id_rol,
      avatar: data.avatar,
      telefono: data.telefono,
      es_activo: data.es_activo
    };
    // remove undefined fields
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    // DEBUG: log payload temporarily to inspect what we send to backend
    // (remove or comment out this log after debugging)
    try {
      // eslint-disable-next-line no-console
      console.log('DEBUG POST /usuarios payload ->', payload);
    } catch (e) {
      // ignore
    }

    try {
      const response = await api.post('/usuarios', payload);
      return response.data;
    } catch (error: any) {
      // DEBUG: log server error body to help diagnose 400s
      try {
        // eslint-disable-next-line no-console
        console.error('DEBUG POST /usuarios error ->', error.response?.data || error.message || error);
      } catch (e) {
        // ignore logging errors
      }
      throw error;
    }
  },

  // Actualizar un usuario
  async update(id: number, data: UpdateUsuarioDto): Promise<Usuario> {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  // Eliminar un usuario
  async delete(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },

  // Activar/Desactivar un usuario
  async toggleEstado(id: number, es_activo: boolean): Promise<Usuario> {
    const response = await api.patch(`/usuarios/${id}/estado`, { es_activo });
    return response.data;
  },

  // Cambiar contraseña de un usuario (admin)
  async changePassword(id: number, nueva_password: string): Promise<void> {
    await api.patch(`/usuarios/${id}/password`, { nueva_password });
  },

  // Obtener el perfil del usuario autenticado
  async getProfile(): Promise<Usuario> {
    const response = await api.get('/usuarios/perfil');
    return response.data;
  },

  // Actualizar el perfil del usuario autenticado
  async updateProfile(data: Partial<UpdateUsuarioDto>): Promise<Usuario> {
    const response = await api.put('/usuarios/perfil', data);
    return response.data;
  }
};
