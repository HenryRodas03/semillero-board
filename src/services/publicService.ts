import api from './publicApi';

export interface SemilleroPublico {
  id: number;
  nombre: string;
  descripcion: string;
  imagen?: string;
  linea_investigacion?: string;
  contacto?: string;
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

export interface CampoPublico {
  id: number;
  nombre: string;
  descripcion: string;
  ruta_imagen?: string;
  estado_nombre?: string;
  activo: number;
  horario_reunion?: string;
  contacto_email?: string;
  contacto_redes_sociales?: string;
  lider?: number;
  id_semillero?: number;
  creado_en?: string;
  actualizado_en?: string;
  liderUsuario?: {
    id: number;
    nombre: string;
    correo: string;
  };
  semillero?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  proyectos?: any[];
  integrantes?: any[];
  acceso_completo?: boolean;
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

  async getCampos(): Promise<CampoPublico[]> {
    const response = await api.get('/campos');
    return response.data.campos || [];
  },

  async getCamposBySemillero(idSemillero: number): Promise<CampoPublico[]> {
    const response = await api.get('/campos', {
      params: { id_semillero: idSemillero }
    });
    return response.data.campos || [];
  },

  async getCampoDetalle(id: number): Promise<CampoPublico> {
    const response = await api.get(`/campos/${id}`);
    return response.data.campo || response.data;
  },

  async getProyectosByCampo(idCampo: number): Promise<ProyectoPublico[]> {
    const response = await api.get('/projects', {
      params: { id_campo: idCampo }
    });
    return response.data.projects || response.data.proyectos || [];
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

  async getActividadesProyecto(idProyecto: number): Promise<any[]> {
    const response = await api.get(`/projects/${idProyecto}/actividades`);
    console.log('🔍 Respuesta completa de actividades:', response.data);
    
    // Intentar diferentes estructuras de respuesta
    if (Array.isArray(response.data)) {
      console.log('📦 Respuesta es un array directo');
      return response.data;
    }
    if (response.data.actividades && Array.isArray(response.data.actividades)) {
      console.log('📦 Respuesta en response.data.actividades');
      return response.data.actividades;
    }
    if (response.data.data && Array.isArray(response.data.data)) {
      console.log('📦 Respuesta en response.data.data');
      return response.data.data;
    }
    
    console.warn('⚠️ No se encontró array de actividades en la respuesta');
    return [];
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
  },

  // Obtener lista de líderes (públicamente disponible)
  async getLideres(): Promise<{
    lideres: Array<{
      id: number;
      nombre: string;
      correo: string;
      rol: {
        id: number;
        nombre: string;
      };
      es_lider_de: {
        tipo: string;
        nombre: string;
        descripcion: string;
        id: number;
      } | null;
    }>;
    total: number;
  }> {
    const response = await api.get('/users/lideres');
    return response.data;
  }
};
