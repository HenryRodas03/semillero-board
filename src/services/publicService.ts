import api from './publicApi';

export interface SemilleroPublico {
  id: number;
  nombre: string;
  descripcion: string;
  ruta_imagen?: string;
  linea_investigacion?: string;
  campos?: any[];
  activo: number;
}

export interface ProyectoPublico {
  id: number;
  titulo: string;
  descripcion: string;
  ruta_foto?: string;
  estado_nombre: string;
  campo_nombre: string;
  porcentaje_avance: number;
  fecha_creacion: string;
}

export interface IntegranteCampo {
  id: number;
  nombre: string;
  correo?: string;
  rol_nombre?: string;
  fecha_ingreso?: string;
  fecha_salida?: string;
}

export interface ContactoCampo {
  email?: string;
  telefono?: string;
  redes_sociales?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  delegado?: {
    nombre: string;
    correo: string;
  };
}

export const publicService = {
  async getSemilleros(): Promise<SemilleroPublico[]> {
    const response = await api.get('/public/semilleros');
    return response.data.data || response.data.semilleros || [];
  },

  async getSemilleroDetalle(id: number): Promise<SemilleroPublico> {
    const response = await api.get(`/public/semilleros/${id}`);
    return response.data.data || response.data.semillero || response.data;
  },

  async getProyectos(params?: {
    estado?: string;
    campo?: number;
  }): Promise<ProyectoPublico[]> {
    const queryParams = new URLSearchParams();
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.campo) queryParams.append('campo', params.campo.toString());
    const response = await api.get(`/public/proyectos?${queryParams.toString()}`);
    return response.data.data || response.data.proyectos || [];
  },

  async getProyectoDetalle(id: number): Promise<ProyectoPublico> {
    const response = await api.get(`/public/proyectos/${id}`);
    return response.data.data || response.data.proyecto || response.data;
  },

  async getIntegrantesCampo(id: number, activos?: boolean): Promise<IntegranteCampo[]> {
    const queryParams = activos !== undefined ? `?activos=${activos}` : '';
    const response = await api.get(`/public/campos/${id}/integrantes${queryParams}`);
    return response.data.data || response.data.integrantes || [];
  },

  async getHorariosCampo(id: number): Promise<any> {
    const response = await api.get(`/public/campos/${id}/horarios`);
    return response.data.data || response.data;
  },

  async getContactoCampo(id: number): Promise<ContactoCampo> {
    const response = await api.get(`/public/campos/${id}/contacto`);
    return response.data.data || response.data.contacto || response.data;
  }
};
