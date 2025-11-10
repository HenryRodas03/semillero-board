import api from './api';

export interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string;
  modulo: string;
  created_at?: string;
  updated_at?: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  es_sistema: boolean;
  permisos?: Permiso[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateRolDto {
  nombre: string;
  descripcion?: string;
  permisos?: number[];
}

export const rolesService = {
  // Obtener todos los roles
  async getAll(): Promise<Rol[]> {
    const response = await api.get('/roles');
    return response.data || [];
  },

  // Obtener un rol por ID
  async getById(id: number): Promise<Rol> {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Crear un rol
  async create(data: CreateRolDto): Promise<Rol> {
    const response = await api.post('/roles', data);
    return response.data;
  },

  // Actualizar un rol
  async update(id: number, data: Partial<CreateRolDto>): Promise<Rol> {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  // Eliminar un rol
  async delete(id: number): Promise<void> {
    await api.delete(`/roles/${id}`);
  },

  // Obtener todos los permisos disponibles
  async getPermisos(): Promise<Permiso[]> {
    const response = await api.get('/permisos');
    return response.data || [];
  },

  // Asignar permisos a un rol
  async asignarPermisos(id_rol: number, permisos: number[]): Promise<Rol> {
    const response = await api.post(`/roles/${id_rol}/permisos`, { permisos });
    return response.data;
  },

  // Remover permisos de un rol
  async removerPermisos(id_rol: number, permisos: number[]): Promise<Rol> {
    const response = await api.delete(`/roles/${id_rol}/permisos`, { data: { permisos } });
    return response.data;
  }
};
