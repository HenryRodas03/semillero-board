import api from './api';

export const camposService = {
  getAll: async () => {
    const response = await api.get('/campos');
    return response.data.campos || response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/campos/${id}`);
    return response.data.campo || response.data;
  },

  getDetalleLider: async (id: number) => {
    const response = await api.get(`/campos/${id}/detalle-lider`);
    return response.data;
  },

  create: async (data: FormData) => {
    const response = await api.post('/campos', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.campo || response.data;
  },

  update: async (id: number, data: FormData) => {
    const response = await api.put(`/campos/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.campo || response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/campos/${id}`);
    return response.data;
  },

  getProyectos: async (id: number, incluirIntegrantes: boolean = false) => {
    const response = await api.get(`/projects`, {
      params: {
        id_campo: id,
        incluir_integrantes: incluirIntegrantes ? 'true' : 'false'
      }
    });
    return response.data.projects || response.data.proyectos || response.data;
  },

  getIntegrantes: async (id: number) => {
    const response = await api.get(`/public/campos/${id}/integrantes`);
    // La respuesta tiene estructura: { data: { activos: { integrantes: [] }, antiguos: { integrantes: [] } } }
    if (response.data.data) {
      const data = response.data.data;
      // Combinar integrantes activos y antiguos, priorizando activos
      const integrantesActivos = data.activos?.integrantes || [];
      const integrantesAntiguos = data.antiguos?.integrantes || [];
      
      // Convertir ambos arrays al formato esperado
      const todosLosIntegrantes = [...integrantesActivos, ...integrantesAntiguos].map((integrante: any) => ({
        id: integrante.id,
        nombre: integrante.usuario.nombre,
        correo: integrante.usuario.correo,
        rol_id: integrante.rol_id,
        fecha_incorporacion: integrante.fecha_incorporacion,
        esActivo: integrantesActivos.includes(integrante),
        usuario: {
          id: integrante.usuario.id,
          nombre: integrante.usuario.nombre,
          correo: integrante.usuario.correo
        }
      }));
      
      return todosLosIntegrantes;
    }
    return response.data.integrantes || response.data.members || response.data;
  },

  agregarIntegrante: async (id: number, id_usuario: number/*, id_rol?: number*/) => {
    // Backend expects only { id_usuario } when adding integrante
    const payload: any = { id_usuario };
    const response = await api.post(`/campos/${id}/integrantes`, payload);
    return response.data;
  },

  quitarIntegrante: async (id: number, id_integrante: number) => {
    const response = await api.delete(`/campos/${id}/integrantes/${id_integrante}`);
    return response.data;
  },

  cambiarLider: async (id: number, nuevo_lider_id: number) => {
    const response = await api.patch(`/campos/${id}/cambiar-lider`, {
      nuevo_lider_id
    });
    return response.data;
  },

  getUsuariosDisponibles: async (id: number, filtros?: {
    buscar?: string;
    rol?: number;
    semillero?: boolean;
  }) => {
    const params: any = {};
    if (filtros?.buscar) params.buscar = filtros.buscar;
    if (filtros?.rol) params.rol = filtros.rol;
    if (filtros?.semillero) params.semillero = 'true';

    const response = await api.get(`/campos/${id}/usuarios-disponibles`, { params });
    return response.data;
  },

  getLideresDisponibles: async (id: number) => {
    const response = await api.get(`/campos/${id}/lideres-disponibles`);
    return response.data;
  },

  updateHorario: async (id: number, horario_reunion: string) => {
    const response = await api.put(`/campo-management/${id}/horario`, {
      horario_reunion
    });
    return response.data;
  },

  updateContacto: async (id: number, contacto: any) => {
    const response = await api.put(`/campo-management/${id}/contacto`, contacto);
    return response.data;
  },

  getInfoCompleta: async (id: number) => {
    const response = await api.get(`/campo-management/${id}/info-completa`);
    return response.data.campo || response.data;
  },

  getMiCampo: async () => {
    const response = await api.get('/campos/mi-campo/info');
    return response.data;
  },

  actualizarMiCampo: async (data: FormData) => {
    const response = await api.put('/campos/mi-campo/actualizar', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  eliminarImagenMiCampo: async () => {
    const response = await api.delete('/campos/mi-campo/imagen');
    return response.data;
  },

  getMisCampos: async () => {
    const response = await api.get('/semilleros/mi-semillero/campos');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).campos)) return (data as any).campos;
    if (data && data.data && Array.isArray((data as any).data.campos)) return (data as any).data.campos;
    return [];
  },

  cambiarEstado: async (id: number, activo: number) => {
    const response = await api.patch(`/campos/${id}/estado`, { activo });
    return response.data;
  },

  getMisCamposUsuario: async () => {
    const response = await api.get('/campos/usuario/mis-campos');
    return response.data;
  }
};
