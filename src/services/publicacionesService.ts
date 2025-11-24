import api from './api';

export interface Publicacion {
  id: number;
  id_campo: number;
  id_usuario?: number;
  titulo: string;
  descripcion?: string;
  tipo?: string;
  imagen_1?: string | null;
  imagen_2?: string | null;
  imagen_3?: string | null;
  fecha_publicacion?: string;
  fecha_actualizacion?: string;
  activo?: number;
  campo_nombre?: string;
  autor_nombre?: string;
}

const publicacionesService = {
  async getAll(params?: { id_campo?: number }) {
    const res = await api.get('/publicaciones', { params });
    // La respuesta tiene estructura: { total, filtros, publicaciones }
    return res.data.publicaciones || res.data;
  },

  async getByCampo(idCampo: number) {
    const res = await api.get(`/publicaciones/campo/${idCampo}`);
    return res.data.publicaciones || res.data;
  },

  async getById(id: number) {
    const res = await api.get(`/publicaciones/${id}`);
    return res.data || res.data.publicacion || null;
  },

  async getMine() {
    const res = await api.get('/publicaciones/mis-publicaciones');
    return res.data.publicaciones || res.data;
  },

  // create/update expect FormData (multipart)
  async create(formData: FormData) {
    // Do NOT set Content-Type manually for FormData; let the browser set the boundary
    const res = await api.post('/publicaciones', formData);
    return res.data;
  },

  async update(id: number, formData: FormData) {
    // Do NOT set Content-Type manually for FormData; let the browser set the boundary
    const res = await api.put(`/publicaciones/${id}`, formData);
    return res.data;
  },

  async deleteImagen(id: number, imagen: string) {
    const res = await api.delete(`/publicaciones/${id}/imagen`, { data: { imagen } });
    return res.data;
  },

  async delete(id: number) {
    const res = await api.delete(`/publicaciones/${id}`);
    return res.data;
  },

  async toggleEstado(id: number, activo?: boolean) {
    const res = await api.patch(`/publicaciones/${id}/estado`, { activo });
    return res.data;
  }
};

export default publicacionesService;

